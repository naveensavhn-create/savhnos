import { Wallet } from "lucide-react";
import { ComingSoon } from "@/components/coming-soon";

export default function FinancePage() {
  return (
    <ComingSoon
      icon={Wallet}
      title="Finance"
      description="GST/TDS, bank reconciliation, cost centers, receivables and payables in depth. The dashboard already shows real revenue, expenses and profit totals from the API."
      needs={["Invoice/expense CRUD API", "GST & TDS calculation", "Bank reconciliation", "Cost centers"]}
    />
  );
}
