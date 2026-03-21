import { theme } from "@config/design-system";
import { getCategoryIcon } from "@lib/category-icons";

export default function CategoryList({ categories, active, onSelect }) {
  return (
    <section className={`${theme.cardStyles.base} rounded-3xl overflow-hidden border border-slate-800/50 shadow-xl`}>
      <div className={`${theme.spacing.cardPadding} space-y-5`}>
        <div className="flex items-center justify-between">
          <h2 className={`${theme.typography.sectionTitle} text-white font-bold`}>Categorias</h2>
          {active && (
            <button
              type="button"
              className="text-xs font-bold text-violet-400 hover:text-violet-300 transition-colors"
              onClick={() => onSelect(null)}
            >
              Limpar filtro
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2.5">
          {categories.map((c) => {
            const isActive = active === c;
            const Icon = getCategoryIcon(c);
            return (
              <button
                key={c}
                type="button"
                onClick={() => onSelect(isActive ? null : c)}
                className={`group flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold border transition-all duration-200 ${
                  isActive
                    ? "bg-violet-600 border-violet-500 text-white shadow-lg shadow-violet-900/30 scale-[1.02]"
                    : "bg-slate-900/50 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200 hover:bg-slate-900"
                }`}
              >
                <Icon size={14} className={isActive ? "text-white" : "text-slate-500 group-hover:text-violet-400 transition-colors"} />
                {c}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

