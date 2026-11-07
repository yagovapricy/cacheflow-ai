import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Search, 
  Filter, 
  X, 
  Copy, 
  Check, 
  Trash2, 
  ArrowRight,
  ExternalLink,
  Clock,
  Layers,
  ShieldAlert,
  SlidersHorizontal
} from 'lucide-react';
import { RequestLog, HTTPMethod, CacheOutcome } from '../../types/cacheflow';

interface RequestStreamScreenProps {
  requests: RequestLog[];
  isStreaming: boolean;
  setIsStreaming: (val: boolean) => void;
  onClearLogs: () => void;
  onSimulateRequest: () => void;
  onPurgeKey: (key: string) => void;
  onShowToast: (title: string, description?: string, type?: 'success' | 'info' | 'error') => void;
}

export const RequestStreamScreen: React.FC<RequestStreamScreenProps> = ({
  requests,
  isStreaming,
  setIsStreaming,
  onClearLogs,
  onSimulateRequest,
  onPurgeKey,
  onShowToast,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<string>('ALL');
  const [selectedOutcome, setSelectedOutcome] = useState<string>('ALL');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [inspectingRequest, setInspectingRequest] = useState<RequestLog | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  // Filter requests
  const filteredRequests = requests.filter((req) => {
    if (selectedMethod !== 'ALL' && req.method !== selectedMethod) return false;
    if (selectedOutcome !== 'ALL' && req.cacheOutcome !== selectedOutcome) return false;
    if (searchFilter.trim() !== '') {
      const q = searchFilter.toLowerCase();
      return (
        req.path.toLowerCase().includes(q) ||
        req.clientIp.toLowerCase().includes(q) ||
        req.pop.toLowerCase().includes(q) ||
        req.id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getMethodBadgeClass = (method: HTTPMethod) => {
    switch (method) {
      case 'GET':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'POST':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'DELETE':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'PUT':
      case 'PATCH':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getOutcomeBadgeClass = (outcome: CacheOutcome) => {
    switch (outcome) {
      case 'HIT':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'MISS':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'STALE':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'BYPASS':
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const handleCopyJson = (payload: any) => {
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setCopiedKey(true);
    onShowToast('Payload copied to clipboard', 'Response JSON copied', 'success');
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Utility Bar with Filter controls & live state */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Method Filter Tabs */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg">
            {['ALL', 'GET', 'POST', 'DELETE'].map((m) => (
              <button
                key={m}
                onClick={() => setSelectedMethod(m)}
                className={`px-2.5 py-1 text-xs font-mono font-medium rounded-md transition-all ${
                  selectedMethod === m
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          {/* Outcome Filter Tabs */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg">
            {['ALL', 'HIT', 'MISS', 'STALE', 'BYPASS'].map((o) => (
              <button
                key={o}
                onClick={() => setSelectedOutcome(o)}
                className={`px-2.5 py-1 text-xs font-mono font-medium rounded-md transition-all ${
                  selectedOutcome === o
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {o}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search path, IP, POP..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:border-indigo-500 font-mono w-44 md:w-56"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsStreaming(!isStreaming)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md border flex items-center gap-1.5 transition-colors ${
              isStreaming
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-slate-50 text-slate-700 border-slate-200'
            }`}
          >
            {isStreaming ? (
              <>
                <Pause className="w-3.5 h-3.5 text-emerald-600" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-slate-600" />
                <span>Resume Stream</span>
              </>
            )}
          </button>

          <button
            onClick={onSimulateRequest}
            className="px-3 py-1.5 text-xs font-medium bg-white hover:bg-slate-50 border border-slate-200 rounded-md text-slate-700 flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Generate Inbound</span>
          </button>

          <button
            onClick={onClearLogs}
            className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-md transition-colors"
            title="Clear all log buffer"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Main Request Stream Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-[#F8FAFC] border-b border-slate-200 text-slate-500 font-mono text-[11px] uppercase tracking-wider select-none">
              <tr>
                <th className="py-2.5 px-4 font-semibold">Timestamp</th>
                <th className="py-2.5 px-4 font-semibold">Method</th>
                <th className="py-2.5 px-4 font-semibold">Status</th>
                <th className="py-2.5 px-4 font-semibold">Request Path</th>
                <th className="py-2.5 px-4 font-semibold">Cache Outcome</th>
                <th className="py-2.5 px-4 font-semibold">POP</th>
                <th className="py-2.5 px-4 font-semibold text-right">Edge Latency</th>
                <th className="py-2.5 px-4 font-semibold text-right">Origin Delta</th>
                <th className="py-2.5 px-4 font-semibold text-right">Saved</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 font-sans">
                    <p className="text-sm font-medium">No requests match current filter</p>
                    <button
                      onClick={() => {
                        setSelectedMethod('ALL');
                        setSelectedOutcome('ALL');
                        setSearchFilter('');
                      }}
                      className="mt-2 text-xs text-indigo-600 hover:underline font-semibold"
                    >
                      Reset filters
                    </button>
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => (
                  <tr
                    key={req.id}
                    onClick={() => setInspectingRequest(req)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors group"
                  >
                    <td className="py-3 px-4 text-slate-500 tabular-nums whitespace-nowrap">
                      {req.timestamp}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold border ${getMethodBadgeClass(
                          req.method
                        )}`}
                      >
                        {req.method}
                      </span>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`font-semibold tabular-nums ${
                          req.statusCode >= 200 && req.statusCode < 300
                            ? 'text-emerald-700'
                            : req.statusCode === 304
                            ? 'text-blue-700'
                            : 'text-rose-600'
                        }`}
                      >
                        {req.statusCode}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-800 font-medium max-w-xs truncate group-hover:text-indigo-600">
                      {req.path}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${getOutcomeBadgeClass(
                          req.cacheOutcome
                        )}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            req.cacheOutcome === 'HIT'
                              ? 'bg-emerald-600'
                              : req.cacheOutcome === 'MISS'
                              ? 'bg-rose-600'
                              : req.cacheOutcome === 'STALE'
                              ? 'bg-amber-600'
                              : 'bg-slate-500'
                          }`}
                        />
                        {req.cacheOutcome}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                      {req.pop}-01
                    </td>

                    <td className="py-3 px-4 text-right font-bold tabular-nums text-slate-900 whitespace-nowrap">
                      <span
                        className={
                          req.latencyMs < 20
                            ? 'text-emerald-700'
                            : req.latencyMs < 50
                            ? 'text-slate-800'
                            : 'text-rose-600'
                        }
                      >
                        {req.latencyMs} ms
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right tabular-nums text-slate-400 whitespace-nowrap">
                      {req.cacheOutcome === 'HIT' ? (
                        <span className="text-emerald-600 font-medium">
                          -{req.originLatencyMs - req.latencyMs}ms
                        </span>
                      ) : (
                        <span className="text-slate-400">0ms</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right tabular-nums text-slate-700 whitespace-nowrap">
                      {req.costSaved > 0 ? (
                        <span className="text-emerald-700 font-semibold">
                          +${req.costSaved.toFixed(5)}
                        </span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-Over Request Details Inspector Drawer */}
      {inspectingRequest && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setInspectingRequest(null)}
          />

          <div className="relative w-full max-w-xl bg-white shadow-2xl h-full flex flex-col z-10 border-l border-slate-200">
            {/* Drawer Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-bold border ${getMethodBadgeClass(
                      inspectingRequest.method
                    )}`}
                  >
                    {inspectingRequest.method}
                  </span>
                  <span className="font-mono text-xs text-slate-500">
                    {inspectingRequest.id}
                  </span>
                </div>
                <h3 className="font-mono font-semibold text-sm text-slate-900 mt-1 truncate">
                  {inspectingRequest.path}
                </h3>
              </div>
              <button
                onClick={() => setInspectingRequest(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {/* Telemetry Snapshot Cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
                  <div className="text-[10px] font-mono text-slate-400 uppercase font-semibold">Decision</div>
                  <div className="mt-1 flex items-center gap-1.5 font-bold text-xs">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        inspectingRequest.cacheOutcome === 'HIT'
                          ? 'bg-emerald-500'
                          : 'bg-rose-500'
                      }`}
                    />
                    <span className="text-slate-900">{inspectingRequest.cacheOutcome}</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
                  <div className="text-[10px] font-mono text-slate-400 uppercase font-semibold">Edge Latency</div>
                  <div className="mt-1 font-mono font-bold text-xs text-indigo-700 tabular-nums">
                    {inspectingRequest.latencyMs} ms
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
                  <div className="text-[10px] font-mono text-slate-400 uppercase font-semibold">Edge POP</div>
                  <div className="mt-1 font-mono font-bold text-xs text-slate-800">
                    {inspectingRequest.pop}-01
                  </div>
                </div>
              </div>

              {/* Latency Waterfall Breakdown */}
              <div className="border border-slate-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Latency Waterfall Trace</span>
                  </h4>
                  <span className="text-[11px] font-mono text-slate-500">
                    Total: {inspectingRequest.latencyMs}ms
                  </span>
                </div>

                <div className="space-y-2 pt-1 text-[11px] font-mono">
                  <div>
                    <div className="flex justify-between text-slate-600 mb-1">
                      <span>TLS Handshake + Anycast Route</span>
                      <span>3.2 ms</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-blue-400 h-full rounded-full" style={{ width: '25%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-600 mb-1">
                      <span>CacheFlow Edge Memory Lookup</span>
                      <span>
                        {inspectingRequest.cacheOutcome === 'HIT' ? '1.8 ms (HIT)' : '2.1 ms (MISS)'}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          inspectingRequest.cacheOutcome === 'HIT' ? 'bg-emerald-500' : 'bg-rose-400'
                        }`}
                        style={{ width: '20%' }}
                      />
                    </div>
                  </div>

                  {inspectingRequest.cacheOutcome === 'MISS' && (
                    <div>
                      <div className="flex justify-between text-rose-700 font-semibold mb-1">
                        <span>Origin Cold-Start Roundtrip</span>
                        <span>{inspectingRequest.originLatencyMs - 6} ms</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-rose-500 h-full rounded-full" style={{ width: '85%' }} />
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="flex justify-between text-slate-600 mb-1">
                      <span>HTTP Transfer + TTFB</span>
                      <span>2.4 ms</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-indigo-400 h-full rounded-full" style={{ width: '20%' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Edge Headers Table */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 text-xs font-semibold text-slate-800">
                  HTTP Response Headers
                </div>
                <div className="p-3 font-mono text-[11px] space-y-1.5 divide-y divide-slate-100">
                  {Object.entries(inspectingRequest.headers).map(([key, value]) => (
                    <div key={key} className="pt-1.5 first:pt-0 flex items-start gap-2">
                      <span className="text-indigo-600 font-medium shrink-0">{key}:</span>
                      <span className="text-slate-700 break-all">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Response Payload Preview */}
              <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-900 text-slate-100">
                <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs">
                  <span className="font-mono text-slate-400 text-[11px]">Response JSON Preview</span>
                  <button
                    onClick={() => handleCopyJson(inspectingRequest.responsePayload)}
                    className="flex items-center gap-1 text-[11px] text-slate-300 hover:text-white transition-colors"
                  >
                    {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-4 text-xs font-mono overflow-x-auto text-emerald-400 leading-relaxed">
                  {JSON.stringify(inspectingRequest.responsePayload, null, 2)}
                </pre>
              </div>
            </div>

            {/* Drawer Actions */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
              <button
                onClick={() => {
                  onPurgeKey(inspectingRequest.path);
                  setInspectingRequest(null);
                }}
                className="px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Purge this Key from Cache</span>
              </button>

              <button
                onClick={() => setInspectingRequest(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
