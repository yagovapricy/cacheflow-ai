import React, { useState } from 'react';
import { 
  Play, 
  Copy, 
  Check, 
  Terminal, 
  RotateCcw, 
  Zap, 
  Clock, 
  ShieldCheck, 
  Sliders, 
  Code2,
  Send,
  Layers
} from 'lucide-react';
import { HTTPMethod } from '../../types/cacheflow';

interface PlaygroundScreenProps {
  onShowToast: (title: string, description?: string, type?: 'success' | 'info' | 'error') => void;
  onRequestExecuted?: (method: HTTPMethod, path: string, outcome: 'HIT' | 'MISS', latency: number) => void;
}

export const PlaygroundScreen: React.FC<PlaygroundScreenProps> = ({
  onShowToast,
  onRequestExecuted,
}) => {
  const [activeLang, setActiveLang] = useState<'curl' | 'typescript' | 'python' | 'go'>('curl');
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('/api/v1/catalog/products/prod_88291');
  const [httpMethod, setHttpMethod] = useState<HTTPMethod>('GET');
  const [isSimulatingWarmCache, setIsSimulatingWarmCache] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastExecutionResult, setLastExecutionResult] = useState<{
    status: number;
    outcome: 'HIT' | 'MISS';
    latencyMs: number;
    originLatencyMs: number;
    headers: Record<string, string>;
    body: any;
    executedAt: string;
  } | null>({
    status: 200,
    outcome: 'HIT',
    latencyMs: 11,
    originLatencyMs: 194,
    headers: {
      'x-cacheflow-status': 'HIT',
      'cache-control': 'public, max-age=3600, s-maxage=86400',
      'cf-edge-pop': 'IAD-01 (Ashburn)',
      'x-cacheflow-latency': '11ms',
      'x-origin-offloaded': '183ms',
      'etag': 'W/"9942a-821f98"',
      'content-type': 'application/json; charset=utf-8'
    },
    body: {
      id: 'prod_88291',
      title: 'Ultra-Low Latency Edge Gateway Mod 4',
      sku: 'GW-MOD4-ENT',
      price: 1290.00,
      currency: 'USD',
      in_stock: true,
      inventory_count: 842,
      origin_cached_at: '2026-11-06T23:11:04Z'
    },
    executedAt: '23:14:28.192'
  });

  const [copiedSnippet, setCopiedSnippet] = useState(false);

  const presets = [
    {
      label: 'Product Catalog Item (REST)',
      method: 'GET' as HTTPMethod,
      path: '/api/v1/catalog/products/prod_88291',
      ttl: '86400s (24h)',
      warmOutcome: 'HIT' as const
    },
    {
      label: 'Inventory Query (GraphQL)',
      method: 'POST' as HTTPMethod,
      path: '/graphql?op=SearchInventory',
      ttl: '600s (10m)',
      warmOutcome: 'HIT' as const
    },
    {
      label: 'Realtime FX Rates (Spot)',
      method: 'GET' as HTTPMethod,
      path: '/api/v1/pricing/realtime/FX_USD_EUR',
      ttl: '60s (1m)',
      warmOutcome: 'HIT' as const
    },
    {
      label: 'Tax Calculation (Dynamic Cold)',
      method: 'POST' as HTTPMethod,
      path: '/api/v1/orders/checkout/calculate-tax',
      ttl: '0s (Bypass / Miss)',
      warmOutcome: 'MISS' as const
    }
  ];

  const handleSelectPreset = (preset: typeof presets[0]) => {
    setHttpMethod(preset.method);
    setSelectedEndpoint(preset.path);
  };

  const handleRunExecution = () => {
    setIsLoading(true);
    const isHit = isSimulatingWarmCache;
    const latency = isHit ? Math.floor(Math.random() * 8) + 8 : Math.floor(Math.random() * 60) + 175;
    const originLatency = Math.floor(Math.random() * 40) + 185;

    setTimeout(() => {
      setIsLoading(false);
      const result = {
        status: 200,
        outcome: (isHit ? 'HIT' : 'MISS') as 'HIT' | 'MISS',
        latencyMs: latency,
        originLatencyMs: originLatency,
        headers: {
          'x-cacheflow-status': isHit ? 'HIT' : 'MISS',
          'cache-control': isHit ? 'public, max-age=3600, s-maxage=86400' : 'no-cache, private',
          'cf-edge-pop': 'IAD-01',
          'x-cacheflow-latency': `${latency}ms`,
          'x-origin-latency': `${originLatency}ms`,
          'etag': `W/"${Math.random().toString(36).substring(2, 9)}"`,
          'content-type': 'application/json'
        },
        body: {
          path: selectedEndpoint,
          status: 'ok',
          accelerated: isHit,
          server_timestamp: new Date().toISOString(),
          edge_node: 'iad-01.cacheflow.internal',
          cache_hit_ratio: '88.4%'
        },
        executedAt: new Date().toLocaleTimeString()
      };
      setLastExecutionResult(result);
      if (onRequestExecuted) {
        onRequestExecuted(httpMethod, selectedEndpoint, result.outcome, latency);
      }
      onShowToast(
        `Executed ${httpMethod} ${selectedEndpoint}`,
        `${result.outcome}: ${latency}ms (origin was ${originLatency}ms)`,
        isHit ? 'success' : 'info'
      );
    }, 350);
  };

  const getCodeSnippet = () => {
    switch (activeLang) {
      case 'curl':
        return `# Execute request through CacheFlow Edge Acceleration Proxy
curl -X ${httpMethod} "https://edge.cacheflow.io${selectedEndpoint}" \\
  -H "Authorization: Bearer cf_live_9f7a81b2c4e6d8a0" \\
  -H "X-CacheFlow-Debug: true" \\
  -H "Accept-Encoding: gzip, br"`;

      case 'typescript':
        return `// TypeScript SDK Integration
import { CacheFlowClient } from '@cacheflow/sdk';

const cacheflow = new CacheFlowClient({
  apiKey: process.env.CACHEFLOW_API_KEY,
  cluster: 'global-anycast',
  timeoutMs: 3000
});

const response = await cacheflow.fetch('${selectedEndpoint}', {
  method: '${httpMethod}',
  cacheControl: {
    edgeTtl: 86400,
    staleWhileRevalidate: 604800
  }
});

console.log(response.status, response.headers.get('x-cacheflow-status'));
const data = await response.json();`;

      case 'python':
        return `# Python SDK Integration
import cacheflow

client = cacheflow.Client(api_key="cf_live_9f7a81b2c4e6d8a0")

response = client.request(
    method="${httpMethod}",
    path="${selectedEndpoint}",
    ttl=86400,
    swr=604800
)

print(f"Latency: {response.latency_ms}ms, Status: {response.cache_outcome}")
print(response.json())`;

      case 'go':
        return `// Go Client Integration
package main

import (
  "context"
  "fmt"
  "github.com/cacheflow/sdk-go"
)

func main() {
  client := cacheflow.NewClient("cf_live_9f7a81b2c4e6d8a0")
  resp, err := client.Fetch(context.Background(), &cacheflow.Request{
    Method: "${httpMethod}",
    Path:   "${selectedEndpoint}",
  })
  if err != nil {
    panic(err)
  }
  fmt.Printf("Edge Latency: %v | Outcome: %s\\n", resp.Latency, resp.Status)
}`;
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(getCodeSnippet());
    setCopiedSnippet(true);
    onShowToast('Code snippet copied to clipboard', undefined, 'success');
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Workbench Header Controls */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-indigo-600" />
              <span>Edge Request Workbench & cURL Runner</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Simulate live edge proxy invocations to observe caching behavior, TTL headers, and latency delta.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs text-slate-700 font-medium cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isSimulatingWarmCache}
                onChange={(e) => setIsSimulatingWarmCache(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
              />
              <span>Simulate Warm Cache (HIT)</span>
            </label>

            <button
              onClick={handleRunExecution}
              disabled={isLoading}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs shadow-indigo-200"
            >
              {isLoading ? (
                <>
                  <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                  <span>Invoking Edge...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Execute Request</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Preset Selector */}
        <div className="pt-4 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-mono text-slate-400 font-semibold uppercase mr-1">
            Presets:
          </span>
          {presets.map((preset) => (
            <button
              key={preset.label}
              onClick={() => handleSelectPreset(preset)}
              className={`px-3 py-1.5 text-xs rounded-md border transition-all text-left flex items-center gap-2 ${
                selectedEndpoint === preset.path
                  ? 'bg-indigo-50 text-indigo-800 border-indigo-200 font-semibold'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <span className="font-mono text-[10px] text-slate-500">{preset.method}</span>
              <span>{preset.label}</span>
            </button>
          ))}
        </div>

        {/* Interactive Endpoint URL Bar */}
        <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <select
            value={httpMethod}
            onChange={(e) => setHttpMethod(e.target.value as HTTPMethod)}
            className="px-3 py-2 text-xs font-mono font-bold bg-slate-100 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-indigo-500"
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
          </select>

          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400 select-none">
              https://edge.cacheflow.io
            </span>
            <input
              type="text"
              value={selectedEndpoint}
              onChange={(e) => setSelectedEndpoint(e.target.value)}
              className="w-full pl-48 pr-3 py-2 text-xs font-mono text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:bg-white"
            />
          </div>
        </div>
      </div>

      {/* Code Snippets & Execution Result Container */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Side: Dark-themed Terminal Code Well */}
        <div className="bg-[#0F172A] border border-slate-800 rounded-xl overflow-hidden shadow-md flex flex-col">
          {/* Header Bar */}
          <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
              {(['curl', 'typescript', 'python', 'go'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setActiveLang(lang)}
                  className={`px-2.5 py-1 text-xs font-mono rounded transition-colors ${
                    activeLang === lang
                      ? 'bg-indigo-600 text-white font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>

            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-white transition-colors"
            >
              {copiedSnippet ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          {/* Syntax Highlighted Code Well */}
          <div className="p-5 font-mono text-xs overflow-x-auto text-slate-300 leading-relaxed flex-1">
            <pre className="whitespace-pre">{getCodeSnippet()}</pre>
          </div>

          {/* Terminal Footer */}
          <div className="px-4 py-2.5 bg-slate-950 border-t border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Proxy Gateway Ready</span>
            </span>
            <span className="text-slate-500">HTTP/2 & HTTP/3 Enabled</span>
          </div>
        </div>

        {/* Right Side: Live Execution Telemetry & Response */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
              <div>
                <h3 className="text-xs font-semibold text-slate-800 flex items-center gap-2">
                  <span>Execution Telemetry Response</span>
                  {lastExecutionResult && (
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        lastExecutionResult.outcome === 'HIT'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {lastExecutionResult.outcome}
                    </span>
                  )}
                </h3>
                <span className="text-[11px] text-slate-400 font-mono">
                  Executed at {lastExecutionResult?.executedAt || 'N/A'}
                </span>
              </div>

              {lastExecutionResult && (
                <div className="text-right">
                  <div className="text-sm font-mono font-bold text-indigo-700 tabular-nums">
                    {lastExecutionResult.latencyMs} ms
                  </div>
                  <div className="text-[10px] text-emerald-600 font-mono font-medium">
                    -{lastExecutionResult.originLatencyMs - lastExecutionResult.latencyMs}ms origin delta
                  </div>
                </div>
              )}
            </div>

            {/* Response Metrics comparison */}
            {lastExecutionResult && (
              <div className="p-4 border-b border-slate-100 bg-slate-50/40 grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 bg-white rounded-lg border border-slate-200/80">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Edge Response Time</div>
                  <div className="mt-1 text-base font-bold text-emerald-700 tabular-nums">
                    {lastExecutionResult.latencyMs} ms
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Instant Edge Cache</div>
                </div>

                <div className="p-3 bg-white rounded-lg border border-slate-200/80">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Origin Direct Time</div>
                  <div className="mt-1 text-base font-bold text-slate-700 tabular-nums">
                    {lastExecutionResult.originLatencyMs} ms
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Uncached Cold Roundtrip</div>
                </div>
              </div>
            )}

            {/* Response Headers & Body tabs */}
            <div className="p-4 space-y-4">
              <div>
                <div className="text-[11px] font-mono font-semibold uppercase text-slate-400 mb-2">
                  Key Cache Headers
                </div>
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200/80 font-mono text-[11px] space-y-1">
                  {lastExecutionResult &&
                    Object.entries(lastExecutionResult.headers).slice(0, 5).map(([k, v]) => (
                      <div key={k} className="flex items-start gap-2">
                        <span className="text-indigo-600 font-semibold">{k}:</span>
                        <span className="text-slate-800 break-all">{v}</span>
                      </div>
                    ))}
                </div>
              </div>

              <div>
                <div className="text-[11px] font-mono font-semibold uppercase text-slate-400 mb-2">
                  Body Payload
                </div>
                <div className="bg-slate-900 rounded-lg p-3 text-emerald-400 font-mono text-xs overflow-x-auto max-h-48">
                  <pre>{JSON.stringify(lastExecutionResult?.body, null, 2)}</pre>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
            <span>Cache Key Hash: <span className="font-mono text-slate-700">sha256:4a88f19</span></span>
            <span className="text-emerald-700 font-semibold font-mono">100% Invariants Verified</span>
          </div>
        </div>
      </div>
    </div>
  );
};
