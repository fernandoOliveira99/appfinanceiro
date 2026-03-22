export const theme = {
  colors: {
    background: "bg-slate-50 dark:bg-slate-950",
    backgroundMuted: "bg-white dark:bg-slate-950/80",
    card: "bg-white dark:bg-slate-900/70",
    cardSoft: "bg-slate-50 dark:bg-slate-900/60",
    borderSubtle: "border-slate-200 dark:border-slate-700/60",
    primary: "from-violet-600 to-indigo-600",
    primarySolid: "bg-violet-600",
    accent: "bg-sky-500",
    accentSoft: "bg-sky-500/10",
    success: "text-emerald-600 dark:text-emerald-400",
    warning: "text-amber-600 dark:text-amber-400",
    danger: "text-rose-600 dark:text-rose-400",
    textMuted: "text-slate-500 dark:text-slate-400"
  },
  spacing: {
    section: "space-y-6",
    cardPadding: "p-5 md:p-6",
    layoutGutter: "p-4 md:p-6 lg:p-8"
  },
  radius: {
    base: "rounded-2xl",
    full: "rounded-full"
  },
  shadow: {
    soft: "shadow-lg shadow-black/10 dark:shadow-black/40",
    innerGlow: "ring-1 ring-black/5 dark:ring-white/5"
  },
  cardStyles: {
    base:
      "backdrop-blur-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/60 rounded-2xl shadow-lg shadow-black/5 dark:shadow-black/40 transition-colors duration-300",
    interactive:
      "transition hover:border-violet-500/60 hover:shadow-violet-500/10 dark:hover:shadow-violet-500/20 hover:-translate-y-0.5"
  },
  button: {
    primary:
      "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-violet-500 hover:bg-violet-400 text-sm font-medium text-white shadow-lg shadow-violet-500/30 transition",
    ghost:
      "inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700/70 bg-white/60 dark:bg-slate-900/60 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-xs md:text-sm text-slate-700 dark:text-slate-200 transition"
  },
  typography: {
    title: "text-xl md:text-2xl font-semibold tracking-tight text-slate-900 dark:text-white",
    subtitle: "text-sm md:text-base text-slate-500 dark:text-slate-400",
    sectionTitle: "text-base md:text-lg font-semibold text-slate-900 dark:text-white",
    badge: "text-[11px] font-medium uppercase tracking-wide"
  }
};

