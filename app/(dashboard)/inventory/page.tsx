import { Boxes } from "lucide-react";
import { ComingSoon } from "@/components/coming-soon";

export default function InventoryPage() {
  return (
    <ComingSoon
      icon={Boxes}
      title="Inventory"
      description="Materials, tools and equipment tracking with QR/barcode support across sites."
      needs={["Inventory item model", "Stock movement API", "QR/barcode scanning"]}
    />
  );
}
