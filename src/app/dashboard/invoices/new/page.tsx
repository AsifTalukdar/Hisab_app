"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Client, InvoiceItem } from "@/lib/types";

type LineItem = Omit<InvoiceItem, "id" | "invoice_id">;

export default function NewInvoicePage() {
  const router = useRouter();
  const supabase = createClient();

  const [clients, setClients] = useState<Client[]>([]);
  const [clientId, setClientId] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("INV-001");
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<LineItem[]>([{ description: "", quantity: 1, unit_price: 0, amount: 0 }]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      const [{ data: c }, { data: inv }] = await Promise.all([
        supabase.from("clients").select("*").eq("user_id", user!.id).order("name"),
        supabase.from("invoices").select("invoice_number").eq("user_id", user!.id).order("created_at", { ascending: false }).limit(1),
      ]);
      setClients(c ?? []);
      if (inv && inv.length > 0) {
        const last = inv[0].invoice_number;
        const num = parseInt(last.replace(/\D/g, "")) + 1;
        setInvoiceNumber(`INV-${String(num).padStart(3, "0")}`);
      }
    }
    load();
  }, []);

  function updateItem(index: number, field: keyof LineItem, value: string | number) {
    setItems(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      next[index].amount = next[index].quantity * next[index].unit_price;
      return next;
    });
  }

  const subtotal = items.reduce((s, i) => s + i.amount, 0);

  async function save(status: "draft" | "sent") {
    if (!clientId) { setError("Please select a client"); return; }
    if (!items.some(i => i.description)) { setError("Add at least one item"); return; }
    setSaving(true); setError("");
    const { data: { user } } = await supabase.auth.getUser();
    const { data: inv, error: invErr } = await supabase.from("invoices").insert({
      user_id: user!.id, client_id: clientId, invoice_number: invoiceNumber,
      issue_date: issueDate, due_date: dueDate || null, status,
      notes: notes || null, subtotal, total: subtotal,
    }).select().single();
    if (invErr) { setError(invErr.message); setSaving(false); return; }
    await supabase.from("invoice_items").insert(
      items.filter(i => i.description).map(i => ({ ...i, invoice_id: inv.id }))
    );
    router.push("/dashboard/invoices");
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">New Invoice</h1>
          <p className="text-sm text-gray-400 mt-0.5">Fill in the details below</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => save("draft")} disabled={saving}
            className="border border-gray-200 text-gray-700 text-sm font-semibold px-4 py-2 rounded-lg hover:bg-gray-50 transition disabled:opacity-50">
            Save Draft
          </button>
          <button onClick={() => save("sent")} disabled={saving}
            className="bg-[#00875A] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:brightness-105 transition disabled:opacity-50">
            {saving ? "Saving…" : "Save & Send"}
          </button>
        </div>
      </div>

      {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 flex flex-col gap-5">

          {/* Details */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-semibold text-gray-800 mb-4">Invoice Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Client</label>
                <select value={clientId} onChange={e => setClientId(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#00875A] focus:ring-2 focus:ring-[#00875A]/10">
                  <option value="">Select client…</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Invoice Number</label>
                <input value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#00875A] focus:ring-2 focus:ring-[#00875A]/10" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Issue Date</label>
                <input type="date" value={issueDate} onChange={e => setIssueDate(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#00875A] focus:ring-2 focus:ring-[#00875A]/10" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Due Date (optional)</label>
                <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#00875A] focus:ring-2 focus:ring-[#00875A]/10" />
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-800">Items</h2>
              <button onClick={() => setItems(p => [...p, { description: "", quantity: 1, unit_price: 0, amount: 0 }])}
                className="text-sm text-[#00875A] font-medium hover:underline">＋ Add Item</button>
            </div>
            <table className="w-full text-sm mb-4">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs text-gray-400 font-semibold pb-2 pr-3">Description</th>
                  <th className="text-left text-xs text-gray-400 font-semibold pb-2 pr-3 w-20">Qty</th>
                  <th className="text-left text-xs text-gray-400 font-semibold pb-2 pr-3 w-32">Unit Price (৳)</th>
                  <th className="text-right text-xs text-gray-400 font-semibold pb-2 w-28">Amount (৳)</th>
                  <th className="w-8"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    <td className="py-2 pr-3">
                      <input value={item.description} onChange={e => updateItem(i, "description", e.target.value)}
                        placeholder="Description…"
                        className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-[#00875A]" />
                    </td>
                    <td className="py-2 pr-3">
                      <input type="number" min="1" value={item.quantity} onChange={e => updateItem(i, "quantity", +e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-[#00875A]" />
                    </td>
                    <td className="py-2 pr-3">
                      <input type="number" min="0" value={item.unit_price} onChange={e => updateItem(i, "unit_price", +e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-[#00875A]" />
                    </td>
                    <td className="py-2 text-right font-semibold text-gray-700">৳{item.amount.toLocaleString()}</td>
                    <td className="py-2 pl-2">
                      {items.length > 1 && (
                        <button onClick={() => setItems(p => p.filter((_, j) => j !== i))}
                          className="text-gray-300 hover:text-red-400 text-lg leading-none">✕</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-end gap-16 text-sm border-t border-gray-100 pt-4">
              <span className="text-gray-400">Subtotal</span>
              <span className="font-semibold">৳{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-end gap-16 mt-2">
              <span className="text-base font-bold text-[#00875A]">Total</span>
              <span className="text-base font-bold text-[#00875A]">৳{subtotal.toLocaleString()}</span>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-semibold text-gray-800 mb-3">Notes</h2>
            <textarea value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="Payment terms, delivery info, thank you note…"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#00875A] focus:ring-2 focus:ring-[#00875A]/10 h-24 resize-none" />
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-5">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-semibold text-gray-800 mb-3">Payment</h2>
            <div className="bg-[#E3F5EE] border border-[#C0E8D8] rounded-lg p-4">
              <div className="text-xs font-semibold text-[#00875A] mb-1">bKash / Nagad link</div>
              <div className="text-xs text-gray-500">Configure in Settings → Payment Methods. The link appears automatically on every invoice PDF.</div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-semibold text-gray-800 mb-3">Actions</h2>
            <div className="flex flex-col gap-2">
              <button onClick={() => save("sent")} disabled={saving}
                className="w-full bg-[#00875A] text-white text-sm font-semibold py-2.5 rounded-lg hover:brightness-105 transition disabled:opacity-50">
                📤 Save & Send
              </button>
              <button onClick={() => save("draft")} disabled={saving}
                className="w-full border border-gray-200 text-gray-600 text-sm font-semibold py-2.5 rounded-lg hover:bg-gray-50 transition disabled:opacity-50">
                📝 Save Draft
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
