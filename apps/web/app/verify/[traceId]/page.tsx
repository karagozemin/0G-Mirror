import { VerifyEntry } from "@/components/mirror/VerifyEntry";

export default function VerifyPage({ params }: { params: { traceId: string } }) {
  return <VerifyEntry traceId={decodeURIComponent(params.traceId)} />;
}
