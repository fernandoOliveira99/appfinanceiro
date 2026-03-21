import { redirect } from "next/navigation";
import { getCurrentUser } from "@lib/auth";
import { listUserTransactions } from "@lib/transactions";
import ReportsClient from "@components/ReportsClient";

export default async function ReportsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const transactions = await listUserTransactions(user.id);

  return <ReportsClient initialTransactions={transactions} />;
}

