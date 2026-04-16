import { NextResponse } from "next/server";

import { createCredentialUser, getAuthUserByEmail } from "@/src/lib/auth-users";
import { hashPassword } from "@/src/lib/password";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      name?: unknown;
      email?: unknown;
      password?: unknown;
    };

    const name =
      typeof body.name === "string" && body.name.trim() ? body.name.trim() : null;
    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long." },
        { status: 400 },
      );
    }

    const existingUser = await getAuthUserByEmail(email);

    if (existingUser?.passwordHash) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 },
      );
    }

    if (existingUser && !existingUser.passwordHash) {
      return NextResponse.json(
        {
          error:
            "This email is already tied to a social sign-in account and cannot create a password login yet.",
        },
        { status: 409 },
      );
    }

    const passwordHash = await hashPassword(password);
    const user = await createCredentialUser({
      email,
      name,
      passwordHash,
    });

    return NextResponse.json(
      {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("REGISTER_ROUTE_ERROR", error);

    const details =
      error && typeof error === "object"
        ? {
            name: "name" in error ? String(error.name) : "UnknownError",
            message:
              "message" in error ? String(error.message) : "No message provided.",
            code:
              "code" in error && error.code !== undefined
                ? String(error.code)
                : undefined,
          }
        : {
            name: "UnknownError",
            message: String(error),
            code: undefined,
          };

    return NextResponse.json(
      {
        error: "We could not create your account right now.",
        details: process.env.NODE_ENV === "development" ? details : undefined,
      },
      { status: 500 },
    );
  }
}
