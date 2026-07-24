import { ShoppingCart } from "lucide-react";
import { ComingSoon } from "@/components/coming-soon";

export default function ProcurementPage() {
  return (
    <ComingSoon
      icon={ShoppingCart}
      title="Procurement"
      description="Material requests, approval workflow and vendor comparison. The PurchaseOrder model already exists (Cost Control raises POs against a project budget) — this page is the missing front end for the procurement workflow around it: requisitions, RFQs and vendor comparison sheets."
      needs={["Material request API", "RFQ issue + sealed quote comparison", "Vendor master + scorecards", "Goods-receipt / gate-pass reconciliation"]}
    />
  );
}
