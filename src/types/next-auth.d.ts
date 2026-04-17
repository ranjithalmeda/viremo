import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      publicId?: string | null;
      username?: string | null;
    };
  }

  interface User {
    publicId?: string | null;
    username?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    publicId?: string | null;
    username?: string | null;
  }
}
