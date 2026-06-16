import { NextResponse } from "next/server";
import { MissingChainConfigError, updateVerificationStatusOnChain } from "@/lib/0g/chain";
import type { VerificationStatus } from "@/lib/schemas/decision-trace";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      traceId: number;
      status: VerificationStatus;
    };
    const result = await updateVerificationStatusOnChain(body.traceId, body.status);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof MissingChainConfigError) {
      return NextResponse.json(
        { code: "MISSING_CONFIG", error: error.message },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { code: "UPDATE_STATUS_FAILED", error: error instanceof Error ? error.message : "Status update failed" },
      { status: 500 }
    );
  }
}
