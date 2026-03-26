import { NextRequest, NextResponse } from 'next/server'

/* ─────────────────────────────────────────────────────────────
   Inject SEO metadata (XMP + IPTC) into a JPEG or WebP image.

   JPEG structure:
     FF D8            → SOI (Start Of Image)
     FF E0 ...        → APP0 (JFIF header)
     FF E1 ...        → APP1 (EXIF or XMP — we insert XMP here)
     ...              → rest of file

   We insert one APP1 block containing XMP right after SOI.
   XMP is human-readable XML stored verbatim; Google, Lightroom,
   Photoshop and most image editors can read it.
   ───────────────────────────────────────────────────────────── */

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function buildXMP(data: {
  altText: string
  metaTitle: string
  metaDescription: string
  keywords: string[]
}): string {
  const kws = data.keywords.map(k => `<rdf:li>${escapeXml(k)}</rdf:li>`).join('')
  return (
    '<?xpacket begin="\uFEFF" id="W5M0MpCehiHzreSzNTczkc9d"?>' +
    '<x:xmpmeta xmlns:x="adobe:ns:meta/" x:xmptk="SeoPic 1.0">' +
    '<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">' +
    '<rdf:Description rdf:about=""' +
    ' xmlns:dc="http://purl.org/dc/elements/1.1/"' +
    ' xmlns:xmp="http://ns.adobe.com/xap/1.0/"' +
    ' xmlns:photoshop="http://ns.adobe.com/photoshop/1.0/"' +
    ' xmlns:Iptc4xmpCore="http://iptc.org/std/Iptc4xmpCore/1.0/xmlns/">' +
    `<dc:title><rdf:Alt><rdf:li xml:lang="x-default">${escapeXml(data.metaTitle)}</rdf:li></rdf:Alt></dc:title>` +
    `<dc:description><rdf:Alt><rdf:li xml:lang="x-default">${escapeXml(data.metaDescription)}</rdf:li></rdf:Alt></dc:description>` +
    `<dc:subject><rdf:Bag>${kws}</rdf:Bag></dc:subject>` +
    `<photoshop:Headline>${escapeXml(data.metaTitle)}</photoshop:Headline>` +
    `<photoshop:Caption>${escapeXml(data.altText)}</photoshop:Caption>` +
    `<Iptc4xmpCore:AltTextAccessibility>${escapeXml(data.altText)}</Iptc4xmpCore:AltTextAccessibility>` +
    '</rdf:Description>' +
    '</rdf:RDF>' +
    '</x:xmpmeta>' +
    '<?xpacket end="w"?>'
  )
}

/* Insert XMP APP1 marker right after JPEG SOI (FF D8) */
function injectXMPIntoJPEG(buf: Buffer, xmp: string): Buffer {
  // Verify SOI
  if (buf[0] !== 0xff || buf[1] !== 0xd8) {
    throw new Error('Not a valid JPEG')
  }

  const ns      = 'http://ns.adobe.com/xap/1.0/\x00'
  const payload = Buffer.from(ns + xmp, 'utf8')
  // APP1 length field includes the 2 length bytes themselves
  const len     = payload.length + 2
  if (len > 0xffff) throw new Error('XMP data too large for a single APP1 marker')

  const marker = Buffer.alloc(4)
  marker[0] = 0xff
  marker[1] = 0xe1
  marker[2] = (len >> 8) & 0xff
  marker[3] = len & 0xff

  return Buffer.concat([buf.subarray(0, 2), marker, payload, buf.subarray(2)])
}

/* WebP: insert XMP chunk into RIFF container
   RIFF structure: "RIFF" + size(4) + "WEBP" + chunks...
   XMP chunk: "XMP " + size(4) + data
   We append XMP chunk and update the RIFF size field. */
function injectXMPIntoWebP(buf: Buffer, xmp: string): Buffer {
  if (buf.toString('ascii', 0, 4) !== 'RIFF' || buf.toString('ascii', 8, 12) !== 'WEBP') {
    throw new Error('Not a valid WebP')
  }
  const xmpData  = Buffer.from(xmp, 'utf8')
  // Chunk size must be even (pad if needed)
  const padded   = xmpData.length % 2 === 1 ? Buffer.concat([xmpData, Buffer.alloc(1)]) : xmpData
  const chunkHdr = Buffer.alloc(8)
  chunkHdr.write('XMP ', 0, 'ascii')
  chunkHdr.writeUInt32LE(xmpData.length, 4)
  const newChunk = Buffer.concat([chunkHdr, padded])
  const result   = Buffer.concat([buf, newChunk])
  // Update RIFF file size (bytes 4-7) = total file size - 8
  result.writeUInt32LE(result.length - 8, 4)
  return result
}

export async function POST(req: NextRequest) {
  let body: { imageBase64: string; mimeType: string; altText: string; metaTitle: string; metaDescription: string; keywords: string[] }

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { imageBase64, mimeType, altText, metaTitle, metaDescription, keywords } = body

  if (!imageBase64 || !mimeType) {
    return NextResponse.json({ error: 'Missing imageBase64 or mimeType' }, { status: 400 })
  }

  try {
    const imgBuf = Buffer.from(imageBase64, 'base64')
    const xmp    = buildXMP({ altText, metaTitle, metaDescription, keywords })

    let resultBuf: Buffer
    if (mimeType === 'image/webp') {
      resultBuf = injectXMPIntoWebP(imgBuf, xmp)
    } else {
      // Treat all others as JPEG (jpg, jpeg, png→converted by canvas)
      resultBuf = injectXMPIntoJPEG(imgBuf, xmp)
    }

    return NextResponse.json({ imageBase64: resultBuf.toString('base64') })
  } catch (err) {
    console.error('Inject error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
