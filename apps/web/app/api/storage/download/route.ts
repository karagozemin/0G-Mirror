import { NextResponse } from "next/server";
import { Missing0GConfigError, downloadJsonFrom0G } from "@/lib/0g/storage";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { uri } = (await request.json()) as { uri: string };
    const data = await downloadJsonFrom0G(uri);
    return NextResponse.json({ data });
  } catch (error) {
    if (error instanceof Missing0GConfigError) {
      return NextResponse.json(
        { code: "MISSING_CONFIG", error: error.message },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { code: "DOWNLOAD_FAILED", error: error instanceof Error ? error.message : "Download failed" },
      { status: 500 }
    );
  }
}
