import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Invoice } from "@/lib/types";

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    paid: "bg-[#E3F5EE] text-[#00875A]",
    pending: "bg-amber-50 text-amber-700",
    sent: "bg-blue-50 text-blue-700",
    overdue: "bg-red-50 text-red-600",
    draft: "bg-gray-100 text-gray-500",
  };
  const labels: Record<string, string> = {
    paid: "✅ Paid", pending: "🕐 Pending", sent: "📤 Sent",
    overdue: "⚠️ Overdue", draft: "📝 Draft",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${styles[status] ?? styles.draft}`}>
      {labels[status] ?? status}
    </span>
  );
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: invoices }, { data: clients }] = await Promise.all([
    supabase.from("invoices").select("*, clients(name)").eq("user_id", user!.id).order("created_at", { ascending: false }),
    supabase.from("clients").select("id").eq("user_id", user!.id),
  ]);

  const all = (invoices ?? []) as Invoice[];
  const totalRevenue = all.filter(i => i.status === "paid").reduce((s, i) => s + Number(i.total), 0);
  const pending = all.filter(i => i.status === "sent" || i.status === "pending");
  const overdue = all.filter(i => i.status === "overdue");
  const pendingAmt = pending.reduce((s, i) => s + Number(i.total), 0);
  const overdueAmt = overdue.reduce((s, i) => s + Number(i.total), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-400 mt-0.5">Welcome back — here&apos;s your business at a glance</p>
        </div>
        <Link href="/dashboard/invoices/new" className="bg-[#00875A] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:brightness-105 transition">
          ＋ New Invoice
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Revenue", value: `৳${totalRevenue.toLocaleString()}`, sub: "Paid invoices", color: "text-[#00875A]" },
          { label: "Pending", value: `৳${pendingAmt.toLocaleString()}`, sub: `${pending.length} invoices`, color: "text-amber-600" },
          { label: "Overdue", value: `৳${overdueAmt.toLocaleString()}`, sub: `${overdue.length} invoices`, color: "text-red-500" },
          { label: "Clients", value: String(clients?.length ?? 0), sub: "Total clients", color: "text-gray-800" },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{stat.label}</div>
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-xs text-gray-400 mt-1">{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Recent invoices */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">Recent Invoices</h2>
          <Link href="/dashboard/invoices" className="text-sm text-[#00875A] font-medium hover:underline">View all →</Link>
        </div>
        {all.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <div className="text-4xl mb-3">🧾</div>
            <div className="font-medium text-gray-600 mb-1">No invoices yet</div>
            <div className="text-sm">Create your first invoice to get started</div>
            <Link href="/dashboard/invoices/new" className="mt-4 bg-[#00875A] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:brightness-105 transition">
              ＋ New Invoice
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  {["Invoice #", "Client", "Date", "Amount", "Status"].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {all.slice(0, 8).map(inv => (
                  <tr key={inv.id} className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-gray-800">
                      <Link href={`/invoices/${inv.id}`} className="hover:text-[#00875A]">{inv.invoice_number}</Link>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{(inv.clients as any)?.name ?? "—"}</td>
                    <td className="px-6 py-4 text-gray-500">{inv.issue_date}</td>
                    <td className="px-6 py-4 font-semibold">৳{Number(inv.total).toLocaleString()}</td>
                    <td className="px-6 py-4"><StatusBadge status={inv.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
