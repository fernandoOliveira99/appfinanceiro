"use client";

import { theme } from "@config/design-system";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname === "/register" || pathname === "/forgot-password" || pathname === "/reset-password";

  if (isAuthPage) return null;

  return (
    <header className="sticky top-0 z-20 md:hidden">
      <div
        className={`flex items-center justify-between ${theme.spacing.layoutGutter} py-3 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50`}
      >
        <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-violet-500/20">
            <span className="font-black text-lg">F</span>
          </div>
          <h1 className="text-sm font-black text-slate-900 dark:text-white tracking-tight uppercase">
            Finanças App
          </h1>
        </Link>
      </div>
    </header>
  );
}
