import { VerifyClient } from "@/components/mirror/VerifyClient";

export default function VerifyPage({ params }: { params: { traceId: string } }) {
  return <VerifyClient traceId={decodeURIComponent(params.traceId)} />;
}
