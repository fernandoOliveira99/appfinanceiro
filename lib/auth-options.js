import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { query, pool } from "./db";
import bcrypt from "bcryptjs";
import PostgresAdapter from "@auth/pg-adapter";
import { EMAIL_VERIFICATION_ENABLED } from "./auth";

export const authOptions = {
  adapter: PostgresAdapter(pool),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          email_verified: true, // Marcar como verificado automaticamente ao usar Google
        };
      },
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        rememberMe: { label: "Remember Me", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("E-mail e senha são obrigatórios.");
        }

        const res = await query("SELECT * FROM users WHERE email = $1", [credentials.email]);
        const user = res.rows[0];

        if (!user || !user.password_hash) {
          throw new Error("Usuário não encontrado ou sem senha definida.");
        }

        // Verificar se o e-mail está verificado
        // Se houver um campo email_verified e for falso, bloqueamos
        if (user.email_verified === false) {
           throw new Error("E-mail não verificado. Por favor, complete o registro.");
        }

        const isValid = await bcrypt.compare(credentials.password, user.password_hash);

        if (!isValid) {
          throw new Error("Senha incorreta.");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.avatar_url || user.avatar,
          role: user.role,
          rememberMe: credentials.rememberMe === "true"
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
        token.role = user.role;
        token.rememberMe = user.rememberMe;
      }
      return token;
    },
    async session({ session, token }) {
      if (session && session.user) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.image = token.picture;
        session.user.role = token.role;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    // Removendo maxAge global para que o cookie de sessão seja usado
    // Se o cookie não tiver maxAge, ele expira ao fechar o navegador
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production" ? `__Secure-next-auth.session-token` : `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === "production",
        // Removendo maxAge aqui, o cookie se torna um "Session Cookie"
        // Ele expira automaticamente quando o navegador é fechado
      },
    },
  },
  useSecureCookies: process.env.NODE_ENV === "production",
  secret: process.env.NEXTAUTH_SECRET,
};
