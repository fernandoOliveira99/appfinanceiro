"use client";

import { useState, useEffect } from "react";
import { theme } from "@config/design-system";
import { formatCurrencyBRL, formatDate } from "@lib/finance-utils";
import { Calendar, AlertCircle, CheckCircle2, Clock } from "lucide-react";

export default function UpcomingBills() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBills() {
      try {
        const res = await fetch("/api/recurring");
        if (res.ok) {
          const data = await res.json();
          // Filter bills for the next 15 days
          const today = new Date();
          const fifteenDaysFromNow = new Date();
          fifteenDaysFromNow.setDate(today.getDate() + 15);

          const upcoming = data
            .filter(bill => {
              const nextDate = new Date(bill.next_date);
              return nextDate >= today && nextDate <= fifteenDaysFromNow;
            })
            .sort((a, b) => new Date(a.next_date) - new Date(b.next_date));

          setBills(upcoming);
        }
      } catch (err) {
        console.error("Failed to fetch upcoming bills", err);
      } finally {
        setLoading(false);
      }
    }
    fetchBills();
  }, []);

  if (loading) return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-xl w-1/3"></div>
      <div className="space-y-3">
        {[1, 2].map(i => (
          <div key={i} className="h-20 bg-slate-100 dark:bg-slate-900/50 rounded-2xl"></div>
        ))}
      </div>
    </div>
  );

  if (bills.length === 0) return null;

  return (
    <section className={`${theme.cardStyles.base} rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800/50 shadow-xl`}>
      <div className={`${theme.spacing.cardPadding} space-y-6`}>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-500 shadow-inner border border-amber-500/20">
            <Calendar size={20} />
          </div>
          <div>
            <h2 className={`${theme.typography.sectionTitle} text-slate-900 dark:text-white`}>Contas Próximas</h2>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Vencendo nos próximos 15 dias</p>
          </div>
        </div>

        <div className="space-y-3">
          {bills.map((bill) => {
            const nextDate = new Date(bill.next_date);
            const isToday = nextDate.toDateString() === new Date().toDateString();
            const diffTime = nextDate - new Date();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            return (
              <div 
                key={bill.id} 
                className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800/40 hover:border-amber-500/30 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                    isToday ? 'bg-amber-500/20 text-amber-600' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                  }`}>
                    {isToday ? <AlertCircle size={18} /> : <Clock size={18} />}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-200">{bill.name}</h4>
                    <p className={`text-[10px] font-bold uppercase tracking-widest ${
                      isToday ? 'text-amber-600' : 'text-slate-500'
                    }`}>
                      {isToday ? 'Vence Hoje' : `Vence em ${diffDays} dias`} • {formatDate(bill.next_date)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-sm font-black ${bill.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {bill.type === 'income' ? '+' : '-'} {formatCurrencyBRL(bill.amount)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
