import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const API_BASE_URL = process.env.API_BASE_URL;

    const cookieStore = cookies();
    const accessToken = (await cookieStore).get("access_token")?.value;

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }

    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: "GET",
      headers,
    });

    const data = await response.json();

    if (!response.ok || data.status !== "success") {
      return NextResponse.json(
        { error: data.message },
        { status: response.status }
      );
    }

    const nextResponse = NextResponse.json(
      { message: data.message, data: data.data },
      { status: 200 }
    );
    return nextResponse;
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
