"use client";
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { InvoiceWithItems, Profile } from "@/lib/types";
import dynamic from "next/dynamic";

const InvoicePDFDownload = dynamic(
  () => import("@/components/invoice/InvoicePDFDownload"),
  { ssr: false }
);

type InvoiceWithClient = InvoiceWithItems & {
  clients: { id: string; name: string; phone: string | null; address: string | null } | null;
};

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    paid: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    sent: "bg-blue-50 text-blue-700 border border-blue-200",
    overdue: "bg-red-50 text-red-600 border border-red-200",
    draft: "bg-gray-100 text-gray-500 border border-gray-200",
  };
  const labels: Record<string, string> = {
    paid: "✅ Paid", sent: "📤 Sent", overdue: "⚠️ Overdue", draft: "📝 Draft",
  };
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${styles[status] ?? styles.draft}`}>
      {labels[status] ?? status}
    </span>
  );
}

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const invoiceId = params.id as string;

  const [invoice, setInvoice] = useState<InvoiceWithClient | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [{ data: inv }, { data: prof }] = await Promise.all([
      supabase
        .from("invoices")
        .select("*, clients(id, name, phone, address), invoice_items(*)")
        .eq("id", invoiceId)
        .single(),
      supabase.from("profiles").select("*").eq("id", user.id).single(),
    ]);

    setInvoice(inv as InvoiceWithClient);
    setProfile(prof as Profile);
    setLoading(false);
  }, [invoiceId]);

  useEffect(() => { load(); }, [load]);

  async function updateStatus(newStatus: string) {
    setUpdating(true);
    await supabase.from("invoices").update({ status: newStatus }).eq("id", invoiceId);
    await load();
    setUpdating(false);
  }

  async function deleteInvoice() {
    setDeleting(true);
    await supabase.from("invoice_items").delete().eq("invoice_id", invoiceId);
    await supabase.from("invoices").delete().eq("id", invoiceId);
    router.push("/dashboard/invoices");
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#00875A] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-gray-400">Loading invoice…</span>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-gray-400">
        <div className="text-5xl mb-4">🔍</div>
        <div className="font-semibold text-gray-600 text-lg mb-1">Invoice not found</div>
        <div className="text-sm mb-6">This invoice may have been deleted or doesn&apos;t exist.</div>
        <Link href="/dashboard/invoices" className="bg-[#00875A] text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:brightness-105 transition">
          ← Back to Invoices
        </Link>
      </div>
    );
  }

  const client = invoice.clients;
  const items = invoice.invoice_items ?? [];

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Link href="/dashboard/invoices" className="text-gray-400 hover:text-gray-600 transition">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>
            </Link>
            <h1 className="text-xl font-bold text-gray-900">{invoice.invoice_number}</h1>
            <StatusBadge status={invoice.status} />
          </div>
          <p className="text-sm text-gray-400 ml-8">
            Issued {new Date(invoice.issue_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
            {invoice.due_date && ` · Due ${new Date(invoice.due_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Status Actions */}
          {invoice.status === "draft" && (
            <button onClick={() => updateStatus("sent")} disabled={updating}
              className="bg-blue-500 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-600 transition disabled:opacity-50 flex items-center gap-1.5">
              📤 {updating ? "Updating…" : "Mark as Sent"}
            </button>
          )}
          {(invoice.status === "sent" || invoice.status === "overdue") && (
            <button onClick={() => updateStatus("paid")} disabled={updating}
              className="bg-emerald-500 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-emerald-600 transition disabled:opacity-50 flex items-center gap-1.5">
              ✅ {updating ? "Updating…" : "Mark as Paid"}
            </button>
          )}

          {/* PDF Download */}
          {profile && (
            <InvoicePDFDownload invoice={invoice} profile={profile} />
          )}

          {/* Delete */}
          <button onClick={() => setShowDeleteConfirm(true)}
            className="border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 text-sm px-3 py-2 rounded-lg transition">
            🗑️
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main content */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          {/* Client Info */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-800">Bill To</h2>
              {client && (
                <div className="w-9 h-9 rounded-full bg-[#E3F5EE] text-[#00875A] flex items-center justify-center font-bold text-sm">
                  {client.name[0]}
                </div>
              )}
            </div>
            {client ? (
              <div>
                <div className="font-semibold text-gray-800 text-lg mb-1">{client.name}</div>
                {client.phone && <div className="text-sm text-gray-500 flex items-center gap-1.5">📞 {client.phone}</div>}
                {client.address && <div className="text-sm text-gray-400 flex items-center gap-1.5 mt-0.5">📍 {client.address}</div>}
              </div>
            ) : (
              <div className="text-sm text-gray-400">Client information not available</div>
            )}
          </div>

          {/* Line Items */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-800">Items</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-3">#</th>
                    <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-3">Description</th>
                    <th className="text-right text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-3">Qty</th>
                    <th className="text-right text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-3">Unit Price</th>
                    <th className="text-right text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-3">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => (
                    <tr key={item.id} className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 text-gray-400">{i + 1}</td>
                      <td className="px-6 py-4 text-gray-800 font-medium">{item.description}</td>
                      <td className="px-6 py-4 text-right text-gray-600">{item.quantity}</td>
                      <td className="px-6 py-4 text-right text-gray-600">৳{Number(item.unit_price).toLocaleString()}</td>
                      <td className="px-6 py-4 text-right font-semibold text-gray-800">৳{Number(item.amount).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="border-t border-gray-100 px-6 py-4">
              <div className="flex justify-end gap-16 mb-2">
                <span className="text-sm text-gray-400">Subtotal</span>
                <span className="text-sm font-semibold text-gray-700">৳{Number(invoice.subtotal).toLocaleString()}</span>
              </div>
              <div className="flex justify-end gap-16">
                <span className="text-base font-bold text-[#00875A]">Total</span>
                <span className="text-base font-bold text-[#00875A]">৳{Number(invoice.total).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-semibold text-gray-800 mb-2">Notes</h2>
              <p className="text-sm text-gray-500 whitespace-pre-wrap">{invoice.notes}</p>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-5">
          {/* Summary card */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-semibold text-gray-800 mb-4">Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Invoice Number</span>
                <span className="font-medium text-gray-700">{invoice.invoice_number}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Issue Date</span>
                <span className="font-medium text-gray-700">{new Date(invoice.issue_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
              </div>
              {invoice.due_date && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Due Date</span>
                  <span className={`font-medium ${invoice.status === "overdue" ? "text-red-500" : "text-gray-700"}`}>
                    {new Date(invoice.due_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Status</span>
                <StatusBadge status={invoice.status} />
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Items</span>
                <span className="font-medium text-gray-700">{items.length}</span>
              </div>
              <div className="border-t border-gray-100 pt-3 flex justify-between">
                <span className="font-semibold text-gray-700">Total</span>
                <span className="text-lg font-bold text-[#00875A]">৳{Number(invoice.total).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* bKash Payment Info */}
          {profile?.bkash_number && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-semibold text-gray-800 mb-3">Payment Info</h2>
              <div className="bg-gradient-to-br from-pink-50 to-pink-100/50 border border-pink-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">💳</span>
                  <span className="text-sm font-bold text-pink-700">bKash</span>
                </div>
                <div className="text-xs text-gray-500 mb-1">Send payment to:</div>
                <div className="text-base font-bold text-gray-800 tracking-wide">{profile.bkash_number}</div>
                <div className="text-xs text-gray-400 mt-2">Reference: {invoice.invoice_number}</div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-semibold text-gray-800 mb-3">Actions</h2>
            <div className="flex flex-col gap-2">
              {invoice.status === "draft" && (
                <button onClick={() => updateStatus("sent")} disabled={updating}
                  className="w-full bg-blue-500 text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-blue-600 transition disabled:opacity-50">
                  📤 Mark as Sent
                </button>
              )}
              {(invoice.status === "sent" || invoice.status === "overdue") && (
                <button onClick={() => updateStatus("paid")} disabled={updating}
                  className="w-full bg-emerald-500 text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-emerald-600 transition disabled:opacity-50">
                  ✅ Mark as Paid
                </button>
              )}
              {profile && (
                <InvoicePDFDownload invoice={invoice} profile={profile} fullWidth />
              )}
              <button onClick={() => setShowDeleteConfirm(true)}
                className="w-full border border-red-200 text-red-500 text-sm font-semibold py-2.5 rounded-lg hover:bg-red-50 transition">
                🗑️ Delete Invoice
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && setShowDeleteConfirm(false)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full overflow-hidden">
            <div className="p-6 text-center">
              <div className="text-4xl mb-3">⚠️</div>
              <h3 className="font-bold text-gray-900 text-lg mb-1">Delete Invoice?</h3>
              <p className="text-sm text-gray-500">
                This will permanently delete <strong>{invoice.invoice_number}</strong> and all its items. This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 border border-gray-200 text-gray-600 text-sm font-semibold py-2.5 rounded-lg hover:bg-gray-50 transition">
                Cancel
              </button>
              <button onClick={deleteInvoice} disabled={deleting}
                className="flex-1 bg-red-500 text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-red-600 transition disabled:opacity-50">
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
