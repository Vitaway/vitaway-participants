// Auth Layout — shared chrome for login / forgot-password / invite pages

import type { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 px-4 py-12">
      {/* Brand */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400">Vitaway</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Employee Health Portal</p>
      </div>

      {/* Page content */}
      <div className="w-full max-w-md">{children}</div>

      {/* Footer */}
      <p className="mt-8 text-center text-xs text-gray-400 dark:text-gray-500">
        &copy; {new Date().getFullYear()} Vitaway. All rights reserved.
      </p>
    </div>
  );
}
