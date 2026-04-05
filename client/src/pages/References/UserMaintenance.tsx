import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import UserMaintenanceForm from "../../components/references/UserMaintenanceForm";

export default function UserMaintenance() {
  return (
    <>
      <PageMeta
        title="CG_IPOS | User Maintenance"
        description="User Maintenance"
      />
      <PageBreadcrumb pageTitle="User Maintenance" />
      <div className="space-y-6">
        <ComponentCard title="All Users">
          <UserMaintenanceForm />
        </ComponentCard>
      </div>
    </>
  );
}
