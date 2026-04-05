import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import CategoryMaintenanceForm from "../../components/references/CategoryMaintenanceForm";

export default function CategoryMaintenance() {
  return (
    <>
      <PageMeta
        title="CG_IPOS | Category Maintenance"
        description="Category Maintenance"
      />
      <PageBreadcrumb pageTitle="Category Maintenance" />
      <div className="space-y-6">
        <ComponentCard title="All Categories">
          <CategoryMaintenanceForm />
        </ComponentCard>
      </div>
    </>
  );
}
