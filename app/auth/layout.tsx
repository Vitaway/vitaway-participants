// Auth Layout — shared chrome for login / forgot-password / invite pages

import type { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 py-12">
      {/* Brand */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-primary-600 dark:text-primary-400">Vitaway</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Employee Health Portal</p>
      </div>

      {/* Page content */}
      <div className="w-full max-w-md">{children}</div>

      {/* Footer */}
      <p className="mt-8 text-center text-xs text-slate-400 dark:text-slate-500">
        &copy; {new Date().getFullYear()} Vitaway. All rights reserved.
      </p>
    </div>
  );
}
