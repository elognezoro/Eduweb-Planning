import { AppProvider } from "@/components/app-shell/app-context";
import { DataStoreProvider } from "@/components/app-shell/data-store";
import { AppShell } from "@/components/app-shell/app-shell";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    // DataStoreProvider à l'extérieur : app-context lit les surcharges de droits / grants du store.
    <DataStoreProvider>
      <AppProvider>
        <AppShell>{children}</AppShell>
      </AppProvider>
    </DataStoreProvider>
  );
}
