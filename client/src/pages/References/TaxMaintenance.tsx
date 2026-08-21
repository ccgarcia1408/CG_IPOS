import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import TaxMaintenanceForm from "../../components/references/TaxMaintenanceForm";

export default function TaxMaintenance() {
  return (
    <>
      <PageMeta
        title="CG_IPOS | Tax Maintenance"
        description="Tax Maintenance"
      />
      <PageBreadcrumb pageTitle="Tax Maintenance" />
      <div className="space-y-6">
        <ComponentCard title="All Taxes">
          <TaxMaintenanceForm />
        </ComponentCard>
      </div>
    </>
  );
}
