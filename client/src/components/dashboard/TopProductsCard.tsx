import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";
import { TopProduct, TopProductsSortBy } from "../../types/Dashboard";

interface TopProductsCardProps {
  data: TopProduct[];
  loading: boolean;
  sortBy: TopProductsSortBy;
  onSortByChange: (sortBy: TopProductsSortBy) => void;
}

const money = (value: number) =>
  value.toLocaleString(undefined, { style: "currency", currency: "PHP", minimumFractionDigits: 2 });

export default function TopProductsCard({ data, loading, sortBy, onSortByChange }: TopProductsCardProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Top-Selling Products</h3>
        <div className="flex items-center gap-1 rounded-lg border border-gray-200 p-1 dark:border-white/10">
          {(["REVENUE", "QUANTITY"] as TopProductsSortBy[]).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => onSortByChange(option)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                sortBy === option
                  ? "bg-brand-500 text-white"
                  : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5"
              }`}
            >
              {option === "REVENUE" ? "By Revenue" : "By Quantity"}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-10 text-center text-sm text-gray-400">Loading...</div>
      ) : data.length === 0 ? (
        <div className="py-10 text-center text-sm text-gray-400">No products sold for the selected filters.</div>
      ) : (
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50 dark:bg-gray-900/30">
              <TableRow>
                {["#", "Product", "SKU", "Category", "Qty Sold", "Sales", "% of Sales"].map((header) => (
                  <TableCell key={header} isHeader>
                    {header}
                  </TableCell>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {data.map((product) => (
                <TableRow key={product.ProductId}>
                  <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400">{product.Rank}</TableCell>
                  <TableCell className="px-4 py-3 font-medium text-gray-800 dark:text-white">
                    {product.ProductName}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400">{product.SKU}</TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400">{product.CategoryName}</TableCell>
                  <TableCell className="px-4 py-3 text-gray-600 dark:text-gray-300">{product.QuantitySold}</TableCell>
                  <TableCell className="px-4 py-3 text-gray-600 dark:text-gray-300">{money(product.SalesAmount)}</TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400">{product.PercentageOfSales}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
