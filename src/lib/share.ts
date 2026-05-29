import type { HerbMatrix, TargetVector } from '@/types';

interface SharePayload {
  m: HerbMatrix;
  t: TargetVector[];
}

/** 把矩阵+目标编码为可放进 URL 的字符串（UTF-8 安全的 base64）。 */
export function encodeShare(m: HerbMatrix, t: TargetVector[]): string {
  const json = JSON.stringify({ m, t } satisfies SharePayload);
  return btoa(unescape(encodeURIComponent(json)));
}

export function decodeShare(s: string): SharePayload | null {
  try {
    const json = decodeURIComponent(escape(atob(s)));
    const p = JSON.parse(json);
    if (p && p.m && Array.isArray(p.m.data)) return p as SharePayload;
    return null;
  } catch {
    return null;
  }
}

/** 生成完整分享链接（兼容 HashRouter）。 */
export function buildShareUrl(m: HerbMatrix, t: TargetVector[]): string {
  const code = encodeShare(m, t);
  return `${location.origin}${location.pathname}#/?share=${code}`;
}
