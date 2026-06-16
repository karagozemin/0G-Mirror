import { z } from "zod";

export const courtVerdictSchema = z.object({
  schema: z.literal("0g-mirror/court-verdict/v1"),
  caseTitle: z.string(),
  traceA: z.string(),
  traceB: z.string(),
  claim: z.string(),
  judge: z.object({
    name: z.string(),
    version: z.string()
  }),
  verdict: z.object({
    winner: z.string(),
    summary: z.string(),
    reasonCodes: z.array(z.string()),
    evidenceCoverage: z.object({
      traceA: z.number(),
      traceB: z.number()
    }),
    verificationStatus: z.object({
      traceA: z.string(),
      traceB: z.string()
    })
  }),
  hashes: z.object({
    verdictRoot: z.string()
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
      verdictId: z.union([z.number(), z.string()]),
      txHash: z.string().optional()
    })
    .optional(),
  timestamps: z.object({
    createdAt: z.string()
  })
});

export type CourtVerdict = z.infer<typeof courtVerdictSchema>;
