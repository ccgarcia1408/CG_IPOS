import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { api } from "../../services/api";
import { Branch } from "../../types/Branch";
import { Category } from "../../types/Category";
import { Product } from "../../types/Product";
import Badge from "../ui/badge/Badge";
import Modal from "../ui/modal/Modal";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";

const emptyForm = {
  BranchId: "",
  CategoryId: "",
  Name: "",
  Description: "",
  Barcode: "",
  SKU: "",
  CostPrice: "",
  SellingPrice: "",
  Stock: "",
  MinimumStock: "",
  ManufacturingDate: "",
  ExpiryDate: "",
  ImagePath: "",
  IsActive: "1",
};

const errorMessage = (error: unknown, fallback: string) => error instanceof Error ? error.message : fallback;
const dateValue = (value: string | null) => value ? value.slice(0, 10) : "";
const money = (value: number) => Number(value ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function InventoryForm() {
  const [products, setProducts] = useState<Product[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState<Product | null>(null);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get<{ data: Product[] }>("/api/products", { auth: true });
      setProducts(response.data ?? []);
    } catch (error) {
      toast.error(errorMessage(error, "Failed to load inventory."));
    } finally {
      setLoading(false);
    }
  };

  const loadReferences = async () => {
    try {
      const [branchesResponse, categoriesResponse] = await Promise.all([
        api.get<{ data: Branch[] }>("/api/branches/active", { auth: true }),
        api.get<{ data: Category[] }>("/api/categories/active", { auth: true }),
      ]);
      setBranches(branchesResponse.data ?? []);
      setCategories(categoriesResponse.data ?? []);
    } catch (error) {
      toast.error(errorMessage(error, "Failed to load inventory references."));
    }
  };

  useEffect(() => {
    void loadProducts();
    void loadReferences();
  }, []);

  const availableCategories = useMemo(
    () => categories.filter((category) => String(category.BranchId) === form.BranchId),
    [categories, form.BranchId],
  );

  const filteredProducts = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return keyword ? products.filter((product) => [product.Name, product.Barcode, product.Description].filter(Boolean).some((value) => String(value).toLowerCase().includes(keyword))) : products;
  }, [products, search]);

  const close = () => {
    setIsOpen(false);
    setEditing(null);
    setForm(emptyForm);
  };

  const save = async () => {
    if (!form.BranchId) return toast.error("Please select a branch.");
    if (!form.CategoryId) return toast.error("Please select a category.");
    if (!form.Name.trim()) return toast.error("Product name is required.");

    const payload = {
      BranchId: Number(form.BranchId),
      CategoryId: Number(form.CategoryId),
      Name: form.Name.trim(),
      Description: form.Description.trim() || null,
      Barcode: form.Barcode.trim() || null,
      SKU: form.SKU.trim() || null,
      CostPrice: form.CostPrice === "" ? null : Number(form.CostPrice),
      SellingPrice: form.SellingPrice === "" ? null : Number(form.SellingPrice),
      Stock: form.Stock === "" ? null : Number(form.Stock),
      MinimumStock: form.MinimumStock === "" ? null : Number(form.MinimumStock),
      ManufacturingDate: form.ManufacturingDate || null,
      ExpiryDate: form.ExpiryDate || null,
      ImagePath: form.ImagePath.trim() || null,
      IsActive: Number(form.IsActive),
    };

    console.log("Product Payload:", payload);

    try {
      if (editing) await api.put(`/api/products/${editing.ProductId}`, payload, { auth: true });
      else await api.post("/api/products", payload, { auth: true });
      toast.success(`Product ${editing ? "updated" : "added"} successfully.`);
      close();
      await loadProducts();
    } catch (error) {
      toast.error(errorMessage(error, `Failed to ${editing ? "update" : "add"} product.`));
    }
  };

  const remove = async () => {
    if (!deleting) return;
    try {
      await api.delete(`/api/products/${deleting.ProductId}`, { auth: true });
      toast.success("Product deleted successfully.");
      setDeleting(null);
      await loadProducts();
    } catch (error) {
      toast.error(errorMessage(error, "Failed to delete product."));
    }
  };

  const openEdit = (product: Product) => {
    setEditing(product);
    setForm({
      BranchId: String(product.BranchId),
      CategoryId: String(product.CategoryId),
      Name: product.Name,
      Description: product.Description ?? "",
      Barcode: product.Barcode ?? "",
      SKU: product.SKU ?? "",
      CostPrice: String(product.CostPrice ?? ""),
      SellingPrice: String(product.SellingPrice ?? ""),
      Stock: String(product.Stock ?? ""),
      MinimumStock: String(product.MinimumStock ?? ""),
      ManufacturingDate: dateValue(product.ManufacturingDate),
      ExpiryDate: dateValue(product.ExpiryDate),
      ImagePath: product.ImagePath ?? "",
      IsActive: product.IsActive ? "1" : "0",
    });
    setIsOpen(true);
  };

  return <div className="space-y-5">
    <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between"><div><h2 className="text-xl font-semibold text-gray-800">Inventory</h2><p className="mt-1 text-sm text-gray-500">Manage products, pricing, and stock levels.</p></div><button onClick={() => { setEditing(null); setForm(emptyForm); setIsOpen(true); }} className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600">+ Add Product</button></div>
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search products..." className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm" /></div>
    {loading ? <div>Loading inventory...</div> : <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"><div className="max-w-full overflow-x-auto"><Table><TableHeader className="bg-gray-50"><TableRow>{["Product", "Branch", "Category", "Prices", "Stock", "Status", "Actions"].map((header) => <TableCell key={header} isHeader className="px-5 py-4 text-start text-xs font-semibold uppercase text-gray-500">{header}</TableCell>)}</TableRow></TableHeader><TableBody className="divide-y divide-gray-100">{filteredProducts.length ? filteredProducts.map((product) => <TableRow key={product.ProductId}><TableCell className="px-5 py-4"><p className="font-medium text-gray-800">{product.Name}</p><p className="text-xs text-gray-500">{product.Barcode || "No barcode"}</p></TableCell><TableCell className="px-5 py-4 text-gray-600">{branches.find((branch) => branch.BranchId === product.BranchId)?.Description ?? "-"}</TableCell><TableCell className="px-5 py-4 text-gray-600">{categories.find((category) => category.CategoryId === product.CategoryId)?.Name ?? "-"}</TableCell><TableCell className="px-5 py-4 text-gray-600"><p>Cost: {money(product.CostPrice)}</p><p>Selling: {money(product.SellingPrice)}</p></TableCell><TableCell className="px-5 py-4"><Badge size="sm" color={product.Stock <= product.MinimumStock ? "warning" : "success"}>{product.Stock} / min {product.MinimumStock}</Badge></TableCell><TableCell className="px-5 py-4"><Badge size="sm" color={product.IsActive ? "success" : "error"}>{product.IsActive ? "Active" : "Inactive"}</Badge></TableCell><TableCell className="px-5 py-4"><div className="flex gap-2"><button onClick={() => openEdit(product)} className="rounded-lg bg-blue-500 px-3 py-1.5 text-xs text-white">Edit</button><button onClick={() => setDeleting(product)} className="rounded-lg bg-red-500 px-3 py-1.5 text-xs text-white">Delete</button></div></TableCell></TableRow>) : <TableRow><TableCell colSpan={7} className="py-10 text-center text-gray-500">No products found.</TableCell></TableRow>}</TableBody></Table></div></div>}

    <Modal isOpen={isOpen} title={editing ? "Edit Product" : "Add Product"} onClose={close} onConfirm={save} confirmText={editing ? "Update Product" : "Save Product"} width="xl">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div><label className="mb-2 block text-sm font-medium">Branch</label><select value={form.BranchId} onChange={(event) => setForm((current) => ({ ...current, BranchId: event.target.value, CategoryId: "" }))} className="w-full rounded-lg border px-4 py-2"><option value="">Select Branch</option>{branches.map((branch) => <option key={branch.BranchId} value={String(branch.BranchId)}>{branch.Description}</option>)}</select></div>

        <div><label className="mb-2 block text-sm font-medium">Category</label><select value={form.CategoryId} onChange={(event) => setForm((current) => ({ ...current, CategoryId: event.target.value }))} disabled={!form.BranchId} className="w-full rounded-lg border px-4 py-2"><option value="">Select Category</option>{availableCategories.map((category) => <option key={category.CategoryId} value={String(category.CategoryId)}>{category.Name}</option>)}</select></div>

        {([["Product Name", "Name", "text"], ["Barcode", "Barcode", "text"], ["SKU", "SKU", "text"], ["Cost Price", "CostPrice", "number"], ["Selling Price", "SellingPrice", "number"], ["Stock", "Stock", "number"], ["Minimum Stock", "MinimumStock", "number"], ["Manufacturing Date", "ManufacturingDate", "date"], ["Expiry Date", "ExpiryDate", "date"], ["Image URL", "ImagePath", "url"]] as const).map(([label, field, type]) => <div key={field}><label className="mb-2 block text-sm font-medium">{label}</label><input type={type} min={type === "number" ? "0" : undefined} step={field === "CostPrice" || field === "SellingPrice" ? "0.01" : undefined} value={form[field]} onChange={(event) => setForm((current) => ({ ...current, [field]: event.target.value }))} className="w-full rounded-lg border px-4 py-2" /></div>)}
  
        <div className="md:col-span-2"><label className="mb-2 block text-sm font-medium">Description</label><textarea rows={3} value={form.Description} onChange={(event) => setForm((current) => ({ ...current, Description: event.target.value }))} className="w-full rounded-lg border px-4 py-2" /></div>

        {editing && <div><label className="mb-2 block text-sm font-medium">Active</label><select value={form.IsActive} onChange={(event) => setForm((current) => ({ ...current, IsActive: event.target.value }))} className="w-full rounded-lg border px-4 py-2"><option value="1">Yes</option><option value="0">No</option></select></div>}
      </div>
    </Modal>

    <Modal isOpen={!!deleting} title="Delete Product" onClose={() => setDeleting(null)} onConfirm={remove} confirmText="Delete" confirmColor="danger" width="sm"><p>Delete <strong>{deleting?.Name}</strong>?</p></Modal>
  </div>;
}
