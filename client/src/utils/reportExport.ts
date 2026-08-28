import ExcelJS from "exceljs";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export type ReportColumn<T> = {
  key: keyof T & string;
  header: string;
  align?: "left" | "right" | "center";
  // Formats the raw value for display (table, Excel, and PDF all use this).
  format?: (row: T) => string | number;
  bold?: boolean;
};

function cellValue<T>(row: T, column: ReportColumn<T>): string | number {
  if (column.format) return column.format(row);
  const value = row[column.key] as unknown;
  return value === null || value === undefined ? "" : (value as string | number);
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

// Excel export: one sheet, bold header row, columns auto-sized to their content, bold column(s)
// carried through (e.g. a totals/summary column).
export async function exportReportToExcel<T>(
  columns: ReportColumn<T>[],
  rows: T[],
  filename: string,
  sheetName = "Report"
) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(sheetName);

  sheet.columns = columns.map((column) => ({
    header: column.header,
    key: column.key,
    width: Math.min(Math.max(column.header.length, 12) + 4, 60),
  }));

  sheet.getRow(1).eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF465FFF" } };
    cell.alignment = { vertical: "middle" };
  });

  rows.forEach((row) => {
    const values: Record<string, string | number> = {};
    columns.forEach((column) => {
      values[column.key] = cellValue(row, column);
    });
    const excelRow = sheet.addRow(values);

    columns.forEach((column, index) => {
      const cell = excelRow.getCell(index + 1);
      if (column.align) cell.alignment = { horizontal: column.align };
      if (column.bold) cell.font = { bold: true };
    });
  });

  // Auto-fit each column to its widest cell (header already accounted for above).
  sheet.columns.forEach((col, index) => {
    const headerLen = columns[index].header.length;
    let maxLen = headerLen;
    col.eachCell?.({ includeEmpty: false }, (cell) => {
      const len = String(cell.value ?? "").length;
      if (len > maxLen) maxLen = len;
    });
    col.width = Math.min(maxLen + 4, 60);
  });

  const buffer = await workbook.xlsx.writeBuffer();
  triggerDownload(
    new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }),
    `${filename}.xlsx`
  );
}

// PDF export: landscape, auto column width, bold header row, page title + optional subtitle
// (typically the applied date range/branch filter).
export function exportReportToPdf<T>(
  columns: ReportColumn<T>[],
  rows: T[],
  filename: string,
  title: string,
  subtitle?: string
) {
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(title, 40, 40);

  if (subtitle) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(subtitle, 40, 58);
    doc.setTextColor(0);
  }

  autoTable(doc, {
    startY: subtitle ? 72 : 56,
    head: [columns.map((column) => column.header)],
    body: rows.map((row) => columns.map((column) => String(cellValue(row, column)))),
    styles: { fontSize: 8, cellPadding: 4 },
    headStyles: { fillColor: [70, 95, 255], textColor: 255, fontStyle: "bold" },
    columnStyles: Object.fromEntries(
      columns.map((column, index) => [index, { halign: column.align ?? "left" }])
    ),
    didParseCell: (data) => {
      // Bold any column flagged bold, on body rows only (header is already bold via headStyles).
      if (data.section === "body" && columns[data.column.index]?.bold) {
        data.cell.styles.fontStyle = "bold";
      }
    },
  });

  doc.save(`${filename}.pdf`);
}
