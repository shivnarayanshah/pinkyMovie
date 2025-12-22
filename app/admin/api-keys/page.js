"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { generateApiKey, listApiKeys, toggleApiKeyStatus, deleteApiKey } from "@/server/actions/apiKeyActions";
import toast from "react-hot-toast";

export default function ApiKeysPage() {
    const [keys, setKeys] = useState([]);
    const [loading, setLoading] = useState(true);
    const [label, setLabel] = useState("");
    const [newKey, setNewKey] = useState(null);

    const fetchKeys = async () => {
        setLoading(true);
        const data = await listApiKeys();
        setKeys(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchKeys();
    }, []);

    const handleGenerate = async (e) => {
        e.preventDefault();
        if (!label) return toast.error("Please provide a label");

        const res = await generateApiKey(label);
        if (res.success) {
            setNewKey(res.apiKey);
            setLabel("");
            fetchKeys();
            toast.success("API Key generated");
        }
    };

    const handleToggle = async (id) => {
        const res = await toggleApiKeyStatus(id);
        if (res.success) {
            toast.success(res.message);
            fetchKeys();
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure? This will break any application using this key.")) return;
        const res = await deleteApiKey(id);
        if (res.success) {
            toast.success(res.message);
            fetchKeys();
        }
    };

    return (
        <AdminLayout>
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Generate Section */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold mb-6 italic text-gray-800 underline decoration-blue-200">Generate New API Key</h3>
                    <form onSubmit={handleGenerate} className="flex gap-4">
                        <input
                            type="text"
                            placeholder="Key Label (e.g., Mobile App)"
                            className="flex-1 px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-inner"
                            value={label}
                            onChange={(e) => setLabel(e.target.value)}
                        />
                        <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition-all active:scale-95 shadow-lg shadow-blue-100">
                            Generate
                        </button>
                    </form>

                    {newKey && (
                        <div className="mt-6 p-6 bg-yellow-50 border-2 border-dashed border-yellow-200 rounded-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-2 text-[10px] font-bold text-yellow-600 bg-yellow-100 rounded-bl-xl uppercase">Warning: Copy now</div>
                            <p className="text-sm font-bold text-yellow-800 mb-2">New API Key (Hidden forever after refresh):</p>
                            <code className="block bg-white p-4 rounded-xl border border-yellow-100 text-blue-700 font-mono text-sm break-all shadow-sm">
                                {newKey}
                            </code>
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(newKey);
                                    toast.success("Copied to clipboard");
                                }}
                                className="mt-2 text-xs font-bold text-blue-600 hover:underline"
                            >
                                Copy to Clipboard
                            </button>
                        </div>
                    )}
                </div>

                {/* List Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
                        <h3 className="font-bold text-gray-800">Your API Keys</h3>
                        <span className="text-xs font-bold px-2 py-1 bg-blue-100 text-blue-600 rounded-md">{keys.length} Keys</span>
                    </div>

                    <div className="divide-y divide-gray-100">
                        {loading ? (
                            <div className="p-10 text-center text-gray-400 animate-pulse">Loading keys...</div>
                        ) : keys.length > 0 ? (
                            keys.map((key) => (
                                <div key={key._id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors group">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3">
                                            <p className="font-bold text-gray-900">{key.label}</p>
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${key.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                                {key.isActive ? "Active" : "Inactive"}
                                            </span>
                                        </div>
                                        <p className="text-xs font-mono text-gray-400">{key.key}</p>
                                        <p className="text-[10px] text-gray-400 capitalize">Limit: {key.rateLimit} req/min • Usage: {key.usage}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleToggle(key._id)}
                                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${key.isActive ? "text-red-500 hover:bg-red-50" : "text-green-500 hover:bg-green-50"}`}
                                        >
                                            {key.isActive ? "Deactivate" : "Activate"}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(key._id)}
                                            className="px-4 py-2 rounded-lg text-xs font-bold text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-20 text-center text-gray-400 italic text-sm">No API keys generated yet</div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
