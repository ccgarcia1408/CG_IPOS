import { ReactNode } from "react";

// Props for Table
interface TableProps {
  children: ReactNode; // Table content (thead, tbody, etc.)
  className?: string; // Optional className for styling
}

// Props for TableHeader
interface TableHeaderProps {
  children: ReactNode; // Header row(s)
  className?: string; // Optional className for styling
}

// Props for TableBody
interface TableBodyProps {
  children: ReactNode; // Body row(s)
  className?: string; // Optional className for styling
}

// Props for TableRow
interface TableRowProps {
  children: ReactNode; // Cells (th or td)
  className?: string; // Optional className for styling
}

// Props for TableCell
// interface TableCellProps {
//   children: ReactNode; // Cell content
//   isHeader?: boolean; // If true, renders as <th>, otherwise <td>
//   className?: string; // Optional className for styling
// }
interface TableCellProps
  extends React.TdHTMLAttributes<HTMLTableCellElement> {
  isHeader?: boolean;
}

// Table Component
const Table: React.FC<TableProps> = ({ children, className }) => {
  return <table className={`min-w-full  ${className}`}>{children}</table>;
};

// TableHeader Component
const TableHeader: React.FC<TableHeaderProps> = ({ children, className }) => {
  return <thead className={className}>{children}</thead>;
};

// TableBody Component
const TableBody: React.FC<TableBodyProps> = ({ children, className }) => {
  return <tbody className={className}>{children}</tbody>;
};

// TableRow Component
const TableRow: React.FC<TableRowProps> = ({ children, className }) => {
  return <tr className={className}>{children}</tr>;
};

// TableCell Component
// const TableCell: React.FC<TableCellProps> = ({
//   children,
//   isHeader = false,
//   className,
// }) => {
//   const CellTag = isHeader ? "th" : "td";
//   return <CellTag className={` ${className}`}>{children}</CellTag>;
// };
// Single source of truth for header styling so every table in the app looks the same:
// left-aligned, bold, uniform size. Pages should not re-specify alignment/weight/size on
// isHeader cells — pass className only to add something beyond this (e.g. a fixed width).
const HEADER_CELL_CLASSES =
  "px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400";

export function TableCell({
  isHeader,
  className,
  children,
  ...props
}: TableCellProps) {
  if (isHeader) {
    return (
      <th className={[HEADER_CELL_CLASSES, className].filter(Boolean).join(" ")} {...props}>
        {children}
      </th>
    );
  }

  return (
    <td className={className} {...props}>
      {children}
    </td>
  );
}

export { Table, TableHeader, TableBody, TableRow };
