import Papa from 'papaparse';

/** 解析粘贴的表格文本（Tab/逗号/多空格分隔），返回二维字符串数组。 */
export function parsePastedText(text: string): string[][] {
  const trimmed = text.replace(/\r\n/g, '\n').trim();
  if (!trimmed) return [];
  // 优先按 Tab，其次逗号，最后空白
  const hasTab = trimmed.includes('\t');
  const result = Papa.parse<string[]>(trimmed, {
    delimiter: hasTab ? '\t' : '',
    skipEmptyLines: true,
  });
  let rows = result.data.map((r) => r.map((c) => String(c).trim()));
  // 若未能正确分列（每行只有 1 列），尝试按多空白分隔
  if (rows.every((r) => r.length === 1)) {
    rows = trimmed
      .split('\n')
      .map((line) => line.trim().split(/[\s,]+/).filter(Boolean));
  }
  return rows.filter((r) => r.length > 0);
}

/** 解析 CSV 文件内容。 */
export function parseCsv(text: string): string[][] {
  const result = Papa.parse<string[]>(text.trim(), { skipEmptyLines: true });
  return result.data.map((r) => r.map((c) => String(c).trim()));
}

/** 解析 Excel 文件（ArrayBuffer），取第一个工作表（按需动态加载 xlsx）。 */
export async function parseExcel(buf: ArrayBuffer): Promise<string[][]> {
  const XLSX = await import('xlsx');
  const wb = XLSX.read(buf, { type: 'array' });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1, raw: false, defval: '' });
  return rows.map((r) => r.map((c) => String(c).trim())).filter((r) => r.some((c) => c !== ''));
}

/** 判断单元格是否为合法数值（整数/小数/分数）。 */
export function isValidCell(s: string): boolean {
  const t = s.trim();
  if (t === '' || t === '-') return true; // 视为 0，宽松处理
  return /^-?\d+(\.\d+)?$/.test(t) || /^-?\d+\/-?\d+$/.test(t);
}

/**
 * 尝试从解析出的二维数组中分离表头。
 * 若首行/首列含非数字，则视为标签。返回 {rowLabels, colLabels, data}。
 */
export function inferTable(raw: string[][]): {
  rowLabels: string[];
  colLabels: string[];
  data: string[][];
} {
  if (raw.length === 0) return { rowLabels: [], colLabels: [], data: [] };
  const firstRowHasText = raw[0].some((c) => c !== '' && !isValidCell(c));
  const firstColHasText = raw.slice(firstRowHasText ? 1 : 0).some((r) => r[0] !== '' && !isValidCell(r[0]));

  const startRow = firstRowHasText ? 1 : 0;
  const startCol = firstColHasText ? 1 : 0;

  const colLabels = firstRowHasText
    ? raw[0].slice(startCol)
    : raw[0].slice(startCol).map((_, i) => `${i + 1}号`);
  const body = raw.slice(startRow);
  const rowLabels = firstColHasText
    ? body.map((r) => r[0])
    : body.map((_, i) => (i < 26 ? String.fromCharCode(65 + i) : `R${i + 1}`));
  const data = body.map((r) => r.slice(startCol));

  return { rowLabels, colLabels, data };
}
