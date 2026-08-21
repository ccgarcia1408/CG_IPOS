import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import DiscountMaintenanceForm from "../../components/references/DiscountMaintenanceForm";

export default function DiscountMaintenance() {
  return (
    <>
      <PageMeta
        title="CG_IPOS | Discount Maintenance"
        description="Discount Maintenance"
      />
      <PageBreadcrumb pageTitle="Discount Maintenance" />
      <div className="space-y-6">
        <ComponentCard title="All Discounts">
          <DiscountMaintenanceForm />
        </ComponentCard>
      </div>
    </>
  );
}
