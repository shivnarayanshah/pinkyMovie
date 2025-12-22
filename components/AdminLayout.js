"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/server/actions/authActions";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function AdminLayout({ children }) {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = async () => {
        const res = await logout();
        if (res.success) {
            toast.success(res.message);
            router.push("/login");
        }
    };

    const navLinks = [
        { name: "Dashboard", href: "/admin/dashboard" },
        { name: "All Movies", href: "/admin/movies" },
        { name: "Add Movie", href: "/admin/add-movie" },
        { name: "API Keys", href: "/admin/api-keys" },
        { name: "API Docs", href: "/admin/docs" },
    ];

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 fixed h-screen overflow-hidden">
                <div className="p-6">
                    <h1 className="text-2xl font-bold text-blue-600">Movie CMS</h1>
                    <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-semibold">Admin Panel</p>
                </div>
                <nav className="mt-4 px-4 space-y-1">
                    {navLinks.map((link) => {
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${isActive
                                    ? "bg-blue-50 text-blue-700"
                                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                    }`}
                            >
                                {link.name}
                            </Link>
                        );
                    })}
                </nav>
                <div className="absolute bottom-0 w-64 p-4 border-t border-gray-200">
                    <div className="space-y-2">
                        <button
                            onClick={async () => {
                                const { fixMovieIndexes } = await import("@/server/actions/movieActions");
                                const res = await fixMovieIndexes();
                                if (res.success) toast.success(res.message);
                                else toast.error(res.message);
                            }}
                            className="flex w-full items-center px-4 py-2 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-all active:scale-95 cursor-pointer"
                        >
                            Fix Database Indexes
                        </button>
                        <button
                            onClick={handleLogout}
                            className="flex w-full items-center px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-all active:scale-95 cursor-pointer"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 min-h-screen">
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-10">
                    <h2 className="text-lg font-semibold text-gray-800">
                        {navLinks.find(l => l.href === pathname)?.name || "Admin"}
                    </h2>
                    <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-500">Welcome, Admin</span>
                    </div>
                </header>
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
