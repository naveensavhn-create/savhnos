import { BarChart3 } from "lucide-react";
import { ComingSoon } from "@/components/coming-soon";

export default function ReportsPage() {
  return (
    <ComingSoon
      icon={BarChart3}
      title="Reports"
      description="Exportable reports for productivity, site efficiency, drawing status and client satisfaction. Live charts already exist on the Dashboard for what's available today."
      needs={["Report generation API", "Export to PDF/Excel", "Scheduled report delivery"]}
    />
  );
}
