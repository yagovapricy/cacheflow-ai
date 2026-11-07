import React, { useState } from 'react';
import { 
  TrendingDown, 
  DollarSign, 
  Download, 
  Sliders, 
  Zap, 
  Server, 
  ArrowUpRight, 
  ShieldCheck,
  CheckCircle2,
  PieChart
} from 'lucide-react';

interface FinOpsScreenProps {
  onShowToast: (title: string, description?: string, type?: 'success' | 'info' | 'error') => void;
}

export const FinOpsScreen: React.FC<FinOpsScreenProps> = ({ onShowToast }) => {
  const [dailyRequestsMillions, setDailyRequestsMillions] = useState(15);
  const [cacheHitPercent, setCacheHitPercent] = useState(88);
  const [originComputeCostPer100k, setOriginComputeCostPer100k] = useState(0.12);
  const [egressCostPerGb, setEgressCostPerGb] = useState(0.08);

  // Computations
  const monthlyRequests = dailyRequestsMillions * 30 * 1_000_000;
  const cachedMonthlyRequests = monthlyRequests * (cacheHitPercent / 100);
  const unacceleratedOriginComputeCost = (monthlyRequests / 100_000) * originComputeCostPer100k;
  const acceleratedOriginComputeCost = ((monthlyRequests - cachedMonthlyRequests) / 100_000) * originComputeCostPer100k;

  // Egress estimate: avg 14KB per response
  const totalEgressGb = (monthlyRequests * 14) / 1_000_000;
  const directEgressCost = totalEgressGb * egressCostPerGb;
  const cacheflowEgressCost = directEgressCost * 0.15; // CacheFlow compressed edge egress

  const totalOriginCost = unacceleratedOriginComputeCost + directEgressCost;
  const totalCacheFlowCost = acceleratedOriginComputeCost + cacheflowEgressCost + 1200; // base cluster fee
  const netSavings = Math.max(0, totalOriginCost - totalCacheFlowCost);
  const savingsPercent = ((netSavings / totalOriginCost) * 100).toFixed(1);

  const handleExportSummary = () => {
    const summary = {
      timestamp: new Date().toISOString(),
      daily_requests_millions: dailyRequestsMillions,
      cache_hit_rate: `${cacheHitPercent}%`,
      projected_monthly_savings_usd: Math.round(netSavings),
      unaccelerated_cloud_cost_usd: Math.round(totalOriginCost),
      accelerated_cost_usd: Math.round(totalCacheFlowCost),
      origin_compute_offload: `${cacheHitPercent}%`,
      unit_cost_per_million_cached: '$0.18',
      unit_cost_per_million_origin: '$3.40'
    };

    const blob = new Blob([JSON.stringify(summary, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cacheflow-finops-report-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    onShowToast('FinOps Report Exported', 'Executive summary downloaded as JSON', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-emerald-600" />
            <span>FinOps Cloud Cost Optimization & Unit Economics</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Model upstream cloud infrastructure savings from origin compute shielding and egress compression.
          </p>
        </div>

        <button
          onClick={handleExportSummary}
          className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
        >
          <Download className="w-3.5 h-3.5 text-indigo-600" />
          <span>Export FinOps Summary</span>
        </button>
      </div>

      {/* Main ROI Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Projected Net Monthly Savings</div>
          <div className="mt-2 text-3xl font-heading font-bold text-emerald-700 tracking-tight tabular-nums">
            ${Math.round(netSavings).toLocaleString()}
          </div>
          <div className="mt-3 flex items-center gap-1 text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full w-fit">
            <span>+{savingsPercent}% total cost reduction</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Unmitigated Origin Cloud Spend</div>
          <div className="mt-2 text-3xl font-heading font-bold text-slate-700 tracking-tight tabular-nums">
            ${Math.round(totalOriginCost).toLocaleString()}
          </div>
          <div className="mt-3 text-[11px] text-slate-400 font-mono">
            Direct invocations without Edge Cache
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Origin Compute Shield Ratio</div>
          <div className="mt-2 text-3xl font-heading font-bold text-indigo-700 tracking-tight tabular-nums">
            {cacheHitPercent}%
          </div>
          <div className="mt-3 text-[11px] text-indigo-600 font-mono font-medium">
            {(cachedMonthlyRequests / 1_000_000).toFixed(0)}M requests absorbed by edge
          </div>
        </div>
      </div>

      {/* Interactive Modeling Sliders & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sliders Box */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-xs font-semibold text-slate-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-600" />
              <span>Throughput & Unit Pricing Model</span>
            </h3>
            <span className="text-[11px] font-mono text-slate-400">Interactive Simulator</span>
          </div>

          {/* Slider 1: Daily Requests */}
          <div>
            <div className="flex justify-between text-xs font-medium mb-1.5">
              <span className="text-slate-700">Daily Inbound API Requests</span>
              <span className="font-mono text-indigo-700 font-bold tabular-nums">
                {dailyRequestsMillions}M req / day
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="100"
              step="1"
              value={dailyRequestsMillions}
              onChange={(e) => setDailyRequestsMillions(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
              <span>1M</span>
              <span>50M</span>
              <span>100M</span>
            </div>
          </div>

          {/* Slider 2: Cache Hit Ratio */}
          <div>
            <div className="flex justify-between text-xs font-medium mb-1.5">
              <span className="text-slate-700">Target Cache Hit Ratio</span>
              <span className="font-mono text-emerald-700 font-bold tabular-nums">
                {cacheHitPercent}%
              </span>
            </div>
            <input
              type="range"
              min="50"
              max="99"
              step="1"
              value={cacheHitPercent}
              onChange={(e) => setCacheHitPercent(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
              <span>50%</span>
              <span>85% (Avg)</span>
              <span>99%</span>
            </div>
          </div>

          {/* Slider 3: Origin Compute Cost */}
          <div>
            <div className="flex justify-between text-xs font-medium mb-1.5">
              <span className="text-slate-700">Origin Compute Cost per 100k invocations</span>
              <span className="font-mono text-slate-800 font-bold tabular-nums">
                ${originComputeCostPer100k.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="0.04"
              max="0.40"
              step="0.02"
              value={originComputeCostPer100k}
              onChange={(e) => setOriginComputeCostPer100k(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
              <span>$0.04 (Serverless)</span>
              <span>$0.20</span>
              <span>$0.40 (Heavy DB)</span>
            </div>
          </div>

          {/* Slider 4: Egress Cost */}
          <div>
            <div className="flex justify-between text-xs font-medium mb-1.5">
              <span className="text-slate-700">Origin Egress Cost per GB</span>
              <span className="font-mono text-slate-800 font-bold tabular-nums">
                ${egressCostPerGb.toFixed(2)} / GB
              </span>
            </div>
            <input
              type="range"
              min="0.02"
              max="0.15"
              step="0.01"
              value={egressCostPerGb}
              onChange={(e) => setEgressCostPerGb(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
              <span>$0.02</span>
              <span>$0.08 (AWS Standard)</span>
              <span>$0.15</span>
            </div>
          </div>
        </div>

        {/* Cost Comparison Breakdown */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-semibold text-slate-900 flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
              <PieChart className="w-4 h-4 text-indigo-600" />
              <span>Direct Origin vs CacheFlow Edge Architecture</span>
            </h3>

            <div className="space-y-4">
              {/* Origin Compute Row */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-slate-700">Origin Backend Compute (AWS/GCP)</span>
                  <span className="font-mono text-emerald-700 font-bold">
                    -${Math.round(unacceleratedOriginComputeCost - acceleratedOriginComputeCost).toLocaleString()} saved
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  Origin Invocations reduced from {(monthlyRequests / 1_000_000).toFixed(0)}M to {((monthlyRequests - cachedMonthlyRequests) / 1_000_000).toFixed(0)}M
                </div>
              </div>

              {/* Bandwidth Egress Row */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-slate-700">Cloud Egress Bandwidth</span>
                  <span className="font-mono text-emerald-700 font-bold">
                    -${Math.round(directEgressCost - cacheflowEgressCost).toLocaleString()} saved
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  Absorbed {Math.round(totalEgressGb * 0.85).toLocaleString()} GB off public cloud egress bills
                </div>
              </div>

              {/* Unit Cost Comparison */}
              <div className="grid grid-cols-2 gap-3 pt-2 text-xs font-mono">
                <div className="p-3 bg-indigo-50/50 rounded-lg border border-indigo-100">
                  <div className="text-[10px] text-indigo-600 font-semibold uppercase">Edge Unit Cost</div>
                  <div className="text-lg font-bold text-indigo-900 mt-1">$0.18 / 10k</div>
                  <div className="text-[10px] text-indigo-600/80 mt-0.5">Accelerated Edge Cache</div>
                </div>

                <div className="p-3 bg-rose-50/50 rounded-lg border border-rose-100">
                  <div className="text-[10px] text-rose-600 font-semibold uppercase">Origin Unit Cost</div>
                  <div className="text-lg font-bold text-rose-900 mt-1">$2.84 / 10k</div>
                  <div className="text-[10px] text-rose-600/80 mt-0.5">Cold Origin Roundtrip</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-medium text-slate-700">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>FinOps Invariants & SLA: 99.99% Edge Availability</span>
            </span>
            <span className="font-mono text-slate-400">SOC2 Type II</span>
          </div>
        </div>
      </div>
    </div>
  );
};
