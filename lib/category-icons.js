import { 
  Home, 
  ShoppingCart, 
  Car, 
  Utensils, 
  HeartPulse, 
  GraduationCap, 
  PiggyBank, 
  Wallet,
  Briefcase,
  Gamepad2,
  HelpCircle,
  TrendingUp,
  DollarSign
} from "lucide-react";

export const categoryIcons = {
  // Expense Categories
  Moradia: Home,
  Aluguel: Home,
  Supermercado: ShoppingCart,
  Mercado: ShoppingCart,
  Transporte: Car,
  Lazer: Gamepad2,
  Restaurante: Utensils,
  Saúde: HeartPulse,
  Educação: GraduationCap,
  Investimentos: PiggyBank,
  Outros: Wallet,

  // Income Categories
  Salário: Briefcase,
  Freelance: TrendingUp,
  "Renda Extra": DollarSign,
  "Vendas": ShoppingCart,
};

export function getCategoryIcon(category) {
  return categoryIcons[category] || HelpCircle;
}
