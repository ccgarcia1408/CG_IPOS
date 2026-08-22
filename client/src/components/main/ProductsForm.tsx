import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { api } from "../../services/api";
import { Category } from "../../types/Category";
import { Product } from "../../types/Product";
import Badge from "../ui/badge/Badge";
import Modal from "../ui/modal/Modal";
import SearchableSelect from "../form/SearchableSelect";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";

const emptyForm = { CategoryId: "", Name: "", Description: "", Barcode: "", SKU: "", CostPrice: "", SellingPrice: "", ManufacturingDate: "", ExpiryDate: "", ImagePath: "", IsActive: "1" };
const errorMessage = (error: unknown, fallback: string) => error instanceof Error ? error.message : fallback;
const dateValue = (value: string | null) => value ? value.slice(0, 10) : "";
const money = (value: number) => Number(value ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function ProductsForm() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [nameSort, setNameSort] = useState<"" | "ASC" | "DESC">("");
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState<Product | null>(null);

  const loadProducts = async () => {
    try { setLoading(true); const response = await api.get<{ data: Product[] }>("/api/products", { auth: true }); setProducts(response.data ?? []); }
    catch (error) { toast.error(errorMessage(error, "Failed to load products.")); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    void loadProducts();
    api.get<{ data: Category[] }>("/api/categories/active", { auth: true })
      .then((response) => setCategories(response.data ?? []))
      .catch((error) => toast.error(errorMessage(error, "Failed to load product categories.")));
  }, []);

  const filteredProducts = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    const min = priceMin === "" ? null : Number(priceMin);
    const max = priceMax === "" ? null : Number(priceMax);
    let result = products.filter((product) => {
      if (keyword && ![product.Name, product.Barcode, product.SKU, product.Description].filter(Boolean).some((value) => String(value).toLowerCase().includes(keyword))) return false;
      if (categoryFilter && String(product.CategoryId) !== categoryFilter) return false;
      if (statusFilter && (product.IsActive ? "1" : "0") !== statusFilter) return false;
      if (min !== null && Number(product.SellingPrice ?? 0) < min) return false;
      if (max !== null && Number(product.SellingPrice ?? 0) > max) return false;
      return true;
    });
    if (nameSort) result = [...result].sort((a, b) => nameSort === "ASC" ? a.Name.localeCompare(b.Name) : b.Name.localeCompare(a.Name));
    return result;
  }, [products, search, categoryFilter, statusFilter, priceMin, priceMax, nameSort]);
  const clearFilters = () => { setSearch(""); setCategoryFilter(""); setStatusFilter(""); setPriceMin(""); setPriceMax(""); setNameSort(""); };
  const hasActiveFilters = !!(search || categoryFilter || statusFilter || priceMin || priceMax || nameSort);
  const activeCount = useMemo(() => products.filter((product) => product.IsActive).length, [products]);
  const inactiveCount = useMemo(() => products.filter((product) => !product.IsActive).length, [products]);
  const newCount = useMemo(() => {
    const now = new Date();
    return products.filter((product) => { const created = new Date(product.CreatedAt); return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear(); }).length;
  }, [products]);
  const close = () => { setIsOpen(false); setEditing(null); setForm(emptyForm); };
  const openCreate = () => { setEditing(null); setForm(emptyForm); setIsOpen(true); };
  const openEdit = (product: Product) => { setEditing(product); setForm({ CategoryId: String(product.CategoryId), Name: product.Name, Description: product.Description ?? "", Barcode: product.Barcode ?? "", SKU: product.SKU ?? "", CostPrice: String(product.CostPrice ?? ""), SellingPrice: String(product.SellingPrice ?? ""), ManufacturingDate: dateValue(product.ManufacturingDate), ExpiryDate: dateValue(product.ExpiryDate), ImagePath: product.ImagePath ?? "", IsActive: product.IsActive ? "1" : "0" }); setIsOpen(true); };

  const save = async () => {
    if (!form.CategoryId) return toast.error("Please select a category.");
    if (!form.Name.trim()) return toast.error("Product name is required.");
    const payload = { CategoryId: Number(form.CategoryId), Name: form.Name.trim(), Description: form.Description.trim() || null, Barcode: form.Barcode.trim() || null, SKU: form.SKU.trim() || null, CostPrice: form.CostPrice === "" ? null : Number(form.CostPrice), SellingPrice: form.SellingPrice === "" ? null : Number(form.SellingPrice), ManufacturingDate: form.ManufacturingDate || null, ExpiryDate: form.ExpiryDate || null, ImagePath: form.ImagePath.trim() || null, IsActive: Number(form.IsActive) };
    try { if (editing) await api.put(`/api/products/${editing.ProductId}`, payload, { auth: true }); else await api.post("/api/products", payload, { auth: true }); toast.success(`Product ${editing ? "updated" : "added"} successfully.`); close(); await loadProducts(); }
    catch (error) { toast.error(errorMessage(error, `Failed to ${editing ? "update" : "add"} product.`)); }
  };
  const remove = async () => { if (!deleting) return; try { await api.delete(`/api/products/${deleting.ProductId}`, { auth: true }); toast.success("Product deactivated successfully."); setDeleting(null); await loadProducts(); } catch (error) { toast.error(errorMessage(error, "Failed to deactivate product.")); } };

  return <div className="space-y-5">
    <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03] md:flex-row md:items-center md:justify-between"><div><h2 className="text-xl font-semibold text-gray-800 dark:text-white">Products</h2><p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage products, pricing, and product information.</p></div><button onClick={openCreate} className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600">+ Add Product</button></div>
    <div className="grid grid-cols-1 gap-5 md:grid-cols-4">{[["Total Products", products.length, ""], ["Active", activeCount, "text-green-600"], ["Inactive", inactiveCount, "text-red-600"], ["New This Month", newCount, "text-blue-600"]].map(([label, value, color]) => <div key={label} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03]"><p className="text-sm text-gray-500 dark:text-gray-400">{label}</p><h3 className={`mt-2 text-2xl font-bold ${color}`}>{value}</h3></div>)}</div>
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03]"><div className="relative mb-4"><input type="text" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search products..." className="w-full rounded-lg border border-gray-300 py-2 pl-4 pr-16 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white" />{search && <button type="button" onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-3 py-1 text-xs font-medium text-red-500 transition hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-white/5">Clear</button>}</div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div><label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">Category</label><SearchableSelect placeholder="All Categories" value={categoryFilter} onChange={setCategoryFilter} options={categories.map((category) => ({ value: String(category.CategoryId), label: category.Name }))} /></div>
        <div><label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">Status</label><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white"><option value="">All</option><option value="1">Active</option><option value="0">Inactive</option></select></div>
        <div><label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">Min Price</label><input type="number" min="0" step="0.01" value={priceMin} onChange={(event) => setPriceMin(event.target.value)} placeholder="0.00" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white" /></div>
        <div><label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">Max Price</label><input type="number" min="0" step="0.01" value={priceMax} onChange={(event) => setPriceMax(event.target.value)} placeholder="0.00" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white" /></div>
        <div><label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">Sort by Name</label><select value={nameSort} onChange={(event) => setNameSort(event.target.value as "" | "ASC" | "DESC")} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white"><option value="">Default</option><option value="ASC">Name A-Z</option><option value="DESC">Name Z-A</option></select></div>
      </div>
      {hasActiveFilters && <div className="mt-3"><button type="button" onClick={clearFilters} className="rounded-lg px-3 py-1.5 text-xs font-medium text-red-500 transition hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-white/5">Clear all filters</button></div>}
    </div>
    {loading ? <div className="text-gray-800 dark:text-white">Loading products...</div> : <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03]"><div className="max-w-full overflow-x-auto"><Table><TableHeader className="bg-gray-50 dark:bg-gray-900/30"><TableRow>{["Product", "Category", "Prices", "Status", "Actions"].map((header) => <TableCell key={header} isHeader>{header}</TableCell>)}</TableRow></TableHeader><TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">{filteredProducts.length ? filteredProducts.map((product) => <TableRow key={product.ProductId}><TableCell className="px-5 py-4"><p className="font-medium text-gray-800 dark:text-white">{product.Name}</p><p className="text-xs text-gray-500 dark:text-gray-400">{product.Barcode || product.SKU || "No barcode or SKU"}</p></TableCell><TableCell className="px-5 py-4 text-gray-600 dark:text-gray-400">{categories.find((category) => category.CategoryId === product.CategoryId)?.Name ?? "-"}</TableCell><TableCell className="px-5 py-4 text-gray-600 dark:text-gray-400"><p>Cost: {money(product.CostPrice)}</p><p>Selling: {money(product.SellingPrice)}</p></TableCell><TableCell className="px-5 py-4"><Badge size="sm" color={product.IsActive ? "success" : "error"}>{product.IsActive ? "Active" : "Inactive"}</Badge></TableCell><TableCell className="px-5 py-4"><div className="flex gap-2"><button onClick={() => openEdit(product)} className="rounded-lg bg-blue-500 px-3 py-1.5 text-xs text-white">Edit</button><button onClick={() => setDeleting(product)} className="rounded-lg bg-red-500 px-3 py-1.5 text-xs text-white">Delete</button></div></TableCell></TableRow>) : <TableRow><TableCell colSpan={5} className="py-10 text-center text-gray-500 dark:text-gray-400">No products found.</TableCell></TableRow>}</TableBody></Table></div></div>}
    <Modal isOpen={isOpen} title={editing ? "Edit Product" : "Add Product"} onClose={close} onConfirm={save} confirmText={editing ? "Update Product" : "Save Product"} width="xl"><div className="grid grid-cols-1 gap-5 md:grid-cols-2"><div><label className="mb-2 block text-sm font-medium">Category</label><SearchableSelect placeholder="Select Category" value={form.CategoryId} onChange={(v) => setForm((current) => ({ ...current, CategoryId: v }))} options={categories.map((category) => ({ value: String(category.CategoryId), label: category.Name }))} /></div>{([['Product Name', 'Name', 'text'], ['Barcode', 'Barcode', 'text'], ['SKU', 'SKU', 'text'], ['Cost Price', 'CostPrice', 'number'], ['Selling Price', 'SellingPrice', 'number'], ['Manufacturing Date', 'ManufacturingDate', 'date'], ['Expiry Date', 'ExpiryDate', 'date'], ['Image URL', 'ImagePath', 'url']] as const).map(([label, field, type]) => <div key={field}><label className="mb-2 block text-sm font-medium">{label}</label><input type={type} min={type === "number" ? "0" : undefined} step={field === "CostPrice" || field === "SellingPrice" ? "0.01" : undefined} value={form[field]} onChange={(event) => setForm((current) => ({ ...current, [field]: event.target.value }))} className="w-full rounded-lg border px-4 py-2 dark:border-white/10 dark:bg-white/5 dark:text-white" /></div>)}<div className="md:col-span-2"><label className="mb-2 block text-sm font-medium">Description</label><textarea rows={3} value={form.Description} onChange={(event) => setForm((current) => ({ ...current, Description: event.target.value }))} className="w-full rounded-lg border px-4 py-2 dark:border-white/10 dark:bg-white/5 dark:text-white" /></div>{editing && <div><label className="mb-2 block text-sm font-medium">Active</label><select value={form.IsActive} onChange={(event) => setForm((current) => ({ ...current, IsActive: event.target.value }))} className="w-full rounded-lg border px-4 py-2 dark:border-white/10 dark:bg-white/5 dark:text-white"><option value="1">Yes</option><option value="0">No</option></select></div>}</div></Modal>
    <Modal isOpen={!!deleting} title="Deactivate Product" onClose={() => setDeleting(null)} onConfirm={remove} confirmText="Deactivate" confirmColor="danger" width="sm"><p>Deactivate <strong>{deleting?.Name}</strong>? Historical transactions will be retained.</p></Modal>
  </div>;
}
