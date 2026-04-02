"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { theme } from "@config/design-system";
import { Sparkles, Camera, X, ChevronDown, Loader2, Plus, Check, Trash2 } from "lucide-react";
import { getTodayLocalDate } from "@lib/finance-utils";

const DEFAULT_EXPENSE_CATEGORIES = [
  "Moradia",
  "Aluguel",
  "Supermercado",
  "Transporte",
  "Lazer",
  "Saúde",
  "Educação",
  "Investimentos",
  "Outros"
];

const DEFAULT_INCOME_CATEGORIES = ["Salário", "Investimento", "Presente", "Outros"];

export default function TransactionModal({ open, mode, onClose, onSave, initialData, onCategoriesChanged }) {
  const [amountDisplay, setAmountDisplay] = useState("");
  const [amountValue, setAmountValue] = useState(0);
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(() => getTodayLocalDate());
  const [suggestion, setSuggestion] = useState("");
  const [ocrLoading, setOcrLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [customCategories, setCustomCategories] = useState([]); // Lista de objetos {id, name}
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isSavingCategory, setIsSavingCategory] = useState(false);
  const fileInputRef = useRef(null);

  // Se estiver editando, o modo vem do tipo da transação
  const currentMode = initialData ? initialData.type : mode;
  const isIncome = currentMode === "income";

  // Busca categorias customizadas do banco
  useEffect(() => {
    async function fetchCustomCategories() {
      try {
        const res = await fetch("/api/categories");
        if (res.ok) {
          const data = await res.json();
          setCustomCategories(data);
        }
      } catch (err) {
        console.error("Erro ao buscar categorias:", err);
      }
    }
    if (open) {
      fetchCustomCategories();
      setIsSaving(false); // Reseta o estado ao abrir
    }
  }, [open]);

  // Usa categorias do banco, com fallback para as padrões se ainda estiver carregando
  const categoriesList = useMemo(() => {
    if (customCategories.length > 0) {
      return customCategories.map(c => c.name);
    }
    return isIncome ? DEFAULT_INCOME_CATEGORIES : DEFAULT_EXPENSE_CATEGORIES;
  }, [isIncome, customCategories]);

  // Inicializa o formulário apenas quando o modal abre ou initialData muda
  useEffect(() => {
    if (open) {
      if (initialData) {
        setAmountValue(Number(initialData.amount));
        setAmountDisplay(
          Number(initialData.amount).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
          })
        );
        setCategory(initialData.category);
        setDescription(initialData.name || initialData.description || "");
        // Garante que a data seja extraída no formato YYYY-MM-DD sem problemas de fuso horário
        const d = new Date(initialData.date);
        const yyyy = d.getUTCFullYear();
        const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
        const dd = String(d.getUTCDate()).padStart(2, '0');
        setDate(`${yyyy}-${mm}-${dd}`);
      } else {
        setAmountDisplay("");
        setAmountValue(0);
        setCategory(isIncome ? "Salário" : categoriesList[0]);
        setDescription(isIncome ? "Adição de saldo" : "");
        setDate(getTodayLocalDate());
      }
      setSuggestion("");
    }
    // NOTA: 'categories' não deve ser dependência aqui para não resetar o form ao digitar
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialData, isIncome]);

  // Auto-classification logic
  useEffect(() => {
    if (!isIncome && description.length > 2 && !initialData) {
      const desc = description.toLowerCase();
      let suggestedCat = "";

      if (desc.includes("mercado") || desc.includes("supermercado") || desc.includes("carrefour") || desc.includes("pão de açúcar")) {
        suggestedCat = "Supermercado";
      } else if (desc.includes("uber") || desc.includes("99") || desc.includes("taxi") || desc.includes("cabify") || desc.includes("combustível") || desc.includes("posto")) {
        suggestedCat = "Transporte";
      } else if (desc.includes("pizza") || desc.includes("lanche") || desc.includes("burger") || desc.includes("ifood") || desc.includes("restaurante")) {
        suggestedCat = "Alimentação";
      } else if (desc.includes("aluguel") || desc.includes("condomínio") || desc.includes("luz") || desc.includes("água")) {
        suggestedCat = "Moradia";
      } else if (desc.includes("farmácia") || desc.includes("médico") || desc.includes("hospital")) {
        suggestedCat = "Saúde";
      } else if (desc.includes("cinema") || desc.includes("show") || desc.includes("viagem")) {
        suggestedCat = "Lazer";
      }

      if (suggestedCat && suggestedCat !== category) {
        setSuggestion(suggestedCat);
      } else {
        setSuggestion("");
      }
    } else {
      setSuggestion("");
    }
  }, [description, category, isIncome, initialData]);

  const handleOcr = async (file) => {
    if (!file) return;
    
    setOcrLoading(true);
    setOcrProgress(0);

    try {
      let text = "";

      if (file.type === 'application/pdf') {
        // Lógica para PDF usando pdf.js com carregamento dinâmico
        const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
        
        // Configuração do worker se ainda não estiver configurado
        if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
          pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
        }

        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = "";
        
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map(item => item.str).join(' ');
          fullText += pageText + "\n";
          setOcrProgress(Math.round((i / pdf.numPages) * 100));
        }
        text = fullText;
      } else if (file.type.startsWith('image/')) {
        // Lógica para Imagem usando Tesseract com carregamento dinâmico
        const { recognize } = await import('tesseract.js');
        const reader = new FileReader();
        const imageData = await new Promise((resolve, reject) => {
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        const result = await recognize(imageData, 'por', {
          logger: m => {
            if (m.status === 'recognizing text') {
              setOcrProgress(Math.round(m.progress * 100));
            }
          }
        });
        text = result.data.text;
      } else {
        alert("Formato não suportado. Use Imagem ou PDF.");
        setOcrLoading(false);
        return;
      }

      console.log("Texto extraído:", text);

      // --- Lógica de Extração de Boletos/Comprovantes ---

      // 1. Valor (Procura "Valor", "Total", "R$", ou padrões de boleto)
      // Padrão: Valor Documento 260,35 ou Valor: R$ 260,35
      const amountRegex = /(?:Valor(?:[\s\w]*?))(?:\:\s*|R\$\s*|[\s]+)([\d.]+,\d{2})|R\$\s*([\d.]+,\d{2})/i;
      const amountMatch = text.match(amountRegex);
      if (amountMatch) {
        const valStr = amountMatch[1] || amountMatch[2];
        const numericValue = parseFloat(valStr.replace(/\./g, '').replace(',', '.'));
        setAmountValue(numericValue);
        setAmountDisplay(new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(numericValue));
      }

      // 2. Vencimento / Data
      // Padrão: Vencimento 16/03/2026 ou 16/03/2026
      const dateRegex = /(?:Vencimento|Data|Processamento)(?:\:\s*|[\s]+)(\d{2}\/\d{2}\/\d{4})|(\d{2}\/\d{2}\/\d{4})/i;
      const dateMatch = text.match(dateRegex);
      if (dateMatch) {
        const dStr = dateMatch[1] || dateMatch[2];
        const [day, month, year] = dStr.split('/');
        setDate(`${year}-${month}-${day}`);
      }

      // 3. Descrição / Cedente
      // Procura nomes de bancos ou palavras chaves
      const bankKeywords = ["Itaú", "Bradesco", "Santander", "Nubank", "Banco", "Boleto", "Pagamento"];
      const foundBank = bankKeywords.find(k => text.includes(k));
      if (foundBank && !description) {
        setDescription(`Pagamento ${foundBank}`);
      } else if (!description) {
        const lines = text.split('\n').filter(l => l.trim().length > 10);
        if (lines.length > 0) setDescription(lines[0].substring(0, 40));
      }

      // Se for boleto, forçar para despesa (se não estiver em modo edição)
      if (!initialData && isIncome) {
        // Opcional: avisar usuário ou trocar automaticamente
      }

    } catch (error) {
      console.error("OCR/PDF Error:", error);
      alert("Erro ao ler o documento. Tente novamente ou insira manualmente.");
    } finally {
      setOcrLoading(false);
    }
  };

  const handleCancelOcr = () => {
    // Para o recognize direto, o cancelamento é mais complexo sem um worker persistente, 
    // então apenas limpamos o estado visual.
    setOcrLoading(false);
    setOcrProgress(0);
  };

  const handleSaveCategory = async () => {
    const nameToSave = newCategoryName.trim();
    if (!nameToSave) return;

    // Verifica se já existe localmente antes de enviar para o servidor
    if (categoriesList.some(c => c.toLowerCase() === nameToSave.toLowerCase())) {
      alert("Esta categoria já existe.");
      return;
    }

    setIsSavingCategory(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nameToSave })
      });
      if (res.ok) {
        const created = await res.json();
        const updated = [...customCategories, created];
        setCustomCategories(updated);
        onCategoriesChanged?.(updated); // Notifica o pai se necessário
        setCategory(created.name);
        setIsAddingNewCategory(false);
        setNewCategoryName("");
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Erro ao salvar categoria.");
      }
    } catch (err) {
      console.error("Erro ao salvar categoria:", err);
    } finally {
      setIsSavingCategory(false);
    }
  };

  const handleDeleteCategory = async (catName) => {
    const catObj = customCategories.find(c => c.name === catName);
    if (!catObj) return;

    if (!confirm(`Deseja realmente excluir a categoria "${catName}"?`)) return;

    try {
      const res = await fetch(`/api/categories/${catObj.id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setCustomCategories(prev => {
          const newList = prev.filter(c => c.id !== catObj.id);
          onCategoriesChanged?.(newList); // Notifica o pai se necessário
          if (category === catName) {
            // Se deletou a atual, seleciona a primeira da nova lista
            const nextCat = newList.length > 0 
              ? newList[0].name 
              : (isIncome ? DEFAULT_INCOME_CATEGORIES[0] : DEFAULT_EXPENSE_CATEGORIES[0]);
            setCategory(nextCat);
          }
          return newList;
        });
      }
    } catch (err) {
      console.error("Erro ao excluir categoria:", err);
    }
  };

  if (!open) return null;

  const title = isIncome ? "Adicionar Dinheiro" : "Adicionar Despesa";

  const applySuggestion = () => {
    if (suggestion) {
      setCategory(suggestion);
      setSuggestion("");
    }
  };

  function handleAmountChange(e) {
    const raw = e.target.value || "";
    // Mantém apenas dígitos
    let digits = raw.replace(/\D/g, "");
    
    // Remove zeros à esquerda
    digits = digits.replace(/^0+/, "");
    
    if (!digits) {
      setAmountDisplay("");
      setAmountValue(0);
      return;
    }
    
    const numeric = Number(digits) / 100;
    setAmountValue(numeric);
    
    // Format values using Brazilian currency: toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
    setAmountDisplay(
      numeric.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
      })
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!amountValue || isSaving) return;
    
    // If it's an expense, we need a category
    if (!isIncome && !category) return;

    setIsSaving(true);
    
    try {
      await onSave({
        id: initialData?.id,
        name: description || (isIncome ? "Adição de saldo" : "Saída"),
        amount: amountValue,
        category: isIncome ? "Salário" : category,
        date,
        type: isIncome ? "income" : "expense"
      });
      onClose();
    } catch (error) {
      console.error("Erro ao salvar transação:", error);
      setIsSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4 pb-32 sm:pb-0 overflow-y-auto">
      <div className={`${theme.cardStyles.base} max-w-md w-full shadow-2xl rounded-3xl overflow-hidden my-auto`}>
        <form
          onSubmit={handleSubmit}
          className={`${theme.spacing.cardPadding} space-y-5 md:space-y-6`}
        >
          <div className="flex items-center justify-between">
            <h2 className={`${theme.typography.sectionTitle} text-xl font-bold text-slate-900 dark:text-white`}>
              {initialData ? "Editar Movimentação" : title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800/50 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            {ocrLoading && (
              <div className="space-y-3 text-center p-4 bg-violet-500/5 rounded-2xl border border-violet-500/10">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-bold text-violet-600 dark:text-violet-400 uppercase tracking-widest">Analisando documento...</p>
                  <button 
                    type="button"
                    onClick={handleCancelOcr}
                    className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white transition-all"
                    title="Cancelar análise"
                  >
                    <X size={14} />
                  </button>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-violet-600 h-full rounded-full transition-all duration-300" 
                    style={{ width: `${ocrProgress}%` }}
                  ></div>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Aguarde um momento</p>
                  <p className="text-[10px] text-violet-600 dark:text-violet-400 font-bold">{ocrProgress}%</p>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">Valor</label>
              <input
                type="text"
                inputMode="decimal"
                className="bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl px-4 py-3 text-lg font-bold text-slate-900 dark:text-white outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/10 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-700"
                value={amountDisplay}
                onChange={handleAmountChange}
                placeholder="R$ 0,00"
                required
                autoFocus
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">Categoria</label>
                {!isAddingNewCategory && (
                  <button 
                    type="button"
                    onClick={() => setIsAddingNewCategory(true)}
                    className="text-[10px] font-black uppercase tracking-widest text-violet-500 hover:text-violet-400 transition-colors flex items-center gap-1"
                  >
                    <Plus size={12} />
                    Nova Categoria
                  </button>
                )}
              </div>

              {isAddingNewCategory ? (
                <div className="flex gap-2 animate-in slide-in-from-right-2 duration-200">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      autoFocus
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="Nome da categoria..."
                      className="w-full bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') { e.preventDefault(); handleSaveCategory(); }
                        if (e.key === 'Escape') setIsAddingNewCategory(false);
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSaveCategory}
                    disabled={isSavingCategory || !newCategoryName.trim()}
                    className="p-3 rounded-2xl bg-violet-600 text-white hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-violet-600/20 flex items-center justify-center min-w-[48px]"
                  >
                    {isSavingCategory ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingNewCategory(false)}
                    className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center justify-center min-w-[48px]"
                  >
                    <X size={18} />
                  </button>
                </div>
              ) : (
                <div className="relative group">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <select
                        className="w-full bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/10 transition-all appearance-none cursor-pointer group-hover:bg-slate-200/50 dark:group-hover:bg-slate-800/50"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        required
                      >
                        {categoriesList.map((cat) => (
                          <option key={cat} value={cat} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                            {cat}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-violet-500 transition-colors">
                        <ChevronDown size={16} />
                      </div>
                    </div>
                    
                    {/* Botão de Excluir Categoria (apenas para customizadas) */}
                    {customCategories.some(c => c.name === category) && (
                      <button
                        type="button"
                        onClick={() => handleDeleteCategory(category)}
                        className="p-3 rounded-2xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center min-w-[48px] border border-rose-500/20"
                        title="Excluir categoria"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </div>
              )}
              {suggestion && !isAddingNewCategory && (
                <button
                  type="button"
                  onClick={applySuggestion}
                  className="text-[10px] font-black text-violet-600 dark:text-violet-400 uppercase tracking-widest mt-1 ml-1 hover:text-violet-500 dark:hover:text-violet-300 transition-colors flex items-center gap-1"
                >
                  <Sparkles size={10} className="fill-violet-600 dark:fill-violet-400" />
                  Sugerimos: {suggestion} (Clique para aplicar)
                </button>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">Descrição</label>
              <input
                className="bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/10 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-700"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={isIncome ? "Ex: Salário Mensal, Freelance..." : "Ex: Almoço, Supermercado..."}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">
                {isIncome ? "Data do Recebimento" : "Data"}
              </label>
              <input
                type="date"
                className="bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/10 transition-all"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            {!isIncome && (
              <>
                <input 
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => handleOcr(e.target.files[0])}
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  disabled={ocrLoading}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-700/50 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs transition-all disabled:opacity-50 group"
                >
                  <Camera size={14} className="group-hover:scale-110 transition-transform" />
                  Importar Comprovante / Boleto
                </button>
              </>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold transition-all border border-slate-200 dark:border-slate-700/30 shadow-sm"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={isSaving}
              className={`flex-1 px-6 py-3 rounded-2xl font-bold text-white shadow-lg transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 ${
                isSaving ? "opacity-70 cursor-not-allowed" : ""
              } ${
                isIncome 
                ? "bg-gradient-to-r from-emerald-600 to-teal-600 shadow-emerald-500/20 dark:shadow-emerald-900/20 hover:from-emerald-500 hover:to-teal-500" 
                : "bg-gradient-to-r from-rose-600 to-pink-600 shadow-rose-500/20 dark:shadow-rose-900/20 hover:from-rose-500 hover:to-pink-500"
              }`}
            >
              {isSaving ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Salvando...
                </>
              ) : (
                isIncome ? "Adicionar" : "Salvar"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
