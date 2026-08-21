import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import OfficialReceiptAssignmentForm from "../../components/references/OfficialReceiptAssignmentForm";

export default function OfficialReceiptAssignment() {
  return (
    <>
      <PageMeta
        title="CG_IPOS | Official Receipt Assignment"
        description="Official Receipt Assignment"
      />
      <PageBreadcrumb pageTitle="Official Receipt Assignment" />
      <div className="space-y-6">
        <ComponentCard title="All OR Assignments">
          <OfficialReceiptAssignmentForm />
        </ComponentCard>
      </div>
    </>
  );
}
