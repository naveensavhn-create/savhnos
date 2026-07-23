import { FileText } from "lucide-react";
import { ComingSoon } from "@/components/coming-soon";

export default function DocumentsPage() {
  return (
    <ComingSoon
      icon={FileText}
      title="Documents"
      description="Central document vault with folders, OCR search and expiry alerts."
      needs={["Object storage (S3/R2)", "Documents API", "OCR/search indexing"]}
    />
  );
}
