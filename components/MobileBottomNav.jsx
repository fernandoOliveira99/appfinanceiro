"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CreditCard, PieChart, Info } from "lucide-react";

const items = [
  { href: "/dashboard", label: "Painel", icon: LayoutDashboard },
  { href: "/transactions", label: "Transações", icon: CreditCard },
  { href: "/reports", label: "Relatórios", icon: PieChart },
  { href: "/about", label: "Sobre", icon: Info }
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname === "/register" || pathname === "/forgot-password" || pathname === "/reset-password";

  if (isAuthPage) return null;

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-slate-950/90 border-t border-slate-800/50 backdrop-blur-xl pb-safe">
      <div className="flex items-center justify-around py-3 px-4">
        {items.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 transition-all duration-300 ${
                active ? "scale-110" : "scale-100 opacity-60"
              }`}
            >
              <div className={`p-2 rounded-xl transition-all ${
                active ? "bg-violet-500/10 text-violet-400" : "text-slate-400"
              }`}>
                <Icon size={20} strokeWidth={active ? 2.5 : 2} />
              </div>
              <span
                className={`text-[10px] font-black uppercase tracking-widest ${
                  active ? "text-violet-400" : "text-slate-500"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
