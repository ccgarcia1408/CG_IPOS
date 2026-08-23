import PageBreadcrumb from "../components/common/PageBreadCrumb";
import UserMetaCard from "../components/UserProfile/UserMetaCard";
import PageMeta from "../components/common/PageMeta";

export default function UserProfiles() {
  return (
    <>
      <PageMeta title="CG_IPOS | Profile" description="View and edit your profile" />
      <PageBreadcrumb pageTitle="Profile" />
      <UserMetaCard />
    </>
  );
}
