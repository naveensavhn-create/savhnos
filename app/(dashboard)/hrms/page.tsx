import { UserSquare2 } from "lucide-react";
import { ComingSoon } from "@/components/coming-soon";

export default function HrmsPage() {
  return (
    <ComingSoon
      icon={UserSquare2}
      title="HRMS"
      description="Payroll, leave approvals, recruitment pipeline, performance reviews and shift management — plus the subcontractor/labour statutory compliance layer (CLRA, BOCW, PF/ESI) that's a major operational risk for contractors and almost entirely absent from most field-ops platforms."
      needs={[
        "Leave approval API",
        "Payroll engine",
        "Labour statutory registers (CLRA licence, BOCW, PF/ESI)",
        "Recruitment module",
        "Performance reviews",
      ]}
    />
  );
}
