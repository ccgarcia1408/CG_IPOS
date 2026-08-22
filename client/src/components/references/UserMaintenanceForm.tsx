import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";

import Badge from "../ui/badge/Badge";
import Modal from "../ui/modal/Modal";
import SearchableSelect from "../form/SearchableSelect";
import MultiSelect from "../form/MultiSelect";

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { api, API_BASE_URL } from "../../services/api";

import { User } from "../../types/User";
import { Role } from "../../types/Role";
import { Tenant } from "../../types/Tenant";
import { Branch } from "../../types/Branch";

const ADMIN_ROLE_ID = "1";

const getErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = error.response;

    if (typeof response === "object" && response !== null && "data" in response) {
      const data = response.data;

      if (typeof data === "object" && data !== null && "message" in data && typeof data.message === "string") {
        return data.message;
      }
    }
  }

  return error instanceof Error ? error.message : fallback;
};

export default function UserMaintenanceForm() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);

  // BRANCH ACCESS (edit-only)
  const [branchFilterTenantId, setBranchFilterTenantId] = useState("");
  const [selectedBranchIds, setSelectedBranchIds] = useState<string[]>([]);
  const [loadingUserBranches, setLoadingUserBranches] = useState(false);

  // MODAL STATES
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  // LOADING
  const [loadingUsers, setLoadingUsers] = useState(true);

  // PROFILE PICTURE (edit-only)
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const pictureInputRef = useRef<HTMLInputElement>(null);

  // FORM
  const [form, setForm] = useState({
    FirstName: "",
    MiddleName: "",
    LastName: "",
    Username: "",
    Email: "",
    Age: "",
    Address: "",
    ContactNo: "",
    Password: "",
    RoleId: "",
    IsActive: true,
    IsAccountVerified: true,
  });

  // SEARCH
  const [search, setSearch] = useState("");

  // PAGINATION
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    loadUsers();

    api
      .get<{ data: Role[] }>("/api/roles/active", { auth: true })
      .then((response) => setRoles(response.data ?? []))
      .catch((error: unknown) =>
        toast.error(getErrorMessage(error, "Failed to load roles."))
      );

    api
      .get<{ data: Tenant[] }>("/api/tenants/active", { auth: true })
      .then((response) => setTenants(response.data ?? []))
      .catch((error: unknown) =>
        toast.error(getErrorMessage(error, "Failed to load tenants."))
      );

    api
      .get<{ data: Branch[] }>("/api/branches/active", { auth: true })
      .then((response) => setBranches(response.data ?? []))
      .catch((error: unknown) =>
        toast.error(getErrorMessage(error, "Failed to load branches."))
      );
  }, []);

  const loadUserBranches = async (userId: number) => {
    try {
      setLoadingUserBranches(true);

      const response = await api.get<{ data: { BranchId: number }[] }>(
        `/api/users/${userId}/branches`,
        { auth: true }
      );

      setSelectedBranchIds((response.data ?? []).map((row) => String(row.BranchId)));
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to load branch access."));
    } finally {
      setLoadingUserBranches(false);
    }
  };

  const loadUsers = async () => {
    try {
      setLoadingUsers(true);

      const response = await api.get<{
        success: boolean;
        data: User[];
      }>("/api/users", {
        auth: true,
      });

      setUsers(response.data ?? []);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to load users."), {
        id: "users-error",
      });
    } finally {
      setLoadingUsers(false);
    }
  };

  const resetForm = () => {
    setForm({
      FirstName: "",
      MiddleName: "",
      LastName: "",
      Username: "",
      Email: "",
      Age: "",
      Address: "",
      ContactNo: "",
      Password: "",
      RoleId: "",
      IsActive: true,
      IsAccountVerified: true,
    });

    setSelectedBranchIds([]);
    setBranchFilterTenantId("");
  };

  const validateForm = () => {
    if (!form.FirstName.trim()) {
      toast.error("First name is required.");
      return false;
    }

    if (!form.LastName.trim()) {
      toast.error("Last name is required.");
      return false;
    }

    if (!form.Username.trim()) {
      toast.error("Username is required.");
      return false;
    }

    if (!form.Email.trim()) {
      toast.error("Email is required.");
      return false;
    }

    if (!form.RoleId) {
      toast.error("Role is required.");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    if (form.Password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }

    try {
      await api.post(
        "/api/users",
        {
          FirstName: form.FirstName.trim(),
          MiddleName: form.MiddleName.trim() || null,
          LastName: form.LastName.trim(),
          Username: form.Username,
          Email: form.Email,
          Age: form.Age ? Number(form.Age) : null,
          Address: form.Address.trim() || null,
          ContactNo: form.ContactNo.trim() || null,
          Password: form.Password,
          RoleId: Number(form.RoleId),
        },
        {
          auth: true,
        }
      );

      toast.success("User added successfully.");

      await loadUsers();

      resetForm();
      setEditingUser(null);
      setIsAddOpen(false);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to add user."));
    }
  };

  const handleUpdate = async () => {
    if (!editingUser) return;

    if (!validateForm()) return;

    try {
      const payload = {
        FirstName: form.FirstName.trim(),
        MiddleName: form.MiddleName.trim() || null,
        LastName: form.LastName.trim(),
        Username: form.Username,
        Email: form.Email,
        Age: form.Age ? Number(form.Age) : null,
        Address: form.Address.trim() || null,
        ContactNo: form.ContactNo.trim() || null,
        ...(form.Password ? { Password: form.Password } : {}),
        RoleId: Number(form.RoleId),
        IsActive: form.IsActive ? 1 : 0,
        IsAccountVerified: form.IsAccountVerified ? 1 : 0,
      };

      await api.put(
        `/api/users/${editingUser.UserId}`,
        payload,
        {
          auth: true,
        }
      );

      if (form.RoleId !== ADMIN_ROLE_ID) {
        await api.put(
          `/api/users/${editingUser.UserId}/branches`,
          { BranchIds: selectedBranchIds.map(Number) },
          { auth: true }
        );
      }

      toast.success("User updated successfully.");

      await loadUsers();

      resetForm();
      setEditingUser(null);
      setIsAddOpen(false);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to update user."));
    }
  };

  const handleDelete = async () => {
    if (!deletingUser) return;

    try {
      await api.delete(
        `/api/users/${deletingUser.UserId}`,
        {
          auth: true,
        }
      );

      toast.success("User deleted successfully.");

      await loadUsers();

      setDeletingUser(null);
      resetForm();
      setEditingUser(null);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to delete user."));
    }
  };

  const uploadProfilePicture = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !editingUser) return;

    try {
      setUploadingPicture(true);
      const formData = new FormData();
      formData.append("ProfilePicture", file);
      const response = await api.put<{ data: User }>(`/api/users/${editingUser.UserId}/profile-picture`, formData, { auth: true });
      setEditingUser(response.data);
      toast.success("Profile picture updated successfully.");
      await loadUsers();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to upload profile picture."));
    } finally {
      setUploadingPicture(false);
    }
  };

    const activeCount = useMemo(
    () => users.filter((user) => Number(user.IsActive) === 1).length,
    [users]
  );

  const inactiveCount = useMemo(
    () => users.filter((user) => Number(user.IsActive) !== 1).length,
    [users]
  );

  const latestThisMonth = useMemo(() => {
    const now = new Date();

    return users
      .filter((user) => {
        const created = new Date(user.CreatedAt);

        return (
          created.getMonth() === now.getMonth() &&
          created.getFullYear() === now.getFullYear()
        );
      })
      .sort(
        (a, b) =>
          new Date(b.CreatedAt).getTime() -
          new Date(a.CreatedAt).getTime()
      )
      .slice(0, 5);
  }, [users]);

  const latestThisMonthCount =
    latestThisMonth.length;

    const filteredUsers = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return users;

    return users.filter((user) => {
      const fullname = [
        user.FirstName,
        user.MiddleName,
        user.LastName,
      ]
        .filter(Boolean)
        .join(" ");

      return [
        user.Username,
        fullname,
        user.Email,
        user.ContactNo,
      ]
        .filter(Boolean)
        .some((x) =>
          x!.toLowerCase().includes(keyword)
        );
    });
  }, [users, search]);

    const totalPages = Math.max(
    1,
    Math.ceil(filteredUsers.length / pageSize)
  );

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;

    return filteredUsers.slice(
      start,
      start + pageSize
    );
  }, [
    filteredUsers,
    currentPage,
    pageSize,
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const handlePrevious = () => {
    setCurrentPage((prev) =>
      Math.max(prev - 1, 1)
    );
  };

  const handleNext = () => {
    setCurrentPage((prev) =>
      Math.min(prev + 1, totalPages)
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03] md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">User Maintenance</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage user accounts and employee information.</p>
        </div>
        <button onClick={() => setIsAddOpen(true)} className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-600">+ Add User</button>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
        {[
          ["Total Users", users.length, ""],
          ["Active", activeCount, "text-green-600"],
          ["Inactive", inactiveCount, "text-red-600"],
          ["New This Month", latestThisMonthCount, "text-blue-600"],
        ].map(([label, value, color]) => (
          <div key={String(label)} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03]">
            <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
            <h3 className={`mt-2 text-2xl font-bold ${color}`}>{value}</h3>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="relative">
          <input type="text" placeholder="Search users..." value={search} onChange={(event) => setSearch(event.target.value)} className="w-full rounded-lg border border-gray-300 py-2 pl-4 pr-16 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white" />
          {search && <button type="button" onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-3 py-1 text-xs font-medium text-red-500 transition hover:bg-gray-100 hover:text-gray-700">Clear</button>}
        </div>
      </div>

      {loadingUsers ? <div>Loading users...</div> : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="border-b border-gray-100 px-5 py-4 dark:border-white/[0.05]"><h3 className="font-semibold text-gray-800 dark:text-white">User List</h3></div>
          <div className="max-w-full overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50 dark:bg-gray-900/30"><TableRow>
                {['Username', 'Name', 'Email', 'Contact No.', 'Role', 'Status', 'Actions'].map((header) => <TableCell key={header} isHeader>{header}</TableCell>)}
              </TableRow></TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {paginatedUsers.length ? paginatedUsers.map((user) => {
                  const name = [user.FirstName, user.MiddleName, user.LastName].filter(Boolean).join(" ");
                  const isActive = Number(user.IsActive) === 1;
                  const isVerified = Number(user.IsAccountVerified) === 1;
                  return <TableRow key={user.UserId} className="transition hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                    <TableCell className="px-5 py-4 font-medium text-gray-800 dark:text-white">{user.Username}</TableCell>
                    <TableCell className="px-5 py-4 text-gray-600 dark:text-gray-400">{name}</TableCell>
                    <TableCell className="px-5 py-4 text-gray-600 dark:text-gray-400">{user.Email}</TableCell>
                    <TableCell className="px-5 py-4 text-gray-600 dark:text-gray-400">{user.ContactNo || "-"}</TableCell>
                    <TableCell className="px-5 py-4 text-gray-600 dark:text-gray-400">{user.RoleName || <span className="text-red-500">No role</span>}</TableCell>
                    <TableCell className="px-5 py-4"><div className="flex flex-col gap-1"><Badge size="sm" color={isActive ? "success" : "error"}>{isActive ? 'Active' : 'Inactive'}</Badge>{!isVerified && <Badge size="sm" color="warning">Unverified</Badge>}</div></TableCell>
                    <TableCell className="px-5 py-4"><div className="flex items-center justify-center gap-2">
                      <button onClick={() => { setEditingUser(user); setForm({ FirstName: user.FirstName || '', MiddleName: user.MiddleName || '', LastName: user.LastName || '', Username: user.Username || '', Email: user.Email || '', Age: user.Age?.toString() || '', Address: user.Address || '', ContactNo: user.ContactNo || '', Password: '', RoleId: user.RoleId ? String(user.RoleId) : '', IsActive: Number(user.IsActive) === 1, IsAccountVerified: Number(user.IsAccountVerified) === 1 }); setBranchFilterTenantId(""); void loadUserBranches(user.UserId); setIsAddOpen(true); }} className="rounded-lg bg-blue-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-600">Edit</button>
                      <button onClick={() => setDeletingUser(user)} className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-600">Delete</button>
                    </div></TableCell>
                  </TableRow>;
                }) : <TableRow><TableCell colSpan={7} className="py-10 text-center text-gray-500 dark:text-gray-400">No users found.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </div>
          <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-100 px-5 py-4 dark:border-white/[0.05] md:flex-row">
            <span className="text-sm text-gray-500 dark:text-gray-400">Showing {filteredUsers.length ? (currentPage - 1) * pageSize + 1 : 0} to {Math.min(currentPage * pageSize, filteredUsers.length)} of {filteredUsers.length} {filteredUsers.length === 1 ? 'entry' : 'entries'}</span>
            <div className="flex items-center gap-2"><button onClick={handlePrevious} disabled={currentPage === 1} className="rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-400 dark:border-white/10 dark:text-gray-300 dark:disabled:border-white/5">Previous</button>{Array.from({ length: totalPages }, (_, index) => <button key={index + 1} onClick={() => setCurrentPage(index + 1)} className={`h-9 w-9 rounded-lg text-sm font-medium ${currentPage === index + 1 ? 'bg-brand-500 text-white' : 'border border-gray-300 hover:bg-gray-100 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5'}`}>{index + 1}</button>)}<button onClick={handleNext} disabled={currentPage === totalPages} className="rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-400 dark:border-white/10 dark:text-gray-300 dark:disabled:border-white/5">Next</button></div>
            <select value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setCurrentPage(1); }} className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-white/10 dark:bg-gray-900 dark:text-gray-300"><option value={5}>5</option><option value={10}>10</option><option value={20}>20</option><option value={50}>50</option></select>
          </div>
        </div>
      )}

      <Modal isOpen={isAddOpen} title={editingUser ? 'Edit User' : 'Add User'} onClose={() => { setIsAddOpen(false); setEditingUser(null); resetForm(); }} onConfirm={editingUser ? handleUpdate : handleSubmit} confirmText={editingUser ? 'Update User' : 'Save User'} width="xl">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {editingUser && (
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium">Profile Picture</label>
              <div className="flex items-center gap-3">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full border border-gray-200 bg-gray-50 dark:border-white/10 dark:bg-white/5">
                  {editingUser.ProfilePicture && <img src={`${API_BASE_URL}${editingUser.ProfilePicture}`} alt="Profile" className="h-full w-full object-cover" />}
                </div>
                <input ref={pictureInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={uploadProfilePicture} />
                <button type="button" disabled={uploadingPicture} onClick={() => pictureInputRef.current?.click()} className="rounded-lg border px-3 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:text-gray-300">{uploadingPicture ? "Uploading..." : "Upload Picture"}</button>
              </div>
            </div>
          )}
          {([['FirstName', 'First Name', 'text'], ['MiddleName', 'Middle Name', 'text'], ['LastName', 'Last Name', 'text'], ['Username', 'Username', 'text'], ['Email', 'Email', 'email'], ['Age', 'Age', 'number'], ['ContactNo', 'Contact Number', 'tel'], ['Password', editingUser ? 'New Password (optional)' : 'Password', 'password']] as const).map(([field, label, type]) => <div key={field}><label className="mb-2 block text-sm font-medium">{label}</label><input type={type} min={field === 'Age' ? 1 : undefined} className="w-full rounded-lg border px-4 py-2 dark:border-white/10 dark:bg-white/5 dark:text-white" value={form[field]} onChange={(event) => setForm((current) => ({ ...current, [field]: event.target.value }))} /></div>)}
          <div>
            <label className="mb-2 block text-sm font-medium">Role</label>
            <SearchableSelect placeholder="Select a role..." value={form.RoleId} onChange={(v) => setForm((current) => ({ ...current, RoleId: v }))} options={roles.map((role) => ({ value: String(role.RoleId), label: role.Name }))} />
          </div>
          <div className="md:col-span-2"><label className="mb-2 block text-sm font-medium">Address</label><textarea rows={3} className="w-full rounded-lg border px-4 py-2 dark:border-white/10 dark:bg-white/5 dark:text-white" value={form.Address} onChange={(event) => setForm((current) => ({ ...current, Address: event.target.value }))} /></div>
          {editingUser && (
            <div className="md:col-span-2 flex flex-wrap gap-6">
              <label className="flex items-center gap-2 text-sm font-medium">
                <input type="checkbox" checked={form.IsActive} onChange={(event) => setForm((current) => ({ ...current, IsActive: event.target.checked }))} />
                Active
              </label>
              <label className="flex items-center gap-2 text-sm font-medium">
                <input type="checkbox" checked={form.IsAccountVerified} onChange={(event) => setForm((current) => ({ ...current, IsAccountVerified: event.target.checked }))} />
                Verified
              </label>
            </div>
          )}
          {editingUser && form.RoleId !== ADMIN_ROLE_ID && (
            <div className="md:col-span-2 space-y-3 rounded-lg border border-gray-200 p-4 dark:border-white/10">
              <h4 className="text-sm font-semibold text-gray-800 dark:text-white">Branch Access</h4>
              {loadingUserBranches ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">Loading branch access...</p>
              ) : (
                <>
                  <div>
                    <label className="mb-2 block text-sm font-medium">Filter by Tenant</label>
                    <SearchableSelect
                      placeholder="All tenants"
                      value={branchFilterTenantId}
                      onChange={(tenantId) => setBranchFilterTenantId(tenantId)}
                      options={tenants.map((tenant) => ({ value: String(tenant.TenantId), label: tenant.Name }))}
                    />
                  </div>
                  <MultiSelect
                    label="Branches"
                    placeholder="Select branches this user can access"
                    value={selectedBranchIds}
                    onChange={setSelectedBranchIds}
                    options={branches
                      .filter((branch) => !branchFilterTenantId || String(branch.TenantId) === branchFilterTenantId)
                      .map((branch) => ({ value: String(branch.BranchId), text: `${branch.Description} (${branch.TenantName})` }))}
                  />
                </>
              )}
            </div>
          )}
        </div>
      </Modal>

      <Modal isOpen={!!deletingUser} title="Delete User" onClose={() => setDeletingUser(null)} onConfirm={handleDelete} confirmText="Delete" confirmColor="danger" width="sm">
        <div className="space-y-4"><p className="text-sm text-gray-600 dark:text-gray-300">Are you sure you want to delete this user?</p><div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-500/30 dark:bg-red-500/10"><p className="font-semibold text-red-700 dark:text-red-400">{[deletingUser?.FirstName, deletingUser?.MiddleName, deletingUser?.LastName].filter(Boolean).join(' ')}</p><p className="mt-1 text-sm text-red-600 dark:text-red-400">Username: {deletingUser?.Username}</p></div><p className="text-sm text-gray-500 dark:text-gray-400">This action cannot be undone.</p></div>
      </Modal>
    </div>
  );
}
