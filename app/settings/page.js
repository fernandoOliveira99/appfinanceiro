import { redirect } from "next/navigation";
import { getCurrentUser } from "@lib/auth";
import { getUserSettings, listUserCategories } from "@lib/categories";
import SettingsClient from "@components/SettingsClient";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const [settings, categories] = await Promise.all([
    getUserSettings(user.id),
    listUserCategories(user.id)
  ]);

  return (
    <SettingsClient
      initialSalary={settings.salary ?? 0}
      initialCategories={categories}
    />
  );
}

