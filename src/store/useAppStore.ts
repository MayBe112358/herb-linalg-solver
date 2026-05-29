import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { HerbMatrix, TargetVector } from '@/types';
import { sampleMatrix, sampleTargets, emptyMatrix } from '@/data/samples';

interface AppState {
  current: HerbMatrix; // 当前编辑的矩阵
  targets: TargetVector[]; // 待配制目标（新药）
  disabledCols: number[]; // 缺货模拟：禁用的列索引
  saved: HerbMatrix[]; // 历史/案例库

  setCurrent: (m: HerbMatrix) => void;
  setName: (name: string) => void;
  updateCell: (r: number, c: number, value: string) => void;
  setRowLabel: (r: number, label: string) => void;
  setColLabel: (c: number, label: string) => void;
  addRow: () => void;
  addCol: () => void;
  removeRow: (r: number) => void;
  removeCol: (c: number) => void;
  resize: (rows: number, cols: number) => void;

  setTargets: (t: TargetVector[]) => void;
  updateTargetCell: (ti: number, r: number, value: string) => void;
  addTarget: () => void;
  removeTarget: (ti: number) => void;

  toggleCol: (c: number) => void;
  resetDisabled: () => void;

  loadSample: () => void;
  saveCurrent: () => void;
  loadSaved: (id: string) => void;
  deleteSaved: (id: string) => void;
}

function clone<T>(x: T): T {
  return JSON.parse(JSON.stringify(x));
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      current: sampleMatrix(),
      targets: sampleTargets(),
      disabledCols: [],
      saved: [],

      setCurrent: (m) => set({ current: m, disabledCols: [] }),
      setName: (name) => set((s) => ({ current: { ...s.current, name } })),

      updateCell: (r, c, value) =>
        set((s) => {
          const data = s.current.data.map((row) => row.slice());
          data[r][c] = value;
          return { current: { ...s.current, data } };
        }),

      setRowLabel: (r, label) =>
        set((s) => {
          const rowLabels = s.current.rowLabels.slice();
          rowLabels[r] = label;
          return { current: { ...s.current, rowLabels } };
        }),
      setColLabel: (c, label) =>
        set((s) => {
          const colLabels = s.current.colLabels.slice();
          colLabels[c] = label;
          return { current: { ...s.current, colLabels } };
        }),

      addRow: () =>
        set((s) => {
          const ncols = s.current.colLabels.length;
          const idx = s.current.rowLabels.length;
          return {
            current: {
              ...s.current,
              rowLabels: [...s.current.rowLabels, idx < 26 ? String.fromCharCode(65 + idx) : `R${idx + 1}`],
              data: [...s.current.data.map((r) => r.slice()), Array(ncols).fill('0')],
            },
          };
        }),
      addCol: () =>
        set((s) => {
          const idx = s.current.colLabels.length;
          return {
            current: {
              ...s.current,
              colLabels: [...s.current.colLabels, `${idx + 1}号`],
              data: s.current.data.map((r) => [...r, '0']),
            },
            targets: s.targets, // 列数变化不影响目标（目标按行数）
          };
        }),
      removeRow: (r) =>
        set((s) => {
          if (s.current.rowLabels.length <= 1) return {};
          return {
            current: {
              ...s.current,
              rowLabels: s.current.rowLabels.filter((_, i) => i !== r),
              data: s.current.data.filter((_, i) => i !== r),
            },
            targets: s.targets.map((t) => ({ ...t, values: t.values.filter((_, i) => i !== r) })),
          };
        }),
      removeCol: (c) =>
        set((s) => {
          if (s.current.colLabels.length <= 1) return {};
          return {
            current: {
              ...s.current,
              colLabels: s.current.colLabels.filter((_, i) => i !== c),
              data: s.current.data.map((row) => row.filter((_, i) => i !== c)),
            },
            disabledCols: [],
          };
        }),
      resize: (rows, cols) => set({ current: emptyMatrix(rows, cols), disabledCols: [] }),

      setTargets: (targets) => set({ targets }),
      updateTargetCell: (ti, r, value) =>
        set((s) => {
          const targets = clone(s.targets);
          targets[ti].values[r] = value;
          return { targets };
        }),
      addTarget: () =>
        set((s) => ({
          targets: [
            ...s.targets,
            { label: `新目标${s.targets.length + 1}`, values: Array(s.current.rowLabels.length).fill('0') },
          ],
        })),
      removeTarget: (ti) => set((s) => ({ targets: s.targets.filter((_, i) => i !== ti) })),

      toggleCol: (c) =>
        set((s) => ({
          disabledCols: s.disabledCols.includes(c)
            ? s.disabledCols.filter((x) => x !== c)
            : [...s.disabledCols, c],
        })),
      resetDisabled: () => set({ disabledCols: [] }),

      loadSample: () => set({ current: sampleMatrix(), targets: sampleTargets(), disabledCols: [] }),

      saveCurrent: () =>
        set((s) => {
          const snapshot: HerbMatrix = { ...clone(s.current), id: crypto.randomUUID(), createdAt: Date.now() };
          return { saved: [snapshot, ...s.saved].slice(0, 50) };
        }),
      loadSaved: (id) =>
        set((s) => {
          const m = s.saved.find((x) => x.id === id);
          return m ? { current: clone(m), disabledCols: [] } : {};
        }),
      deleteSaved: (id) => set((s) => ({ saved: s.saved.filter((x) => x.id !== id) })),
    }),
    { name: 'herb-linalg-store' },
  ),
);
