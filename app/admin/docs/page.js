"use client";

import AdminLayout from "@/components/AdminLayout";
import { useState } from "react";

export default function ApiDocsPage() {
    const [activeTab, setActiveTab] = useState("curl");

    const renderExample = () => {
        switch (activeTab) {
            case "curl":
                return (
                    <div className="bg-gray-900 p-6 rounded-xl font-mono text-sm text-blue-300 overflow-x-auto shadow-inner">
                        <span className="text-gray-500"># Example using curl</span><br />
                        curl -X GET \<br />
                        &nbsp;&nbsp;<span className="text-green-400">"http://localhost:3000/api/movies"</span> \<br />
                        &nbsp;&nbsp;-H <span className="text-green-400">"x-api-key: your_api_key_here"</span>
                    </div>
                );
            case "postman":
                return (
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
                        <div className="flex items-start gap-4">
                            <div className="w-6 h-6 bg-orange-100 text-orange-600 rounded flex items-center justify-center font-bold text-xs shrink-0 mt-1">1</div>
                            <p className="text-sm text-gray-600">Open Postman and create a new <strong>GET</strong> request.</p>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-6 h-6 bg-orange-100 text-orange-600 rounded flex items-center justify-center font-bold text-xs shrink-0 mt-1">2</div>
                            <p className="text-sm text-gray-600">Enter the URL: <code className="bg-gray-50 px-2 py-1 rounded text-orange-600 font-bold">http://localhost:3000/api/movies</code></p>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-6 h-6 bg-orange-100 text-orange-600 rounded flex items-center justify-center font-bold text-xs shrink-0 mt-1">3</div>
                            <div className="space-y-1">
                                <p className="text-sm text-gray-600">Go to the <strong>Headers</strong> tab.</p>
                                <p className="text-xs font-bold text-gray-400">KEY: <span className="text-gray-900 ml-2">x-api-key</span></p>
                                <p className="text-xs font-bold text-gray-400">VALUE: <span className="text-gray-900 ml-2">your_api_key_here</span></p>
                            </div>
                        </div>
                    </div>
                );
            case "tester":
                return (
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
                        <p className="text-sm text-gray-600 leading-relaxed">
                            For tools like <span className="font-bold">Insomnia</span>, <span className="font-bold">Thunder Client</span>, or specialized <span className="font-bold">API Testers</span>:
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Endpoint URL</span>
                                <code className="text-xs font-bold block overflow-x-auto text-blue-600">http://localhost:3000/api/movies</code>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Header Configuration</span>
                                <code className="text-xs font-bold block">x-api-key: [YOUR_KEY]</code>
                            </div>
                        </div>
                        <div className="p-4 bg-blue-50 text-blue-700 rounded-xl text-xs italic">
                            ProTip: Ensure you are sending a GET request and your local server is running on port 3000.
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <AdminLayout>
            <div className="max-w-4xl mx-auto space-y-12 pb-20">
                {/* Header */}
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-10 rounded-3xl text-white shadow-xl shadow-blue-100 relative overflow-hidden">
                    <div className="relative z-10">
                        <h1 className="text-3xl font-black mb-4">Movie API Documentation</h1>
                        <p className="text-blue-100 text-lg max-w-2xl leading-relaxed">
                            Integrate our movie database into your applications.
                            Authentication is required via headers.
                        </p>
                    </div>
                    <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
                </div>

                {/* Authentication Section */}
                <section className="space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center font-bold">1</div>
                        <h2 className="text-2xl font-bold text-gray-800">Authentication</h2>
                    </div>

                    <div className="space-y-4">
                        <p className="text-gray-600">
                            Include your API key in the <code className="bg-gray-100 px-2 py-0.5 rounded text-red-500 font-mono">x-api-key</code> header.
                            Choose your preferred integration method below:
                        </p>

                        <div className="flex gap-2">
                            {["curl", "postman", "tester"].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all uppercase tracking-wider border ${activeTab === tab
                                        ? "bg-blue-600 text-white border-blue-600 shadow-md"
                                        : "bg-white text-gray-500 border-gray-200 hover:border-blue-300"
                                        }`}
                                >
                                    {tab === "tester" ? "API Testers" : tab}
                                </button>
                            ))}
                        </div>

                        <div className="mt-4">
                            {renderExample()}
                        </div>
                    </div>
                </section>

                {/* Endpoints Section */}
                <section className="space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center font-bold">2</div>
                        <h2 className="text-2xl font-bold text-gray-800">Endpoints</h2>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-blue-50/30">
                            <div className="flex items-center gap-3">
                                <span className="bg-blue-600 text-white px-3 py-1 rounded-lg text-xs font-black uppercase">GET</span>
                                <code className="text-gray-800 font-bold">/api/movies</code>
                            </div>
                            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Fetch Movies</span>
                        </div>

                        <div className="p-6 space-y-6">
                            <div>
                                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Query Parameters</h4>
                                <table className="w-full text-left text-sm">
                                    <thead className="text-gray-400 font-bold border-b border-gray-100">
                                        <tr>
                                            <th className="pb-3">Param</th>
                                            <th className="pb-3">Type</th>
                                            <th className="pb-3">Default</th>
                                            <th className="pb-3">Description</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50 text-gray-600">
                                        <tr>
                                            <td className="py-3 font-mono text-blue-600">page</td>
                                            <td className="py-3 italic">number</td>
                                            <td className="py-3">1</td>
                                            <td className="py-3">Current page number</td>
                                        </tr>
                                        <tr>
                                            <td className="py-3 font-mono text-blue-600">search</td>
                                            <td className="py-3 italic">string</td>
                                            <td className="py-3">-</td>
                                            <td className="py-3">Search by title or overview</td>
                                        </tr>
                                        <tr>
                                            <td className="py-3 font-mono text-blue-600">genre</td>
                                            <td className="py-3 italic">string</td>
                                            <td className="py-3">-</td>
                                            <td className="py-3">Filter by specific genre</td>
                                        </tr>
                                        <tr>
                                            <td className="py-3 font-mono text-blue-600">language</td>
                                            <td className="py-3 italic">string</td>
                                            <td className="py-3">-</td>
                                            <td className="py-3">Filter by ISO language code</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <div>
                                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Response Structure</h4>
                                <div className="bg-gray-900 p-4 rounded-xl font-mono text-sm text-green-400 overflow-x-auto">
                                    <pre>{`{
  "success": true,
  "data": [
    {
      "title": "Inception",
      "rating": 8.8,
      "genres": ["Action", "Sci-Fi"],
      ...
    }
  ],
  "pagination": {
    "total": 124,
    "page": 1,
    "totalPages": 7
  }
}`}</pre>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* GET /api/movies/:id */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-blue-50/30">
                            <div className="flex items-center gap-3">
                                <span className="bg-blue-600 text-white px-3 py-1 rounded-lg text-xs font-black uppercase">GET</span>
                                <code className="text-gray-800 font-bold">/api/movies/:id</code>
                            </div>
                            <span className="text-xs text-green-600 font-bold uppercase tracking-wider">Fetch & Tracking</span>
                        </div>
                        <div className="p-6 space-y-4">
                            <p className="text-sm text-gray-600">
                                Fetch details for a single movie using its <code className="text-blue-600 font-bold">movie_id</code> (e.g., TMDB ID).
                                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700 uppercase">Increments Views</span>
                            </p>
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Example URL</span>
                                <code className="text-xs font-bold text-blue-600">http://localhost:3000/api/movies/550</code>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Error Codes Section */}
                <section className="space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center font-bold">3</div>
                        <h2 className="text-2xl font-bold text-gray-800">Error Codes</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center gap-4">
                            <span className="text-red-500 font-bold text-lg">401</span>
                            <div>
                                <p className="font-bold text-gray-800">Unauthorized</p>
                                <p className="text-xs text-gray-500">API Key is missing from headers</p>
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center gap-4">
                            <span className="text-red-500 font-bold text-lg">403</span>
                            <div>
                                <p className="font-bold text-gray-800">Forbidden</p>
                                <p className="text-xs text-gray-500">Invalid or deactivated API Key</p>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </AdminLayout>
    );
}
