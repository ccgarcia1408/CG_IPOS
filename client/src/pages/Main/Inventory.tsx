import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import InventoryForm from "../../components/main/InventoryForm";

export default function Inventory() {
  return (
    <>
      <PageMeta
        title="CG_IPOS | Inventory "
        description="Inventory"
      />
      <PageBreadcrumb pageTitle="Inventory" />
      <div className="space-y-6">
        <ComponentCard title="Inventory">
          < InventoryForm/>
        </ComponentCard>
      </div>
    </>
  );
}
