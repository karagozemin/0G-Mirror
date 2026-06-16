import type { VerificationStatus } from "@/lib/schemas/decision-trace";

export const MIRROR_REGISTRY_ABI = [
  {
    type: "function",
    name: "registerDecisionTrace",
    stateMutability: "nonpayable",
    inputs: [
      { name: "decisionHash", type: "bytes32" },
      { name: "traceURI", type: "string" },
      { name: "traceRoot", type: "bytes32" }
    ],
    outputs: [{ name: "traceId", type: "uint256" }]
  },
  {
    type: "function",
    name: "updateVerificationStatus",
    stateMutability: "nonpayable",
    inputs: [
      { name: "traceId", type: "uint256" },
      { name: "status", type: "uint8" }
    ],
    outputs: []
  },
  {
    type: "function",
    name: "registerCourtVerdict",
    stateMutability: "nonpayable",
    inputs: [
      { name: "traceIdA", type: "uint256" },
      { name: "traceIdB", type: "uint256" },
      { name: "verdictURI", type: "string" },
      { name: "verdictRoot", type: "bytes32" },
      { name: "winningTraceId", type: "uint256" }
    ],
    outputs: [{ name: "verdictId", type: "uint256" }]
  },
  {
    type: "function",
    name: "getDecisionTrace",
    stateMutability: "view",
    inputs: [{ name: "traceId", type: "uint256" }],
    outputs: [
      { name: "creator", type: "address" },
      { name: "decisionHash", type: "bytes32" },
      { name: "traceURI", type: "string" },
      { name: "traceRoot", type: "bytes32" },
      { name: "createdAt", type: "uint256" },
      { name: "status", type: "uint8" }
    ]
  },
  {
    type: "event",
    name: "DecisionTraceRegistered",
    inputs: [
      { indexed: true, name: "traceId", type: "uint256" },
      { indexed: true, name: "creator", type: "address" },
      { indexed: false, name: "decisionHash", type: "bytes32" },
      { indexed: false, name: "traceURI", type: "string" }
    ]
  },
  {
    type: "event",
    name: "VerificationStatusUpdated",
    inputs: [
      { indexed: true, name: "traceId", type: "uint256" },
      { indexed: false, name: "status", type: "uint8" }
    ]
  },
  {
    type: "event",
    name: "CourtVerdictRegistered",
    inputs: [
      { indexed: true, name: "verdictId", type: "uint256" },
      { indexed: true, name: "traceIdA", type: "uint256" },
      { indexed: true, name: "traceIdB", type: "uint256" },
      { indexed: false, name: "winningTraceId", type: "uint256" }
    ]
  }
] as const;

export const verificationStatusToEnum: Record<VerificationStatus, number> = {
  Pending: 0,
  Verified: 1,
  Inconsistent: 2,
  MissingEvidence: 3
};
