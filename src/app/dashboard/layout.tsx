import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Sidebar from "@/components/ui/Sidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("business_name")
    .eq("id", user.id)
    .single();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Topbar */}
      <header className="h-14 bg-white border-b border-gray-100 flex items-center px-5 gap-3 sticky top-0 z-50">
        <div className="text-2xl font-bold text-[#00875A]" style={{ fontFamily: "'Noto Sans Bengali', sans-serif" }}>
          হিসাব
        </div>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-sm text-gray-400 hidden sm:block">{profile?.business_name}</span>
          <div className="w-8 h-8 rounded-full bg-[#E3F5EE] text-[#00875A] flex items-center justify-center text-sm font-bold">
            {profile?.business_name?.[0] ?? "?"}
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6 sm:p-8 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}
