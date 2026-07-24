import { Wallet } from "lucide-react";
import { ComingSoon } from "@/components/coming-soon";

export default function FinancePage() {
  return (
    <ComingSoon
      icon={Wallet}
      title="Finance"
      description="GST/TDS, bank reconciliation, receivables and payables in depth. The dashboard already shows real revenue, expenses and profit, and project-level Cost Control (budget → committed → actual → forecast) is live — this page is for the accounting layer above it: progress billing and the statutory side."
      needs={[
        "Invoice/expense CRUD API",
        "RA bills / Measurement Book (India) or AIA G702/G703 (international)",
        "GST & TDS calculation, e-invoicing (IRN/QR)",
        "Bank reconciliation",
        "Retention & bank guarantee tracking",
      ]}
    />
  );
}
