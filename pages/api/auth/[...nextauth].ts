import NextAuth, { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/libs/prismadb";
import bcryptjs from "bcryptjs";

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "email", type: "text" },
        password: { label: "password", type: "password" },
        otp: { label: "otp", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email) {
          throw new Error("Email is required");
        }

        const email = credentials.email.toLowerCase().trim();

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) {
          throw new Error("No account found with this email");
        }

        // 1. If OTP code is provided, verify against active OTP record
        if (credentials.otp && credentials.otp.trim().length > 0) {
          const otpInput = credentials.otp.trim();

          const activeOtp = await prisma.otpVerification.findFirst({
            where: {
              email,
              code: otpInput,
              used: false,
              expiresAt: {
                gt: new Date(),
              },
            },
            orderBy: { createdAt: "desc" },
          });

          if (!activeOtp) {
            throw new Error("Invalid or expired 6-digit verification code");
          }

          // Mark OTP as used
          await prisma.otpVerification.update({
            where: { id: activeOtp.id },
            data: { used: true },
          });

          return user;
        }

        // 2. Otherwise verify password
        if (!credentials.password || !user?.hashedPassword) {
          throw new Error("Invalid email or password");
        }

        const isCorrectPassword = await bcryptjs.compare(
          credentials.password,
          user.hashedPassword
        );

        if (!isCorrectPassword) {
          throw new Error("Invalid email or password");
        }

        return user;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  debug: process.env.NODE_ENV === "development",
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
