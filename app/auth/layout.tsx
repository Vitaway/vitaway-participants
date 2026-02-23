import Image from 'next/image';
import type { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 dark:bg-gray-800 px-4 py-12">
      {/* Brand */}
      <div className="text-center">
        <Image src="https://ehr.vitaway.org/logo.png" alt="Vitaway Logo" width={120} height={40} />
      </div>

      {/* Page content */}
      <div className="w-full max-w-md">{children}</div>

      {/* Footer */}
      <p className="mt-8 text-center text-xs text-slate-400 dark:text-slate-500">
        &copy; 2026 Vitaway. All rights reserved.
      </p>
    </div>
  );
}
