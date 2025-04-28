import { db } from "@/lib/db/drizzle";
import { setupNewUserAction } from "@/server/actions/user-actions";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { emailOTP } from "better-auth/plugins";
import { headers } from "next/headers";
import { authAccounts, authSessions, authUsers, authVerifications } from "./db/schemas/auth-schema";
import { AuthUser } from "./types";
export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: authUsers,
      account: authAccounts,
      verification: authVerifications,
      session: authSessions,
    },
  }),
  user: {
    deleteUser: {
      enabled: true,
    },
    additionalFields: {
      selectedGroupId: {
        type: "string",
        required: false,
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 90, // 90 days
    cookieCache: {
      enabled: true,
      maxAge: 10 * 60, // 10 minutes
    },
  },
  plugins: [
    nextCookies(),
    emailOTP({
      sendVerificationOnSignUp: true,
      otpLength: 6,
      expiresIn: 600, // 10 minutes
      async sendVerificationOTP({ email, otp, type }) {
        // For development purposes - log to console
        console.log(`Email: ${email}, OTP: ${otp}, Type: ${type}`);

        // TODO: Replace with your actual email service implementation
        // Example using a service like Resend, SendGrid, etc.
        /*
        const subject = type === "sign-in"
          ? "Your login code"
          : type === "email-verification"
            ? "Verify your email address"
            : "Reset your password";

        const body = `Your verification code is: ${otp}. It will expire in 10 minutes.`;

        // Send email using your service
        await sendEmail({
          to: email,
          subject,
          text: body,
        });
        */
      },
    }),
  ],
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          setupNewUserAction(user.id);
        },
      },
    },
  },
});

export async function isAuthenticated(): Promise<AuthUser> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) throw new Error("Usuário não autenticado");

  return session.user as AuthUser;
}
