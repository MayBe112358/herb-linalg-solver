import { describe, it, expect } from 'vitest';
import {
  F,
  Frac,
  fromNumbers,
  selectColumns,
  getColumn,
  linearCombination,
  rank,
  nullSpaceBasis,
  solve,
  findNonNegative,
  leastSquares,
  columnDependencies,
  rrefSteps,
  rref,
} from '../src/algorithms';

// 表1：9 草药(A-I) × 7 药(1-7)
const TABLE1 = [
  [10, 2, 14, 13, 21, 39, 102],
  [12, 1, 14, 26, 36, 61, 57],
  [5, 4, 13, 1, 6, 15, 2],
  [7, 10, 27, 6, 16, 48, 37],
  [1, 2, 5, 26, 6, 34, 8],
  [25, 6, 37, 6, 36, 56, 52],
  [9, 5, 19, 26, 3, 40, 27],
  [6, 6, 18, 11, 11, 36, 12],
  [8, 3, 14, 1, 3, 7, 22],
];
// 表2：新药列向量
const NEW = {
  new1: [72, 111, 26, 68, 62, 112, 84, 59, 24],
  new2: [186, 182, 44, 163, 82, 182, 122, 102, 45],
  new3: [44, 166, 65, 163, 108, 176, 116, 131, 14],
};

const A = fromNumbers(TABLE1);

function asStr(v: Frac[]): string[] {
  return v.map((x) => x.toString());
}

describe('Frac 精确有理数', () => {
  it('解析与约分', () => {
    expect(F('6/8').toString()).toBe('3/4');
    expect(F('3.5').toString()).toBe('7/2');
    expect(F(-5).toString()).toBe('-5');
    expect(F('').toString()).toBe('0');
  });
  it('四则运算精确', () => {
    expect(F('1/3').add(F('1/6')).toString()).toBe('1/2');
    expect(F('2/3').mul(F('3/4')).toString()).toBe('1/2');
    expect(F('1/3').sub(F('1/3')).isZero()).toBe(true);
  });
});

describe('秩与相关关系', () => {
  it('rank(A) = 6（7 列线性相关）', () => {
    expect(rank(A)).toBe(6);
  });
  it('零空间揭示 3号 = 1号 + 2×2号', () => {
    const basis = nullSpaceBasis(A);
    expect(basis).toHaveLength(1);
    // 任一零空间向量代入应得零向量
    const zero = linearCombination(A, basis[0]);
    expect(zero.every((x) => x.isZero())).toBe(true);
  });
});

describe('问题1：3号、6号缺货，用 1/2/4/5/7 号配制', () => {
  const avail = [0, 1, 3, 4, 6]; // 1,2,4,5,7 号
  const A5 = selectColumns(A, avail);

  it('3号药可配制，唯一解 = 1×1号 + 2×2号', () => {
    const res = solve(A5, getColumn(A, 2));
    expect(res.solvable).toBe(true);
    expect(res.unique).toBe(true);
    expect(asStr(res.particular!)).toEqual(['1', '2', '0', '0', '0']);
  });

  it('6号药无法配制（不在其余药列空间内）', () => {
    const res = solve(A5, getColumn(A, 5));
    expect(res.solvable).toBe(false);
  });
});

describe('问题2：用全部 7 种药配制新药（表2）', () => {
  it('三种新药均可配制，且解不唯一（1 个自由变量）', () => {
    for (const key of ['new1', 'new2', 'new3'] as const) {
      const res = solve(A, NEW[key].map(F));
      expect(res.solvable, key).toBe(true);
      expect(res.unique, key).toBe(false);
      expect(res.freeCols, key).toEqual([2]); // 3号药列是自由变量
      // 特解代回必须精确等于目标向量
      const check = linearCombination(A, res.particular!);
      expect(asStr(check), key).toEqual(NEW[key].map((x) => String(x)));
    }
  });

  it('新1号存在非负解（物理可实现）', () => {
    const res = solve(A, NEW.new1.map(F));
    const nn = findNonNegative(res);
    expect(nn.found).toBe(true);
    expect(nn.solution!.every((c) => !c.isNeg())).toBe(true);
  });

  it('新3号无非负解（含 7号药 负系数，物理不可实现）', () => {
    const res = solve(A, NEW.new3.map(F));
    const nn = findNonNegative(res);
    expect(nn.found).toBe(false);
  });
});

describe('列依赖关系 (A-1)', () => {
  it('自动得出 3号 = 1×1号 + 2×2号', () => {
    const deps = columnDependencies(A);
    expect(deps).toHaveLength(1);
    expect(deps[0].dependent).toBe(2); // 3号
    expect(asStr(deps[0].coef)).toEqual(['1', '2', '0', '0', '0', '0', '0']);
    // 用得到的系数代回应精确还原 3号列
    const rebuilt = linearCombination(A, deps[0].coef);
    expect(asStr(rebuilt)).toEqual(asStr(getColumn(A, 2)));
  });
});

describe('消元步骤记录 (A-4)', () => {
  it('最终结果与 rref 一致，且首尾步骤正确', () => {
    const { steps, result } = rrefSteps(A);
    expect(steps[0].type).toBe('init');
    expect(steps[steps.length - 1].type).toBe('done');
    expect(steps.length).toBeGreaterThan(2);
    const direct = rref(A);
    expect(result.rank).toBe(direct.rank);
    expect(result.R.map(asStr)).toEqual(direct.R.map(asStr));
  });
});

describe('最小二乘（近似解）', () => {
  it('可解系统残差≈0', () => {
    const ls = leastSquares(
      TABLE1,
      NEW.new1,
    );
    expect(ls.residualNorm).toBeLessThan(1e-6);
  });
  it('不可解系统给出近似 + 非零残差', () => {
    // 构造一个明显不在列空间的目标（破坏第 9 行）
    const b = [...NEW.new1];
    b[8] = b[8] + 1000;
    const ls = leastSquares(TABLE1, b);
    expect(ls.residualNorm).toBeGreaterThan(0);
    expect(ls.relativeError).toBeGreaterThan(0);
  });
});
