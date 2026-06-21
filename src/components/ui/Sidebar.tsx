"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/dashboard/invoices", label: "Invoices", icon: "🧾" },
  { href: "/dashboard/invoices/new", label: "New Invoice", icon: "✏️" },
  { href: "/dashboard/clients", label: "Clients", icon: "👥" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <nav className="w-[210px] bg-white border-r border-gray-100 flex flex-col py-4 flex-shrink-0">
      <div className="flex flex-col gap-1 px-3 flex-1">
        {links.map(link => {
          const active = pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-[#E3F5EE] text-[#00875A]"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <span>{link.icon}</span>
              {link.label}
            </Link>
          );
        })}
      </div>
      <div className="px-3 border-t border-gray-100 pt-3 mt-3">
        <Link
          href="/dashboard/settings"
          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors mb-1 ${
            pathname === "/dashboard/settings" ? "bg-[#E3F5EE] text-[#00875A]" : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          <span>⚙️</span> Settings
        </Link>
        <button
          onClick={signOut}
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-50 w-full text-left transition-colors"
        >
          <span>🚪</span> Sign Out
        </button>
      </div>
    </nav>
  );
}
