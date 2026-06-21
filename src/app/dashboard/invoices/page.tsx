import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Invoice } from "@/lib/types";

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    paid: "bg-[#E3F5EE] text-[#00875A]",
    sent: "bg-blue-50 text-blue-700",
    overdue: "bg-red-50 text-red-600",
    draft: "bg-gray-100 text-gray-500",
  };
  const labels: Record<string, string> = {
    paid: "✅ Paid", sent: "📤 Sent", overdue: "⚠️ Overdue", draft: "📝 Draft",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${styles[status] ?? styles.draft}`}>
      {labels[status] ?? status}
    </span>
  );
}

export default async function InvoicesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: invoices } = await supabase
    .from("invoices")
    .select("*, clients(name)")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  const all = (invoices ?? []) as Invoice[];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Invoices</h1>
          <p className="text-sm text-gray-400 mt-0.5">{all.length} total</p>
        </div>
        <Link href="/dashboard/invoices/new" className="bg-[#00875A] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:brightness-105 transition">
          ＋ New Invoice
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        {all.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <div className="text-4xl mb-3">🧾</div>
            <div className="font-medium text-gray-600 mb-1">No invoices yet</div>
            <Link href="/dashboard/invoices/new" className="mt-4 bg-[#00875A] text-white text-sm font-semibold px-4 py-2 rounded-lg">
              Create first invoice
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {["Invoice #", "Client", "Issue Date", "Due Date", "Amount", "Status", ""].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {all.map(inv => (
                  <tr key={inv.id} className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-gray-800">{inv.invoice_number}</td>
                    <td className="px-6 py-4 text-gray-600">{(inv.clients as any)?.name ?? "—"}</td>
                    <td className="px-6 py-4 text-gray-500">{inv.issue_date}</td>
                    <td className="px-6 py-4 text-gray-500">{inv.due_date ?? "—"}</td>
                    <td className="px-6 py-4 font-semibold">৳{Number(inv.total).toLocaleString()}</td>
                    <td className="px-6 py-4"><StatusBadge status={inv.status} /></td>
                    <td className="px-6 py-4">
                      <Link href={`/dashboard/invoices/${inv.id}`} className="text-xs text-[#00875A] font-medium hover:underline">View</Link>
                    </td>
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
