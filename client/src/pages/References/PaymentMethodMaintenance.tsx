import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import PaymentMethodMaintenanceForm from "../../components/references/PaymentMethodMaintenanceForm";

export default function PaymentMethodMaintenance() {
  return (
    <>
      <PageMeta
        title="CG_IPOS | Payment Method Maintenance"
        description="Payment Method Maintenance"
      />
      <PageBreadcrumb pageTitle="Payment Method Maintenance" />
      <div className="space-y-6">
        <ComponentCard title="All Payment Methods">
          <PaymentMethodMaintenanceForm />
        </ComponentCard>
      </div>
    </>
  );
}
