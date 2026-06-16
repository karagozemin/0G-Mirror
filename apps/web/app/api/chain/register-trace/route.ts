import { NextResponse } from "next/server";
import { MissingChainConfigError, registerDecisionTraceOnChain } from "@/lib/0g/chain";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      decisionHash: string;
      traceURI: string;
      traceRoot: string;
    };
    const result = await registerDecisionTraceOnChain(body);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof MissingChainConfigError) {
      return NextResponse.json(
        { code: "MISSING_CONFIG", error: error.message },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { code: "REGISTER_TRACE_FAILED", error: error instanceof Error ? error.message : "Registration failed" },
      { status: 500 }
    );
  }
}
