
import { Sidebar } from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/use-auth";

export function MainLayout({ children, showSidebar = true }: { children: React.ReactNode, showSidebar?: boolean }) {
  const { user } = useAuth();

  if (!user || !showSidebar) {
    return <>{children}</>;
  }

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 ml-64">
        {children}
      </main>
    </div>
  );
}
