import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center px-4">
      <h1 className="text-5xl font-black text-gray-900 mb-6 tracking-tight">Movie CMS Backend</h1>
      <p className="text-xl text-gray-600 mb-10 max-w-2xl">
        A high-performance, secure backend management system for your movie application.
        Built with Next.js App Router, MongoDB, and TMDB Integration.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/admin/dashboard"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-2xl transition-all shadow-xl shadow-blue-200 active:scale-95"
        >
          Admin Dashboard
        </Link>
        <Link
          href="/api/movies"
          className="bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 font-bold py-4 px-8 rounded-2xl transition-all shadow-sm active:scale-95"
        >
          View API (Public)
        </Link>
      </div>

      <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl">
        <div className="p-8 bg-white rounded-3xl border border-gray-100 shadow-sm">
          <div className="text-4xl mb-4">🚀</div>
          <h3 className="text-lg font-bold mb-2">Fast & Scalable</h3>
          <p className="text-gray-500 text-sm">Optimized queries and caching using Next.js unstable_cache and MongoDB lean.</p>
        </div>
        <div className="p-8 bg-white rounded-3xl border border-gray-100 shadow-sm">
          <div className="text-4xl mb-4">🔐</div>
          <h3 className="text-lg font-bold mb-2">Secure</h3>
          <p className="text-gray-500 text-sm">JWT authentication, middleware protection, and API key system with rate-limiting.</p>
        </div>
        <div className="p-8 bg-white rounded-3xl border border-gray-100 shadow-sm">
          <div className="text-4xl mb-4">🎬</div>
          <h3 className="text-lg font-bold mb-2">TMDB Sync</h3>
          <p className="text-gray-500 text-sm">Instantly fetch and normalize movie data using the powerful TMDB API.</p>
        </div>
      </div>
    </div>
  );
}