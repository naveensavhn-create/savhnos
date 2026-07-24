import { FileText } from "lucide-react";
import { ComingSoon } from "@/components/coming-soon";

export default function DocumentsPage() {
  return (
    <ComingSoon
      icon={FileText}
      title="Documents"
      description="Central document vault with folders, OCR search and expiry alerts — the eventual home for tender document vaults, transmittals, and auto-compiled as-built handover packs."
      needs={["Object storage (S3/R2)", "Documents API", "OCR/search indexing", "Transmittal + acknowledgement tracking"]}
    />
  );
}
