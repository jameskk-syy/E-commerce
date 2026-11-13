import { NextResponse } from "next/server";
import prisma from "@/libs/prismadb";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const latestOtp = await prisma.otpVerification.findFirst({
      where: {
        email: normalizedEmail,
        used: false,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!latestOtp) {
      return NextResponse.json({ activeOtp: null });
    }

    return NextResponse.json({
      activeOtp: latestOtp.code,
      expiresAt: latestOtp.expiresAt,
    });
  } catch (error: any) {
    return NextResponse.json({ activeOtp: null });
  }
}

