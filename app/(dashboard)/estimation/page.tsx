import { ClipboardList } from "lucide-react";
import { ComingSoon } from "@/components/coming-soon";

export default function EstimationPage() {
  return (
    <ComingSoon
      icon={ClipboardList}
      title="Estimation & Tendering"
      description="The single largest missing revenue module for an AEC platform: bid/no-bid scoring, on-screen quantity takeoff (2D + BIM), rate-analysis estimation, and subcontractor bid leveling — turning a won tender straight into a project budget."
      needs={[
        "Tender & bid register with compliance checklist",
        "On-screen PDF/DWG takeoff tools",
        "Rate analysis engine + rate libraries (DSR/SOR)",
        "Subcontractor RFQ and bid leveling",
        "Estimate → BudgetLine handoff on award",
      ]}
    />
  );
}
