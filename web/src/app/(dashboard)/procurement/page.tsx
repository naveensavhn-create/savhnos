import { ShoppingCart } from "lucide-react";
import { ComingSoon } from "@/components/coming-soon";

export default function ProcurementPage() {
  return (
    <ComingSoon
      icon={ShoppingCart}
      title="Procurement"
      description="Material requests, approval workflow, purchase orders and vendor comparison."
      needs={["Material request API", "Purchase order model", "Vendor comparison"]}
    />
  );
}
