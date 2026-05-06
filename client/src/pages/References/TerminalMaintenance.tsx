import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import TerminalMaintenanceForm from "../../components/references/TerminalMaintenanceForm";

export default function TerminalMaintenance() {
  return (
    <>
      <PageMeta
        title="CG_IPOS | Terminal Maintenance"
        description="Terminal Maintenance"
      />
      <PageBreadcrumb pageTitle="Terminal Maintenance" />
      <div className="space-y-6">
        <ComponentCard title="All Terminals ">
          < TerminalMaintenanceForm/>
        </ComponentCard>
      </div>
    </>
  );
}
