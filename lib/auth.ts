import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

const googleClientId = process.env.GOOGLE_CLIENT_ID
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET
const authSecret = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET

if (!googleClientId || !googleClientSecret) {
  throw new Error('Missing Google OAuth environment variables')
}

if (!authSecret) {
  throw new Error('Missing NEXTAUTH_SECRET or AUTH_SECRET')
}

export const authOptions: NextAuthOptions = {
  secret: authSecret,
  session: {
    strategy: 'jwt',
  },
  providers: [
    GoogleProvider({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
    }),
  ],
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
      }
      return session
    },
  },
}
