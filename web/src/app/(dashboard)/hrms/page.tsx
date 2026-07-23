import { UserSquare2 } from "lucide-react";
import { ComingSoon } from "@/components/coming-soon";

export default function HrmsPage() {
  return (
    <ComingSoon
      icon={UserSquare2}
      title="HRMS"
      description="Payroll, leave approvals, recruitment pipeline, performance reviews and shift management."
      needs={["Leave approval API", "Payroll engine", "Recruitment module", "Performance reviews"]}
    />
  );
}
