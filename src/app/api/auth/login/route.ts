import { NextResponse, NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    const API_BASE_URL = process.env.API_BASE_URL;

    // Send login request to backend
    const response = await fetch(`${API_BASE_URL}/auth/signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok || data.status !== "success") {
      return NextResponse.json(
        { error: data.message || "Login failed" },
        { status: response.status }
      );
    }
    // Set access_token in HTTP-only cookie
    const nextResponse = NextResponse.json(
      { message: data.message, data: data.data.access_token },
      { status: 200 }
    );
    nextResponse.cookies.set("access_token", data.data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours (matches token expiry)
      path: "/",
    });

    return nextResponse;
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
