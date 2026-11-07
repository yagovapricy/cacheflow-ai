import React, { useState } from 'react';
import { 
  Zap, 
  Clock, 
  TrendingUp, 
  DollarSign, 
  ArrowUpRight, 
  Globe2, 
  Server, 
  ShieldCheck, 
  Radio, 
  RefreshCw,
  Activity,
  Layers
} from 'lucide-react';
import { INITIAL_POPS, LATENCY_HISTORY_24H } from '../../data/mockData';
import { RequestLog } from '../../types/cacheflow';

interface OverviewScreenProps {
  requests: RequestLog[];
  onNavigateToStream: () => void;
  onNavigateToPlayground: () => void;
}

export const OverviewScreen: React.FC<OverviewScreenProps> = ({
  requests,
  onNavigateToStream,
  onNavigateToPlayground,
}) => {
  const [timeRange, setTimeRange] = useState<'15m' | '1h' | '24h' | '7d'>('24h');
  const [selectedPop, setSelectedPop] = useState<string | null>(null);

  // Compute live stats from requests
  const totalCachedHits = requests.filter(r => r.cacheOutcome === 'HIT').length;
  const currentHitRate = requests.length > 0 ? ((totalCachedHits / requests.length) * 100).toFixed(1) : '88.4';
  const totalCostSaved = requests.reduce((acc, curr) => acc + curr.costSaved, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner / Cluster Status Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-slate-900">Edge Acceleration Network Active</h2>
              <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                48 POPs HEALTHY
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Origin compute traffic is currently offloaded by 91.2% with automated stale-while-revalidate execution.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 p-1 rounded-lg">
            {(['15m', '1h', '24h', '7d'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-3 py-1 text-xs font-mono font-medium rounded-md transition-all ${
                  timeRange === r
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4 Core KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Cache Hit Rate */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Global Hit Rate</span>
            <span className="w-7 h-7 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-heading font-bold text-slate-900 tracking-tight tabular-nums">
              88.4%
            </span>
            <span className="text-xs text-slate-400 font-mono">/ 14.8M req</span>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium">
              +84.2% hit rate
            </span>
            <span className="text-[11px] text-slate-400">vs Origin Direct</span>
          </div>
        </div>

        {/* Card 2: Average Latency Saved */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Avg Latency Reduction</span>
            <span className="w-7 h-7 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-heading font-bold text-slate-900 tracking-tight tabular-nums">
              -182ms
            </span>
            <span className="text-xs text-indigo-600 font-mono font-medium">11.8ms edge</span>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium">
              -182ms avg
            </span>
            <span className="text-[11px] text-slate-400 font-mono">198ms origin</span>
          </div>
        </div>

        {/* Card 3: Origin Compute Offload */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Origin Offload Ratio</span>
            <span className="w-7 h-7 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center">
              <Server className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-heading font-bold text-slate-900 tracking-tight tabular-nums">
              91.2%
            </span>
            <span className="text-xs text-slate-400 font-mono">compute shielded</span>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium">
              +13.4M bypassed
            </span>
            <span className="text-[11px] text-slate-400">zero cold starts</span>
          </div>
        </div>

        {/* Card 4: Estimated Cloud Cost Saved */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Monthly FinOps Savings</span>
            <span className="w-7 h-7 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-heading font-bold text-slate-900 tracking-tight tabular-nums">
              $18,420
            </span>
            <span className="text-xs text-emerald-600 font-mono font-medium">this cycle</span>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium">
              +$4,180 net
            </span>
            <span className="text-[11px] text-slate-400">Egress & compute</span>
          </div>
        </div>
      </div>

      {/* Latency Comparison Graph & Outcome Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart: Edge vs Origin Response Times */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Latency Telemetry: Edge Cache vs Origin</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Comparison between Edge-served response times and unaccelerated origin roundtrips.
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-slate-700 font-medium">Edge Cache (~12ms)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                  <span className="text-slate-500">Uncached Origin (~205ms)</span>
                </div>
              </div>
            </div>

            {/* Simulated Clean SVG Telemetry Chart */}
            <div className="h-56 w-full relative mt-4 pt-2">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 600 180" preserveAspectRatio="none">
                {/* Horizontal reference grid lines */}
                <line x1="0" y1="20" x2="600" y2="20" stroke="#F1F5F9" strokeWidth="1" />
                <line x1="0" y1="60" x2="600" y2="60" stroke="#F1F5F9" strokeWidth="1" />
                <line x1="0" y1="100" x2="600" y2="100" stroke="#F1F5F9" strokeWidth="1" />
                <line x1="0" y1="140" x2="600" y2="140" stroke="#F1F5F9" strokeWidth="1" />

                {/* Origin latency area & line (High, 180-240ms mapped to ~20-50y) */}
                <path
                  d="M 0 50 Q 50 35, 100 45 T 200 40 T 300 25 T 400 30 T 500 42 T 600 48 L 600 180 L 0 180 Z"
                  fill="rgba(244, 63, 94, 0.05)"
                />
                <path
                  d="M 0 50 Q 50 35, 100 45 T 200 40 T 300 25 T 400 30 T 500 42 T 600 48"
                  fill="none"
                  stroke="#F43F5E"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />

                {/* Edge latency area & line (Low, ~12ms mapped to ~160y) */}
                <path
                  d="M 0 162 Q 50 160, 100 164 T 200 161 T 300 159 T 400 163 T 500 160 T 600 162 L 600 180 L 0 180 Z"
                  fill="rgba(16, 185, 129, 0.12)"
                />
                <path
                  d="M 0 162 Q 50 160, 100 164 T 200 161 T 300 159 T 400 163 T 500 160 T 600 162"
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="2.5"
                />

                {/* Key data point circles */}
                <circle cx="300" cy="25" r="4" fill="#F43F5E" />
                <circle cx="300" cy="159" r="4.5" fill="#10B981" />
              </svg>

              {/* Time X-Axis */}
              <div className="flex justify-between items-center text-[11px] font-mono text-slate-400 mt-2 pt-1 border-t border-slate-100">
                <span>00:00</span>
                <span>04:00</span>
                <span>08:00</span>
                <span>12:00 (Peak RPS)</span>
                <span>16:00</span>
                <span>20:00</span>
                <span>Now</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5 font-mono">
              <span className="text-slate-900 font-semibold tabular-nums">99.8%</span> p95 Edge Latency under 18ms
            </span>
            <button
              onClick={onNavigateToPlayground}
              className="text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1 text-xs"
            >
              <span>Benchmark query in playground</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Cache Outcome Breakdown */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-slate-900">Traffic Distribution</h3>
              <span className="text-[11px] font-mono text-slate-500 font-medium">14.82M Total</span>
            </div>
            <p className="text-xs text-slate-500 mb-5">
              Breakdown of edge decisions over the selected period.
            </p>

            <div className="space-y-4">
              {/* HIT */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Cache Hit (Instant Edge)
                  </span>
                  <span className="font-mono text-slate-700 font-medium tabular-nums">88.4% (13.10M)</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '88.4%' }} />
                </div>
              </div>

              {/* STALE REVALIDATING */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    Stale-While-Revalidate
                  </span>
                  <span className="font-mono text-slate-700 font-medium tabular-nums">4.8% (711k)</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: '4.8%' }} />
                </div>
              </div>

              {/* MISS */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    Cache Miss (Origin Fetch)
                  </span>
                  <span className="font-mono text-slate-700 font-medium tabular-nums">4.6% (682k)</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-rose-500 h-full rounded-full" style={{ width: '4.6%' }} />
                </div>
              </div>

              {/* BYPASS */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-slate-400" />
                    Auth / No-Cache Bypass
                  </span>
                  <span className="font-mono text-slate-700 font-medium tabular-nums">2.2% (326k)</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-slate-400 h-full rounded-full" style={{ width: '2.2%' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <button
              onClick={onNavigateToStream}
              className="w-full py-2 px-3 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Inspect Real-Time Logs</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
            </button>
          </div>
        </div>
      </div>

      {/* Global Anycast POP Performance Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe2 className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-semibold text-slate-900">Edge POP Cluster Latency Matrix</h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">Anycast BGP Active</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-mono text-[11px] uppercase tracking-wider">
                <th className="py-2.5 px-4 font-semibold">POP Location</th>
                <th className="py-2.5 px-4 font-semibold">Anycast Node</th>
                <th className="py-2.5 px-4 font-semibold text-right">Edge Latency</th>
                <th className="py-2.5 px-4 font-semibold text-right">Hit Rate</th>
                <th className="py-2.5 px-4 font-semibold text-right">Live RPS</th>
                <th className="py-2.5 px-4 font-semibold text-right">Cluster Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {INITIAL_POPS.map((pop) => (
                <tr key={pop.code} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-sans font-medium text-slate-900">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                      <span>{pop.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-500 font-semibold">{pop.code}-01</td>
                  <td className="py-3 px-4 text-right text-indigo-700 font-bold tabular-nums">
                    {pop.latencyMs} ms
                  </td>
                  <td className="py-3 px-4 text-right tabular-nums">
                    <span className="inline-block px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold">
                      {pop.hitRate}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right text-slate-700 tabular-nums">
                    {pop.rps.toLocaleString()} req/s
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-[11px] font-sans font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Optimal
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
