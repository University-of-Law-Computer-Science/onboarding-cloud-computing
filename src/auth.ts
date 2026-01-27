import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    GitHub({
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          scope: "read:user user:email read:org",
        },
      },
      profile(profile) {
        return {
          id: String(profile.id),
          name: profile.name || profile.login,
          email: profile.email,
          image: profile.avatar_url,
          role: "student",
          githubUsername: profile.login,
          cohortId: null,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "github") {
        const email = user.email;
        if (!email?.endsWith("@law.ac.uk")) {
          return false;
        }
      }
      return true;
    },
    async session({ session, user }) {
      if (session.user) {
        // Attach custom fields to session
        // Note: 'user' object in session callback comes from database in database strategy
        // We'll trust the type extension in next-auth.d.ts
        session.user.id = user.id;
        session.user.role = user.role;
        session.user.cohortId = user.cohortId;
        session.user.githubUsername = user.githubUsername;
      }
      return session;
    },
  },
});
