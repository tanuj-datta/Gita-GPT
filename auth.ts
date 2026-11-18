import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

const hasDatabase = Boolean(process.env.DATABASE_URL);

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "",
  ...(hasDatabase ? { adapter: PrismaAdapter(prisma) } : { session: { strategy: "jwt" as const } }),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_SECRET || "",
    }),
  ],
  callbacks: {
    async session({ session, token, user }) {
      if (session.user) {
        if (user && 'id' in user) {
          session.user.id = (user as any).id;
        } else if (token && token.sub) {
          session.user.id = token.sub;
        }
      }
      return session;
    },
  },
});
