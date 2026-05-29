/**
 * 精确有理数（BigInt 实现）。
 * 全程精确：约分后分母恒为正，gcd=1。教学场景需要展示精确分数，浮点不可用。
 */
function gcd(a: bigint, b: bigint): bigint {
  a = a < 0n ? -a : a;
  b = b < 0n ? -b : b;
  while (b) {
    [a, b] = [b, a % b];
  }
  return a;
}

export class Frac {
  readonly n: bigint; // 分子
  readonly d: bigint; // 分母（恒 > 0）

  private constructor(n: bigint, d: bigint) {
    if (d === 0n) throw new Error('分母不能为 0');
    if (d < 0n) {
      n = -n;
      d = -d;
    }
    const g = gcd(n, d) || 1n;
    this.n = n / g;
    this.d = d / g;
  }

  static readonly ZERO = new Frac(0n, 1n);
  static readonly ONE = new Frac(1n, 1n);

  /** 由 number / string("3/7"、"-5"、"3.5") / bigint 构造。空串视为 0。 */
  static of(x: number | string | bigint | Frac): Frac {
    if (x instanceof Frac) return x;
    if (typeof x === 'bigint') return new Frac(x, 1n);
    if (typeof x === 'number') {
      if (!Number.isFinite(x)) throw new Error('非有限数');
      if (Number.isInteger(x)) return new Frac(BigInt(x), 1n);
      return Frac.fromDecimalString(x.toString());
    }
    const s = x.trim();
    if (s === '' || s === '-') return Frac.ZERO;
    if (s.includes('/')) {
      const [num, den] = s.split('/');
      return new Frac(BigInt(num.trim()), BigInt(den.trim()));
    }
    if (s.includes('.') || s.includes('e') || s.includes('E')) {
      return Frac.fromDecimalString(s);
    }
    return new Frac(BigInt(s), 1n);
  }

  private static fromDecimalString(s: string): Frac {
    // 处理形如 "3.5"、"-0.125"、"1e-3"
    if (s.includes('e') || s.includes('E')) {
      return Frac.of(Number(s).toFixed(12)).simplify();
    }
    const neg = s.startsWith('-');
    const body = neg ? s.slice(1) : s;
    const [intPart, fracPart = ''] = body.split('.');
    const denom = 10n ** BigInt(fracPart.length);
    const numer = BigInt((intPart || '0') + fracPart || '0');
    return new Frac(neg ? -numer : numer, denom);
  }

  private simplify(): Frac {
    return this; // 构造时已约分
  }

  static make(n: bigint, d: bigint): Frac {
    return new Frac(n, d);
  }

  add(o: Frac): Frac {
    return new Frac(this.n * o.d + o.n * this.d, this.d * o.d);
  }
  sub(o: Frac): Frac {
    return new Frac(this.n * o.d - o.n * this.d, this.d * o.d);
  }
  mul(o: Frac): Frac {
    return new Frac(this.n * o.n, this.d * o.d);
  }
  div(o: Frac): Frac {
    if (o.isZero()) throw new Error('除以 0');
    return new Frac(this.n * o.d, this.d * o.n);
  }
  neg(): Frac {
    return new Frac(-this.n, this.d);
  }
  abs(): Frac {
    return this.n < 0n ? this.neg() : this;
  }

  isZero(): boolean {
    return this.n === 0n;
  }
  isNeg(): boolean {
    return this.n < 0n;
  }
  isInt(): boolean {
    return this.d === 1n;
  }
  eq(o: Frac): boolean {
    return this.n === o.n && this.d === o.d;
  }
  /** 比较：返回 -1/0/1 */
  cmp(o: Frac): number {
    const lhs = this.n * o.d;
    const rhs = o.n * this.d;
    return lhs < rhs ? -1 : lhs > rhs ? 1 : 0;
  }

  toNumber(): number {
    return Number(this.n) / Number(this.d);
  }
  toString(): string {
    return this.d === 1n ? this.n.toString() : `${this.n}/${this.d}`;
  }
  toLatex(): string {
    if (this.d === 1n) return this.n.toString();
    const sign = this.n < 0n ? '-' : '';
    const an = this.n < 0n ? -this.n : this.n;
    return `${sign}\\frac{${an}}{${this.d}}`;
  }
}

export const F = (x: number | string | bigint | Frac) => Frac.of(x);
