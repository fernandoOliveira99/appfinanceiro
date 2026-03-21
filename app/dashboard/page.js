import { redirect } from "next/navigation";
import { getCurrentUser } from "@lib/auth";
import { getUserSettings, listUserCategories } from "@lib/categories";
import { listUserTransactions } from "@lib/transactions";
import DashboardClient from "@components/DashboardClient";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const [settings, transactions, categories] = await Promise.all([
    getUserSettings(user.id).catch(() => ({ salary: 0 })),
    listUserTransactions(user.id).catch(() => []),
    listUserCategories(user.id).catch(() => [])
  ]);

  const initialSalary = settings.salary ?? 0;

  return (
    <DashboardClient
      user={user}
      initialSalary={initialSalary}
      initialTransactions={transactions}
      initialCategories={categories}
    />
  );
}

