import { useRef, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";
import { updateProfile, updateProfilePicture } from "../../services/auth";
import { API_BASE_URL, ApiError } from "../../services/api";
import { UserAuth } from "../../types/UserAuth";
import Badge from "../ui/badge/Badge";
import Modal from "../ui/modal/Modal";
import Input from "../form/input/InputField";
import Label from "../form/Label";

const DEFAULT_AVATAR = "/images/user/owner.jpg";

const emptyForm = {
  FirstName: "",
  MiddleName: "",
  LastName: "",
  Email: "",
  ContactNo: "",
  Age: "",
  Address: "",
};

const errorMessage = (error: unknown, fallback: string) =>
  error instanceof ApiError || error instanceof Error ? error.message : fallback;

export default function UserMetaCard() {
  const { user, setUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const firstName = String(user?.FirstName ?? "");
  const lastName = String(user?.LastName ?? "");
  const fullName = `${firstName} ${lastName}`.trim() || String(user?.Username ?? "User");
  const roleName = String(user?.RoleName ?? "N/A");
  const email = String(user?.Email ?? "N/A");
  const phone = String(user?.ContactNo ?? "N/A");
  const age = user?.Age != null ? String(user.Age) : "N/A";
  const address = String(user?.Address ?? "N/A");

  const avatarSrc = user?.ProfilePicture ? `${API_BASE_URL}${user.ProfilePicture}` : DEFAULT_AVATAR;

  const handlePictureChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    setUploading(true);

    try {
      const response = await updateProfilePicture(file);

      if (response.data) {
        setUser(response.data as UserAuth);
      }

      toast.success("Profile picture updated successfully.", {
        id: "profile-picture-success",
      });
    } catch (error: unknown) {
      toast.error(errorMessage(error, "Failed to update profile picture."), {
        id: "profile-picture-error",
      });
    } finally {
      setUploading(false);
    }
  };

  const openEdit = () => {
    setForm({
      FirstName: firstName,
      MiddleName: String(user?.MiddleName ?? ""),
      LastName: lastName,
      Email: String(user?.Email ?? ""),
      ContactNo: String(user?.ContactNo ?? ""),
      Age: user?.Age != null ? String(user.Age) : "",
      Address: String(user?.Address ?? ""),
    });
    setIsEditOpen(true);
  };

  const saveProfile = async () => {
    if (!form.FirstName.trim()) return toast.error("First name is required.");
    if (!form.LastName.trim()) return toast.error("Last name is required.");
    if (!form.Email.trim()) return toast.error("Email is required.");

    try {
      setSaving(true);
      const response = await updateProfile({
        FirstName: form.FirstName.trim(),
        MiddleName: form.MiddleName.trim() || null,
        LastName: form.LastName.trim(),
        Email: form.Email.trim(),
        Age: form.Age === "" ? null : Number(form.Age),
        Address: form.Address.trim() || null,
        ContactNo: form.ContactNo.trim() || null,
      });

      if (response.data) {
        setUser(response.data as UserAuth);
      }

      toast.success("Profile updated successfully.");
      setIsEditOpen(false);
    } catch (error) {
      toast.error(errorMessage(error, "Failed to update profile."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-col items-center gap-5 text-center xl:flex-row xl:text-left">
          <div className="relative h-24 w-24 shrink-0">
            <div className="h-24 w-24 overflow-hidden rounded-full border border-gray-200 dark:border-gray-800">
              <img src={avatarSrc} alt="Profile" className="h-full w-full object-cover" />
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handlePictureChange}
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              aria-label="Change profile picture"
              className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-theme-xs hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-white/[0.03]"
            >
              <svg className="h-4 w-4 fill-current" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z"
                />
              </svg>
            </button>
          </div>

          <div>
            <h4 className="text-xl font-semibold text-gray-800 dark:text-white/90">{fullName}</h4>
            <div className="mt-2 flex justify-center xl:justify-start">
              <Badge size="sm" color="primary">
                {roleName}
              </Badge>
            </div>
          </div>
        </div>

        <button
          onClick={openEdit}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 xl:w-auto"
        >
          <svg className="fill-current" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z"
              fill=""
            />
          </svg>
          Edit Profile
        </button>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 border-t border-gray-100 pt-6 dark:border-white/[0.05] sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Email", email],
          ["Phone", phone],
          ["Age", age],
          ["Address", address],
        ].map(([label, value]) => (
          <div key={label}>
            <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">{label}</p>
            <p className="break-words text-sm font-medium text-gray-800 dark:text-white/90">{value}</p>
          </div>
        ))}
      </div>

      <Modal
        isOpen={isEditOpen}
        title="Edit Profile"
        onClose={() => setIsEditOpen(false)}
        onConfirm={saveProfile}
        confirmText="Save Changes"
        loading={saving}
        width="lg"
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <Label>First Name</Label>
            <Input value={form.FirstName} onChange={(e) => setForm((c) => ({ ...c, FirstName: e.target.value }))} />
          </div>
          <div>
            <Label>Middle Name</Label>
            <Input value={form.MiddleName} onChange={(e) => setForm((c) => ({ ...c, MiddleName: e.target.value }))} />
          </div>
          <div>
            <Label>Last Name</Label>
            <Input value={form.LastName} onChange={(e) => setForm((c) => ({ ...c, LastName: e.target.value }))} />
          </div>
          <div>
            <Label>Email Address</Label>
            <Input type="email" value={form.Email} onChange={(e) => setForm((c) => ({ ...c, Email: e.target.value }))} />
          </div>
          <div>
            <Label>Phone</Label>
            <Input value={form.ContactNo} onChange={(e) => setForm((c) => ({ ...c, ContactNo: e.target.value }))} />
          </div>
          <div>
            <Label>Age</Label>
            <Input type="number" min="1" max="120" value={form.Age} onChange={(e) => setForm((c) => ({ ...c, Age: e.target.value }))} />
          </div>
          <div className="md:col-span-2">
            <Label>Address</Label>
            <Input value={form.Address} onChange={(e) => setForm((c) => ({ ...c, Address: e.target.value }))} />
          </div>
        </div>
      </Modal>
    </div>
  );
}
