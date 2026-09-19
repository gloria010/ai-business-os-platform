import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Minus, ShoppingBag, DollarSign } from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";

const API_BASE = "http://localhost:5000";

interface MonthlyPoint {
  month: string;
  sales: number;
}

interface ForecastData {
  monthlySeries: MonthlyPoint[];
  trendDirection: "up" | "down" | "flat";
  forecastNextMonth: number;
  forecastMonthAfter: number;
}

interface SummaryData {
  ownTotal: number;
  averageMonthlySales: number;
  monthsAnalyzed: number;
}

interface BenchmarkData {
  scope: "category" | "platform";
  category: string | null;
  categoryPeerCount: number;
  industryAverage: number;
  industryMedian: number;
  percentile: number | null;
  comparedAgainstCount: number;
  lowSample: boolean;
}

export default function Analytics() {
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [benchmark, setBenchmark] = useState<BenchmarkData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/ceoai/analytics/forecast`, {
          credentials: "include",
          cache: "no-store",
        });
        const data = await res.json();

        if (data?.success) {
          setForecast(data.forecast);
          setSummary(data.summary);
          setBenchmark(data.benchmark);
        }
      } catch {
        setForecast(null);
        setSummary(null);
        setBenchmark(null);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  const trendIcon =
    forecast?.trendDirection === "up" ? (
      <TrendingUp className="w-5 h-5 text-emerald-600" />
    ) : forecast?.trendDirection === "down" ? (
      <TrendingDown className="w-5 h-5 text-red-600" />
    ) : (
      <Minus className="w-5 h-5 text-slate-400" />
    );

  const stats = [
    {
      label: "This Month (Forecast)",
      value: forecast ? `₹${forecast.forecastNextMonth.toLocaleString()}` : "—",
      icon: <DollarSign className="w-5 h-5 text-emerald-600" />,
      accent: "bg-emerald-50",
    },
    {
      label: "Next Month (Forecast)",
      value: forecast ? `₹${forecast.forecastMonthAfter.toLocaleString()}` : "—",
      icon: <ShoppingBag className="w-5 h-5 text-blue-600" />,
      accent: "bg-blue-50",
    },
    {
      label: "Your Total Sales",
      value: summary ? `₹${summary.ownTotal.toLocaleString()}` : "—",
      icon: <DollarSign className="w-5 h-5 text-purple-600" />,
      accent: "bg-purple-50",
    },
    {
      label: "Your Monthly Average",
      value: summary ? `₹${summary.averageMonthlySales.toLocaleString()}` : "—",
      icon: trendIcon,
      accent: "bg-orange-50",
    },
  ];

  return (
    <DashboardLayout role="business" title="Analytics">
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${stat.accent}`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-xs text-slate-500">{stat.label}</p>
                <p className="text-xl font-bold text-slate-800">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Monthly Sales Trend</h2>

          {loading && <p className="text-slate-500">Loading analytics...</p>}
          {!loading && !forecast && <p className="text-slate-500">No analytics data available yet.</p>}

          {!loading && forecast && (
            <div className="space-y-3">
              {forecast.monthlySeries.map((point) => (
                <div key={point.month} className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-sm text-slate-600">{point.month}</span>
                  <span className="text-sm font-semibold text-slate-800">
                    ₹{point.sales.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {summary && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Your Sales Summary</h2>
            <p className="text-sm text-slate-600">
              Average monthly sales over the last {summary.monthsAnalyzed} months:{" "}
              <span className="font-semibold text-slate-800">₹{summary.averageMonthlySales.toLocaleString()}</span>
            </p>
          </div>
        )}

        {benchmark && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Industry Comparison</h2>

            {benchmark.lowSample && (
              <div className="mb-4 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3">
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 flex-shrink-0">
                  !
                </span>
                <p className="text-sm text-amber-800">
                  Limited comparison data — only {benchmark.comparedAgainstCount} other business
                  {benchmark.comparedAgainstCount === 1 ? "" : "es"} available. Percentile and averages may not be representative yet.
                </p>
              </div>
            )}

            <p className="text-sm text-slate-600">
              Industry median:{" "}
              <span className="font-semibold text-slate-800">₹{benchmark.industryMedian.toLocaleString()}</span>
            </p>
            <p className="text-sm text-slate-600 mt-1">
              Your percentile:{" "}
              <span className="font-semibold text-slate-800">
                {benchmark.percentile !== null ? `${benchmark.percentile}th` : "—"}
              </span>
            </p>
            <p className="text-sm text-slate-600 mt-1">
              Compared against <span className="font-semibold text-slate-800">{benchmark.comparedAgainstCount}</span>{" "}
              {benchmark.scope === "category" && benchmark.category
                ? `other ${benchmark.category} businesses`
                : "businesses platform-wide"}
              .
            </p>

            {benchmark.scope === "platform" && benchmark.category && (
              <p className="text-xs text-slate-400 mt-2">
                {benchmark.categoryPeerCount === 0
                  ? `No other ${benchmark.category} businesses are registered yet — comparison uses all categories until more join.`
                  : `Only ${benchmark.categoryPeerCount} other ${benchmark.category} business${benchmark.categoryPeerCount === 1 ? "" : "es"} registered — comparison uses all categories until there are at least 3.`}
              </p>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}