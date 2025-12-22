import AdminLayout from "@/components/AdminLayout";
import { getDashboardAnalytics } from "@/server/actions/adminActions";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
    const analytics = await getDashboardAnalytics();

    return (
        <AdminLayout>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard title="Total Movies" value={analytics.totalMovies} color="blue" />
                <StatCard title="Unique Genres" value={analytics.genreStats.length} color="green" />
                <StatCard title="Total Languages" value={analytics.languageStats.length} color="purple" />
                <StatCard title="Top Rated Content" value={analytics.topRated[0]?.title || "N/A"} color="yellow" isText />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Genre Distribution */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold mb-4 text-gray-800">Movies by Genre</h3>
                    <div className="space-y-4">
                        {analytics.genreStats.slice(0, 5).map((g) => (
                            <div key={g._id} className="flex items-center">
                                <span className="w-24 text-sm font-medium text-gray-600 truncate">{g._id}</span>
                                <div className="flex-1 ml-4 bg-gray-100 rounded-full h-2 overflow-hidden">
                                    <div
                                        className="bg-blue-500 h-full rounded-full"
                                        style={{ width: `${(g.count / analytics.totalMovies) * 100}%` }}
                                    />
                                </div>
                                <span className="ml-4 text-sm font-bold text-gray-800">{g.count}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recently Added */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold mb-4 text-gray-800">Recently Added</h3>
                    <div className="space-y-4">
                        {analytics.recentMovies.map((m) => (
                            <div key={m.movie_id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
                                <div className="flex items-center">
                                    <div className="w-10 h-14 bg-gray-200 rounded overflow-hidden mr-4">
                                        <img src={m.poster_url} alt={m.title} className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">{m.title}</p>
                                        <p className="text-xs text-gray-500">{m.release_date}</p>
                                    </div>
                                </div>
                                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">Active</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

function StatCard({ title, value, color, isText = false }) {
    const colors = {
        blue: "bg-blue-50 text-blue-600",
        green: "bg-green-50 text-green-600",
        purple: "bg-purple-50 text-purple-600",
        yellow: "bg-yellow-50 text-yellow-600",
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center">
            <div className={`p-4 rounded-xl ${colors[color]} mr-4`}>
                <div className="w-6 h-6 flex items-center justify-center font-bold">
                    {title[0]}
                </div>
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <p className={`font-bold text-gray-900 ${isText ? "text-base" : "text-2xl"}`}>{value}</p>
            </div>
        </div>
    );
}
