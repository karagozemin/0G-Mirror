import { z } from "zod";

export const verificationStatusValues = [
  "Pending",
  "Verified",
  "Inconsistent",
  "MissingEvidence"
] as const;

export const verificationStatusSchema = z.enum(verificationStatusValues);

export const evidenceItemSchema = z.object({
  type: z.string(),
  name: z.string(),
  value: z.string()
});

export const decisionTraceSchema = z.object({
  schema: z.literal("0g-mirror/decision-trace/v1"),
  traceId: z.string(),
  agent: z.object({
    name: z.string(),
    role: z.string(),
    version: z.string()
  }),
  task: z.object({
    title: z.string(),
    input: z.string(),
    context: z.array(z.string())
  }),
  model: z.object({
    provider: z.string(),
    model: z.string(),
    temperature: z.number(),
    seed: z.string().optional()
  }),
  toolsUsed: z.array(z.string()),
  decision: z.object({
    label: z.string(),
    output: z.string(),
    publicRationale: z.string()
  }),
  evidence: z.array(evidenceItemSchema),
  hashes: z.object({
    inputHash: z.string(),
    outputHash: z.string(),
    decisionHash: z.string()
  }),
  verification: z.object({
    status: verificationStatusSchema,
    replayResult: z.string().nullable()
  }),
  storage: z
    .object({
      mode: z.enum(["0g", "local"]),
      uri: z.string(),
      root: z.string(),
      txHash: z.string().optional()
    })
    .optional(),
  attestation: z
    .object({
      mode: z.enum(["0g", "local"]),
      chainId: z.number().optional(),
      registryAddress: z.string().optional(),
      traceId: z.union([z.number(), z.string()]),
      txHash: z.string().optional()
    })
    .optional(),
  timestamps: z.object({
    createdAt: z.string()
  })
});

export type VerificationStatus = z.infer<typeof verificationStatusSchema>;
export type EvidenceItem = z.infer<typeof evidenceItemSchema>;
export type DecisionTrace = z.infer<typeof decisionTraceSchema>;

export type VerificationResult = {
  status: VerificationStatus;
  replayResult: string;
  expectedLabel?: string;
  missingEvidence: string[];
};
