
"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  async function sendOtp() {
    setLoading(true); setError("");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
      }
    });
    if (error) setError(error.message);
    else setStep("otp");
    setLoading(false);
  }


  async function verifyOtp() {
    setLoading(true); setError("");
    const { error } = await supabase.auth.verifyOtp({
      email, token: otp, type: "email"
    });
    if (error) setError(error.message);
    else router.push("/dashboard");
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-4xl font-bold text-[#00875A] mb-1">
            হিসাব
          </div>
          <div className="text-sm text-gray-400">Bangla invoicing for Bangladesh SMEs</div>
        </div>

        {step === "email" ? (
          <>
            <div className="mb-1.5 text-sm font-medium text-gray-700">Email Address</div>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#00875A] focus:ring-2 focus:ring-[#00875A]/10 mb-4"
              onKeyDown={e => e.key === "Enter" && sendOtp()}
            />
            {error && <div className="text-red-600 text-sm mb-3">{error}</div>}
            <button
              onClick={sendOtp}
              disabled={loading || !email}
              className="w-full bg-[#00875A] text-white font-semibold py-2.5 rounded-lg text-sm disabled:opacity-50 hover:brightness-105 transition"
            >
              {loading ? "Sending…" : "Send OTP →"}
            </button>
            <div className="text-xs text-gray-400 text-center mt-4">
              We&apos;ll email you a 6-digit code. No password needed.
            </div>
          </>
        ) : (
          <>
            <div className="mb-1 text-sm font-medium text-gray-700">Enter OTP</div>
            <div className="text-xs text-gray-400 mb-4">Sent to {email}</div>
            <input
              type="text"
              value={otp}
              onChange={e => setOtp(e.target.value)}
              placeholder="6-digit code"
              maxLength={6}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#00875A] focus:ring-2 focus:ring-[#00875A]/10 mb-4 tracking-widest text-center text-lg"
              onKeyDown={e => e.key === "Enter" && verifyOtp()}
            />
            {error && <div className="text-red-600 text-sm mb-3">{error}</div>}
            <button
              onClick={verifyOtp}
              disabled={loading || otp.length < 6}
              className="w-full bg-[#00875A] text-white font-semibold py-2.5 rounded-lg text-sm disabled:opacity-50 hover:brightness-105 transition"
            >
              {loading ? "Verifying…" : "Verify & Sign In"}
            </button>
            <button
              onClick={() => { setStep("email"); setOtp(""); setError(""); }}
              className="w-full text-gray-400 text-sm mt-3 hover:text-gray-600"
            >
              ← Change email
            </button>
          </>
        )}
      </div>
    </div>
  );
}