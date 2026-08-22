import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import TenantMaintenanceForm from "../../components/references/TenantMaintenanceForm";

export default function TenantMaintenance() {
  return (
    <>
      <PageMeta
        title="CG_IPOS | Tenant Maintenance"
        description="Tenant Maintenance"
      />
      <PageBreadcrumb pageTitle="Tenant Maintenance" />
      <div className="space-y-6">
        <ComponentCard title="All Tenants">
          <TenantMaintenanceForm />
        </ComponentCard>
      </div>
    </>
  );
}
