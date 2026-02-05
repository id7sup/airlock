import ExcelJS from "exceljs";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function cellDisplayValue(cell: ExcelJS.Cell): string {
  const val = cell.value;
  if (val == null) return "";
  if (typeof val === "object" && "richText" in val && Array.isArray((val as any).richText)) {
    return (val as any).richText.map((t: { text: string }) => t.text).join("");
  }
  if (typeof val === "object" && "text" in val) return String((val as any).text);
  return String(val);
}

function worksheetToHtml(worksheet: ExcelJS.Worksheet): string {
  const rows: string[][] = [];
  let maxCols = 0;

  worksheet.eachRow({ includeEmpty: false }, (row) => {
    const rowData: string[] = [];
    row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
      while (rowData.length < colNumber - 1) rowData.push("");
      rowData.push(escapeHtml(cellDisplayValue(cell)));
    });
    maxCols = Math.max(maxCols, rowData.length);
    rows.push(rowData);
  });

  if (rows.length === 0) return "<table><tbody></tbody></table>";

  let html = "<table><tbody>";
  for (let r = 0; r < rows.length; r++) {
    const rowData = rows[r];
    const tag = r === 0 ? "th" : "td";
    html += "<tr>";
    for (let c = 0; c < maxCols; c++) {
      const content = rowData[c] ?? "";
      html += `<${tag}>${content}</${tag}>`;
    }
    html += "</tr>";
  }
  html += "</tbody></table>";
  return html;
}

export interface XlsxSheetHtml {
  name: string;
  html: string;
}

/**
 * Load an XLSX buffer (Buffer or ArrayBuffer) and return each sheet as HTML.
 * Uses exceljs (no known vulnerabilities).
 */
export async function xlsxToHtmlSheets(
  data: Buffer | ArrayBuffer
): Promise<XlsxSheetHtml[]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(data as ArrayBuffer);

  const result: XlsxSheetHtml[] = [];
  for (const worksheet of workbook.worksheets) {
    if (!worksheet.name) continue;
    result.push({
      name: worksheet.name,
      html: worksheetToHtml(worksheet),
    });
  }
  return result;
}
