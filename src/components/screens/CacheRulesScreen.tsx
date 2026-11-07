import React, { useState } from 'react';
import { 
  Layers, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  SlidersHorizontal, 
  Search, 
  ShieldAlert, 
  RefreshCw,
  X,
  AlertTriangle
} from 'lucide-react';
import { CacheRule } from '../../types/cacheflow';

interface CacheRulesScreenProps {
  rules: CacheRule[];
  onToggleRule: (ruleId: string) => void;
  onCreateRule: (newRule: Omit<CacheRule, 'id' | 'hitCount' | 'createdAt'>) => void;
  onOpenPurgeModal: () => void;
  onShowToast: (title: string, description?: string, type?: 'success' | 'info' | 'error') => void;
}

export const CacheRulesScreen: React.FC<CacheRulesScreenProps> = ({
  rules,
  onToggleRule,
  onCreateRule,
  onOpenPurgeModal,
  onShowToast,
}) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  // Form states for new rule
  const [newRuleName, setNewRuleName] = useState('');
  const [newRulePattern, setNewRulePattern] = useState('');
  const [newRuleEdgeTtl, setNewRuleEdgeTtl] = useState('86400');
  const [newRuleSwr, setNewRuleSwr] = useState('604800');
  const [newRuleBrowserTtl, setNewRuleBrowserTtl] = useState('3600');
  const [newRuleQueryMode, setNewRuleQueryMode] = useState<'whitelist' | 'strip_all' | 'include_all'>('whitelist');
  const [newRuleWhitelistedParams, setNewRuleWhitelistedParams] = useState('sku, currency, lang');
  const [newRuleCacheOnAuth, setNewRuleCacheOnAuth] = useState(false);

  const filteredRules = rules.filter((r) => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return r.name.toLowerCase().includes(q) || r.pattern.toLowerCase().includes(q);
  });

  const handleSaveRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleName || !newRulePattern) {
      onShowToast('Validation error', 'Name and URL pattern are required', 'error');
      return;
    }

    onCreateRule({
      name: newRuleName,
      pattern: newRulePattern,
      edgeTtlSec: parseInt(newRuleEdgeTtl, 10) || 3600,
      staleWhileRevalidateSec: parseInt(newRuleSwr, 10) || 86400,
      browserMaxAgeSec: parseInt(newRuleBrowserTtl, 10) || 300,
      queryParamMode: newRuleQueryMode,
      whitelistedParams: newRuleWhitelistedParams.split(',').map((p) => p.trim()),
      cacheOnAuth: newRuleCacheOnAuth,
      enabled: true,
    });

    setIsCreateModalOpen(false);
    setNewRuleName('');
    setNewRulePattern('');
    onShowToast('Cache Rule Created', `Active rule for ${newRulePattern}`, 'success');
  };

  const formatSeconds = (sec: number) => {
    if (sec >= 86400) return `${Math.round(sec / 86400)}d (${sec}s)`;
    if (sec >= 3600) return `${Math.round(sec / 3600)}h (${sec}s)`;
    if (sec >= 60) return `${Math.round(sec / 60)}m (${sec}s)`;
    return `${sec}s`;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Quick Purge trigger & Rule search */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            <span>Edge Routing & Caching Rules Engine</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure URL pattern routing, TTL expiration policies, and stale-while-revalidate execution across global Anycast POPs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenPurgeModal}
            className="px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Fast Invalidation / Purge</span>
          </button>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs shadow-indigo-200"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Cache Rule</span>
          </button>
        </div>
      </div>

      {/* Rules Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between gap-4 bg-slate-50/60">
          <div className="text-xs font-semibold text-slate-800">
            Active Edge Cache Rules ({rules.length})
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter rules by pattern..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-md focus:outline-none focus:border-indigo-500 font-mono w-60"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] border-b border-slate-200 text-slate-500 font-mono text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-4 font-semibold">Rule Name</th>
                <th className="py-2.5 px-4 font-semibold">URL Route Pattern</th>
                <th className="py-2.5 px-4 font-semibold">Edge TTL</th>
                <th className="py-2.5 px-4 font-semibold">SWR Window</th>
                <th className="py-2.5 px-4 font-semibold">Query Params</th>
                <th className="py-2.5 px-4 font-semibold text-right">Served Hits</th>
                <th className="py-2.5 px-4 font-semibold text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {filteredRules.map((rule) => (
                <tr key={rule.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-sans font-semibold text-slate-900">
                    <div>{rule.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      Created {rule.createdAt}
                    </div>
                  </td>

                  <td className="py-3 px-4 font-mono font-medium text-indigo-700">
                    <span className="px-2 py-0.5 rounded bg-indigo-50/70 border border-indigo-100">
                      {rule.pattern}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-slate-700 font-medium tabular-nums">
                    {formatSeconds(rule.edgeTtlSec)}
                  </td>

                  <td className="py-3 px-4 text-slate-600 font-medium tabular-nums">
                    {formatSeconds(rule.staleWhileRevalidateSec)}
                  </td>

                  <td className="py-3 px-4 font-sans text-slate-600">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {rule.queryParamMode}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right text-emerald-700 font-bold tabular-nums">
                    {rule.hitCount.toLocaleString()}
                  </td>

                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => onToggleRule(rule.id)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        rule.enabled ? 'bg-indigo-600' : 'bg-slate-200'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          rule.enabled ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create New Cache Rule Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsCreateModalOpen(false)}
          />

          <div className="relative bg-white border border-slate-200 rounded-xl shadow-2xl max-w-lg w-full z-10 overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                <h3 className="font-semibold text-slate-900 text-sm">Add New Edge Cache Rule</h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveRule} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Rule Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Product Catalog Cache"
                  value={newRuleName}
                  onChange={(e) => setNewRuleName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:bg-white text-xs"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">URL Route Pattern</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. /api/v1/catalog/**"
                  value={newRulePattern}
                  onChange={(e) => setNewRulePattern(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:bg-white font-mono text-xs"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Supports wildcard glob matching like `**` or query parameters.
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Edge TTL (Seconds)</label>
                  <input
                    type="number"
                    value={newRuleEdgeTtl}
                    onChange={(e) => setNewRuleEdgeTtl(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 font-mono text-xs"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Default 86400 (24h)</span>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Stale While Revalidate (Sec)</label>
                  <input
                    type="number"
                    value={newRuleSwr}
                    onChange={(e) => setNewRuleSwr(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 font-mono text-xs"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Serve stale while fetching</span>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Query Parameter Mode</label>
                <select
                  value={newRuleQueryMode}
                  onChange={(e: any) => setNewRuleQueryMode(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-xs"
                >
                  <option value="whitelist">Whitelist Specific Params</option>
                  <option value="strip_all">Strip All Query Params (Maximize Cache Hits)</option>
                  <option value="include_all">Include All Params in Cache Key</option>
                </select>
              </div>

              {newRuleQueryMode === 'whitelist' && (
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Whitelisted Query Params</label>
                  <input
                    type="text"
                    value={newRuleWhitelistedParams}
                    onChange={(e) => setNewRuleWhitelistedParams(e.target.value)}
                    placeholder="sku, currency, lang"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 font-mono text-xs"
                  />
                </div>
              )}

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={newRuleCacheOnAuth}
                    onChange={(e) => setNewRuleCacheOnAuth(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                  />
                  <span className="text-slate-700 font-medium">Cache responses even if Authorization header is present</span>
                </label>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
                >
                  Save & Deploy Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
