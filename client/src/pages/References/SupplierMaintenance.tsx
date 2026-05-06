import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import SupplierMaintenanceForm from "../../components/references/SupplierMaintenanceForm";

export default function SupplierMaintenance() {
  return (
    <>
      <PageMeta
        title="CG_IPOS | Supplier Maintenance"
        description="Supplier Maintenance"
      />
      <PageBreadcrumb pageTitle="Supplier Maintenance" />
      <div className="space-y-6">
        <ComponentCard title="All Suppliers ">
          < SupplierMaintenanceForm/>
        </ComponentCard>
      </div>
    </>
  );
}
