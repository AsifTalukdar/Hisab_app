"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Profile } from "@/lib/types";

export default function SettingsPage() {
  const supabase = createClient();
  const [profile, setProfile] = useState<Partial<Profile>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      const { data } = await supabase.from("profiles").select("*").eq("id", user!.id).single();
      if (data) setProfile(data);
    }
    load();
  }, []);

  async function save() {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("profiles").update({
      business_name: profile.business_name,
      phone: profile.phone,
      address: profile.address,
    }).eq("id", user!.id);
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-400 mt-0.5">Manage your business profile</p>
        </div>
        <button onClick={save} disabled={saving}
          className="bg-[#00875A] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:brightness-105 transition disabled:opacity-50">
          {saving ? "Saving…" : saved ? "✓ Saved" : "Save Changes"}
        </button>
      </div>

      <div className="max-w-2xl">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-5">
          <h2 className="font-semibold text-gray-800 mb-1">Business Profile</h2>
          <p className="text-sm text-gray-400 mb-5">This info appears on every invoice you send.</p>

          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
            <div className="w-16 h-16 rounded-xl bg-[#E3F5EE] border-2 border-dashed border-[#C0E8D8] flex items-center justify-center text-2xl cursor-pointer hover:border-[#00875A] transition">
              🏪
            </div>
            <div>
              <div className="text-sm font-medium text-gray-700">Business Logo</div>
              <div className="text-xs text-gray-400 mt-0.5 mb-2">Appears on PDF invoice header</div>
              <button className="text-xs border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50">Upload logo</button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Business Name</label>
              <input value={profile.business_name ?? ""} onChange={e => setProfile(p => ({ ...p, business_name: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#00875A] focus:ring-2 focus:ring-[#00875A]/10" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Phone Number</label>
              <input value={profile.phone ?? ""} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#00875A] focus:ring-2 focus:ring-[#00875A]/10" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Address</label>
              <input value={profile.address ?? ""} onChange={e => setProfile(p => ({ ...p, address: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#00875A] focus:ring-2 focus:ring-[#00875A]/10" />
            </div>
          </div>
        </div>

        {/* Plan */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Plan & Billing</h2>
          <div className="bg-[#E3F5EE] border border-[#C0E8D8] rounded-xl p-4 flex items-center justify-between">
            <div>
              <div className="font-bold text-[#00875A]">Starter Plan</div>
              <div className="text-xs text-gray-500 mt-0.5">Unlimited invoices · bKash/Nagad · SMS reminders</div>
            </div>
            <div className="text-xl font-extrabold text-[#00875A]">৳299<span className="text-xs font-normal text-gray-400">/mo</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
