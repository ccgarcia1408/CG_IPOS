import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import DatabaseMaintenanceForm from "../../components/system/DatabaseMaintenanceForm";

export default function DatabaseMaintenance() {
  return (
    <>
      <PageMeta
        title="CG_IPOS | Database Maintenance"
        description="Database Maintenance"
      />
      <PageBreadcrumb pageTitle="Database Maintenance" />
      <div className="space-y-6">
        <ComponentCard title="Database Backups">
          <DatabaseMaintenanceForm />
        </ComponentCard>
      </div>
    </>
  );
}
