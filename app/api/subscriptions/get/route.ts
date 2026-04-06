import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { subscriptionService } from "@/lib/subscription-service";

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
    });

    const email = token?.email;

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const subscription = await subscriptionService.getUserSubscription(email);

    return NextResponse.json({
      success: true,
      subscription,
    });
  } catch (error) {
    console.error("GET /api/subscriptions/get error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
