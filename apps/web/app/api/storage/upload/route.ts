import { NextResponse } from "next/server";
import { Missing0GConfigError, uploadJsonTo0G } from "@/lib/0g/storage";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { data } = (await request.json()) as { data: unknown };
    const result = await uploadJsonTo0G(data);
    return NextResponse.json({ mode: "0g", ...result });
  } catch (error) {
    if (error instanceof Missing0GConfigError) {
      return NextResponse.json(
        { code: "MISSING_CONFIG", error: error.message },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { code: "UPLOAD_FAILED", error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    );
  }
}
