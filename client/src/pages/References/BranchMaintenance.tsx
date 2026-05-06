import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import BranchMaintenanceForm from "../../components/references/BranchMaintenanceForm";

export default function BranchMaintenance() {
  return (
    <>
      <PageMeta
        title="CG_IPOS | Branch Maintenance"
        description="Branch Maintenance"
      />
      <PageBreadcrumb pageTitle="Branch Maintenance" />
      <div className="space-y-6">
        <ComponentCard title="All Branches">
          <BranchMaintenanceForm />
        </ComponentCard>
      </div>
    </>
  );
}
