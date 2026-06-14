"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Client } from "@/lib/types";

export default function ClientsPage() {
  const supabase = createClient();
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    const { data: { user } } = await supabase.auth.getUser();
    const { data } = await supabase.from("clients").select("*").eq("user_id", user!.id).order("name");
    setClients(data ?? []);
  }

  useEffect(() => { load(); }, []);

  async function addClient() {
    if (!name.trim()) return;
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("clients").insert({ user_id: user!.id, name: name.trim(), phone: phone || null, address: address || null });
    setName(""); setPhone(""); setAddress("");
    setShowModal(false); setSaving(false);
    load();
  }

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.phone ?? "").includes(search)
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Clients</h1>
          <p className="text-sm text-gray-400 mt-0.5">{clients.length} total</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="bg-[#00875A] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:brightness-105 transition">
          ＋ Add Client
        </button>
      </div>

      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍  Search clients…"
        className="border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none focus:border-[#00875A] w-full max-w-xs mb-5" />

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <div className="text-4xl mb-3">👥</div>
          <div className="font-medium text-gray-600 mb-1">No clients yet</div>
          <button onClick={() => setShowModal(true)}
            className="mt-4 bg-[#00875A] text-white text-sm font-semibold px-4 py-2 rounded-lg">Add your first client</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(c => (
            <div key={c.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:border-[#C0E8D8] hover:shadow-md transition-all cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-[#E3F5EE] text-[#00875A] flex items-center justify-center font-bold text-base mb-3">
                {c.name[0]}
              </div>
              <div className="font-semibold text-gray-800 mb-1">{c.name}</div>
              {c.phone && <div className="text-sm text-gray-500 mb-1">📞 {c.phone}</div>}
              {c.address && <div className="text-sm text-gray-400">📍 {c.address}</div>}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">Add New Client</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Business / Client Name *</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="যেমন: করিম ট্রেডার্স"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#00875A] focus:ring-2 focus:ring-[#00875A]/10" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Phone Number</label>
                <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="017XX-XXXXXX"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#00875A] focus:ring-2 focus:ring-[#00875A]/10" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Address (optional)</label>
                <input value={address} onChange={e => setAddress(e.target.value)} placeholder="এলাকা, জেলা"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#00875A] focus:ring-2 focus:ring-[#00875A]/10" />
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <button onClick={() => setShowModal(false)}
                className="border border-gray-200 text-gray-600 text-sm font-semibold px-4 py-2 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={addClient} disabled={saving || !name.trim()}
                className="bg-[#00875A] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:brightness-105 disabled:opacity-50">
                {saving ? "Saving…" : "Save Client"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
