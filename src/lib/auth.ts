import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }

        const formData = new URLSearchParams();
        formData.append("username", credentials.email);
        formData.append("password", credentials.password);

        const res = await fetch(`${API_URL}/api/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: formData.toString(),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.detail || "Invalid email or password");
        }

        if (!data.access_token) {
          throw new Error("No token returned from backend");
        }

        const meRes = await fetch(`${API_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${data.access_token}`,
          },
        });

        if (!meRes.ok) {
          throw new Error("Failed to fetch user profile");
        }

        const user = await meRes.json();

        return {
          id: user.id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          accessToken: data.access_token,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.accessToken = token.accessToken;
        if (session.user) {
          session.user.role = token.role;
          session.user.id = token.id;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || "medifind_super_secret_key_2026",
};
