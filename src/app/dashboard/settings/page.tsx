"use client";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Profile } from "@/lib/types";

export default function SettingsPage() {
  const supabase = createClient();
  const [profile, setProfile] = useState<Partial<Profile>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

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
      bkash_number: profile.bkash_number,
    }).eq("id", user!.id);
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  async function uploadLogo(file: File) {
    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const ext = file.name.split(".").pop();
      const filePath = `${user.id}/logo.${ext}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("logos")
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        setUploading(false);
        return;
      }

      // Get public URL
      const { data: urlData } = supabase.storage.from("logos").getPublicUrl(filePath);

      // Update profile
      await supabase.from("profiles").update({ logo_url: urlData.publicUrl }).eq("id", user.id);
      setProfile(p => ({ ...p, logo_url: urlData.publicUrl }));
    } catch (err) {
      console.error("Logo upload failed:", err);
    }
    setUploading(false);
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
        {/* Business Profile */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-5">
          <h2 className="font-semibold text-gray-800 mb-1">Business Profile</h2>
          <p className="text-sm text-gray-400 mb-5">This info appears on every invoice you send.</p>

          {/* Logo Upload */}
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
            <div
              onClick={() => fileRef.current?.click()}
              className="w-16 h-16 rounded-xl bg-[#E3F5EE] border-2 border-dashed border-[#C0E8D8] flex items-center justify-center text-2xl cursor-pointer hover:border-[#00875A] transition overflow-hidden"
            >
              {uploading ? (
                <div className="w-5 h-5 border-2 border-[#00875A] border-t-transparent rounded-full animate-spin" />
              ) : profile.logo_url ? (
                <img src={profile.logo_url} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                "🏪"
              )}
            </div>
            <div>
              <div className="text-sm font-medium text-gray-700">Business Logo</div>
              <div className="text-xs text-gray-400 mt-0.5 mb-2">Appears on PDF invoice header</div>
              <button onClick={() => fileRef.current?.click()} disabled={uploading}
                className="text-xs border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50 disabled:opacity-50">
                {uploading ? "Uploading…" : profile.logo_url ? "Change logo" : "Upload logo"}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => {
                  const f = e.target.files?.[0];
                  if (f) uploadLogo(f);
                }}
              />
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

        {/* Payment Settings */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-5">
          <h2 className="font-semibold text-gray-800 mb-1">Payment Methods</h2>
          <p className="text-sm text-gray-400 mb-5">Configure bKash info that appears on your invoices.</p>

          <div className="bg-gradient-to-br from-pink-50 to-pink-100/50 border border-pink-200 rounded-xl p-5 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">💳</span>
              <span className="text-sm font-bold text-pink-700">bKash</span>
            </div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">bKash Number</label>
            <input
              value={profile.bkash_number ?? ""}
              onChange={e => setProfile(p => ({ ...p, bkash_number: e.target.value }))}
              placeholder="01XXX-XXXXXX"
              className="w-full border border-pink-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-400/10 bg-white"
            />
            <p className="text-xs text-gray-400 mt-2">
              This number will appear on every invoice PDF with payment instructions for your clients.
            </p>
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
