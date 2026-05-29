import { lazy, Suspense, useState } from 'react';
import { NavLink, Route, Routes } from 'react-router-dom';
import { SolverPage } from './pages/SolverPage';
import { ErrorBoundary } from './components/ErrorBoundary';
import { initTheme, setTheme } from './lib/theme';

const HistoryPage = lazy(() => import('./pages/HistoryPage').then((m) => ({ default: m.HistoryPage })));
const AboutPage = lazy(() => import('./pages/AboutPage').then((m) => ({ default: m.AboutPage })));

const nav = [
  { to: '/', label: '配制求解', end: true },
  { to: '/history', label: '案例库', end: false },
  { to: '/about', label: '原理', end: false },
];

export default function App() {
  const [dark, setDark] = useState(() => initTheme());

  return (
    <div className="min-h-full">
      <header className="no-print sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
        <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 font-bold text-white">中</span>
            <div className="leading-tight">
              <h1 className="text-sm font-semibold text-slate-800 dark:text-slate-100">中药特效药配制求解器</h1>
              <p className="text-[11px] text-slate-400">线性代数 · 列空间判定与配方求解</p>
            </div>
          </div>
          <nav className="ml-auto flex items-center gap-1">
            {nav.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.end}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                    isActive
                      ? 'bg-brand-50 text-brand-700 dark:bg-brand-700/20 dark:text-brand-100'
                      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`
                }
              >
                {n.label}
              </NavLink>
            ))}
            <button
              title="切换深色 / 浅色"
              onClick={() => {
                const next = !dark;
                setDark(next);
                setTheme(next);
              }}
              className="ml-1 rounded-lg px-2 py-1.5 text-base text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              {dark ? '☀️' : '🌙'}
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        <ErrorBoundary>
          <Suspense fallback={<div className="p-8 text-center text-sm text-slate-400">加载中…</div>}>
            <Routes>
              <Route path="/" element={<SolverPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/about" element={<AboutPage />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </main>

      <footer className="no-print mx-auto max-w-7xl px-4 py-8 text-center text-xs text-slate-400">
        线性代数 PBL 大作业工具 · 精确有理数求解 · 可部署到 GitHub Pages
      </footer>
    </div>
  );
}
