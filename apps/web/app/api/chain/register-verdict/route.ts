import { NextResponse } from "next/server";
import { MissingChainConfigError, registerCourtVerdictOnChain } from "@/lib/0g/chain";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      traceIdA: number;
      traceIdB: number;
      verdictURI: string;
      verdictRoot: string;
      winningTraceId: number;
    };
    const result = await registerCourtVerdictOnChain(body);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof MissingChainConfigError) {
      return NextResponse.json(
        { code: "MISSING_CONFIG", error: error.message },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { code: "REGISTER_VERDICT_FAILED", error: error instanceof Error ? error.message : "Verdict registration failed" },
      { status: 500 }
    );
  }
}
