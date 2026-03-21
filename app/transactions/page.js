import { redirect } from "next/navigation";
import { getCurrentUser } from "@lib/auth";
import { listUserTransactions } from "@lib/transactions";
import { listUserCategories } from "@lib/categories";
import TransactionsClient from "@components/TransactionsClient";

export default async function TransactionsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const [transactions, categories] = await Promise.all([
    listUserTransactions(user.id),
    listUserCategories(user.id)
  ]);

  return (
    <TransactionsClient
      initialTransactions={transactions}
      initialCategories={categories}
    />
  );
}

