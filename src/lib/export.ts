import type { HerbMatrix } from '@/types';

/** 导出矩阵为 Excel 文件（按需动态加载 xlsx，减小首屏包体）。 */
export async function exportMatrixToExcel(m: HerbMatrix, filename = 'matrix.xlsx') {
  const XLSX = await import('xlsx');
  const header = ['', ...m.colLabels];
  const rows = m.data.map((row, i) => [m.rowLabels[i], ...row]);
  const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '配料表');
  XLSX.writeFile(wb, filename);
}

/** 导出任意二维数据为 Excel。 */
export async function exportRowsToExcel(
  rows: (string | number)[][],
  filename = 'result.xlsx',
  sheet = '结果',
) {
  const XLSX = await import('xlsx');
  const ws = XLSX.utils.aoa_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheet);
  XLSX.writeFile(wb, filename);
}

/** 把指定 DOM 元素导出为 PNG 图片（按需动态加载 html2canvas）。 */
export async function exportElementToImage(el: HTMLElement, filename = 'result.png') {
  const { default: html2canvas } = await import('html2canvas');
  const isDark = document.documentElement.classList.contains('dark');
  const canvas = await html2canvas(el, {
    backgroundColor: isDark ? '#020617' : '#ffffff',
    scale: 2,
    useCORS: true,
  });
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

/** 浏览器打印（可另存为 PDF）。 */
export function printPage() {
  window.print();
}
