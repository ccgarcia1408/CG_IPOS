import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import ProductsForm from "../../components/main/ProductsForm";

export default function Products() {
  return (
    <>
      <PageMeta
        title="CG_IPOS | Products "
        description="Products"
      />
      <PageBreadcrumb pageTitle="Products" />
      <div className="space-y-6">
        <ComponentCard title="Products">
          < ProductsForm/>
        </ComponentCard>
      </div>
    </>
  );
}
