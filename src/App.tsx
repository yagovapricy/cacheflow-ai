import React, { useState, useEffect, useCallback } from 'react';
import { Navigation } from './components/Navigation';
import { TopHeader } from './components/TopHeader';
import { ToastContainer, ToastMessage } from './components/Toast';
import { PurgeModal } from './components/PurgeModal';
import { OverviewScreen } from './components/screens/OverviewScreen';
import { RequestStreamScreen } from './components/screens/RequestStreamScreen';
import { PlaygroundScreen } from './components/screens/PlaygroundScreen';
import { CacheRulesScreen } from './components/screens/CacheRulesScreen';
import { KeyVaultScreen } from './components/screens/KeyVaultScreen';
import { FinOpsScreen } from './components/screens/FinOpsScreen';

import { 
  INITIAL_REQUESTS, 
  INITIAL_CACHE_RULES, 
  INITIAL_API_KEYS 
} from './data/mockData';
import { 
  ActiveScreen, 
  RequestLog, 
  CacheRule, 
  ApiKey, 
  HTTPMethod, 
  CacheOutcome 
} from './types/cacheflow';

export default function App() {
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>('overview');
  const [selectedCluster, setSelectedCluster] = useState<string>('prod-global');
  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Data State
  const [requests, setRequests] = useState<RequestLog[]>(INITIAL_REQUESTS);
  const [rules, setRules] = useState<CacheRule[]>(INITIAL_CACHE_RULES);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(INITIAL_API_KEYS);
  
  // Modals & Toasts
  const [isPurgeModalOpen, setIsPurgeModalOpen] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback(
    (title: string, description?: string, type: 'success' | 'info' | 'error' = 'info') => {
      const id = 'toast_' + Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, title, description, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    },
    []
  );

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Realistic mock request generator
  const generateRandomRequest = useCallback((): RequestLog => {
    const paths = [
      { path: '/api/v1/catalog/products/prod_' + Math.floor(Math.random() * 90000 + 10000), method: 'GET' as HTTPMethod, outcome: 'HIT' as CacheOutcome, isGraphQL: false },
      { path: '/api/v1/pricing/realtime/FX_USD_' + ['EUR', 'GBP', 'JPY', 'CAD'][Math.floor(Math.random() * 4)], method: 'GET' as HTTPMethod, outcome: 'HIT' as CacheOutcome, isGraphQL: false },
      { path: '/graphql?op=SearchInventory', method: 'POST' as HTTPMethod, outcome: 'HIT' as CacheOutcome, isGraphQL: true },
      { path: '/api/v1/navigation/taxonomy-tree', method: 'GET' as HTTPMethod, outcome: 'HIT' as CacheOutcome, isGraphQL: false },
      { path: '/api/v1/orders/checkout/calculate-tax', method: 'POST' as HTTPMethod, outcome: 'MISS' as CacheOutcome, isGraphQL: false },
      { path: '/api/v1/content/articles/edge-optimization', method: 'GET' as HTTPMethod, outcome: 'STALE' as CacheOutcome, isGraphQL: false },
      { path: '/api/v1/user/auth-token/refresh', method: 'POST' as HTTPMethod, outcome: 'BYPASS' as CacheOutcome, isGraphQL: false },
    ];

    const pick = paths[Math.floor(Math.random() * paths.length)];
    const pops = ['IAD', 'FRA', 'LHR', 'SJC', 'NRT', 'SIN'];
    const chosenPop = pops[Math.floor(Math.random() * pops.length)];
    
    const isHit = pick.outcome === 'HIT';
    const isStale = pick.outcome === 'STALE';
    const latency = isHit ? Math.floor(Math.random() * 9) + 6 : isStale ? Math.floor(Math.random() * 12) + 14 : Math.floor(Math.random() * 50) + 180;
    const originLatency = Math.floor(Math.random() * 40) + 180;
    const costSaved = isHit ? 0.00012 + Math.random() * 0.00008 : isStale ? 0.00009 : 0;

    const now = new Date();
    const timestampStr = now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');

    return {
      id: 'req_' + Math.random().toString(36).substring(2, 12).toUpperCase(),
      timestamp: timestampStr,
      timeMs: Date.now(),
      method: pick.method,
      statusCode: pick.outcome === 'MISS' ? 200 : (pick.path.includes('taxonomy') ? 304 : 200),
      path: pick.path,
      cacheOutcome: pick.outcome,
      latencyMs: latency,
      originLatencyMs: originLatency,
      costSaved,
      clientIp: `198.51.${Math.floor(Math.random() * 200)}.${Math.floor(Math.random() * 250)}`,
      pop: chosenPop,
      headers: {
        'x-cacheflow-status': pick.outcome,
        'cache-control': isHit ? 'public, max-age=3600, s-maxage=86400' : 'no-cache',
        'cf-edge-pop': `${chosenPop}-01`,
        'etag': `W/"${Math.random().toString(36).substring(2, 8)}"`,
        'content-type': 'application/json',
        'x-origin-latency': `${originLatency}ms`
      },
      responsePayload: {
        path: pick.path,
        status: 'OK',
        pop: chosenPop,
        cached: isHit,
        edge_timestamp: now.toISOString()
      },
      ttlRemainingSec: isHit ? Math.floor(Math.random() * 3000) + 120 : 0
    };
  }, []);

  // Background Streaming Simulation
  useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(() => {
      const newReq = generateRandomRequest();
      setRequests((prev) => [newReq, ...prev.slice(0, 49)]);
    }, 3800);

    return () => clearInterval(interval);
  }, [isStreaming, generateRandomRequest]);

  // Manually simulate a request
  const handleSimulateRequest = () => {
    const newReq = generateRandomRequest();
    setRequests((prev) => [newReq, ...prev.slice(0, 49)]);
    showToast(
      `Simulated ${newReq.method} ${newReq.path}`,
      `${newReq.cacheOutcome} (${newReq.latencyMs}ms at ${newReq.pop})`,
      newReq.cacheOutcome === 'HIT' ? 'success' : 'info'
    );
  };

  // Toggle cache rule
  const handleToggleRule = (ruleId: string) => {
    setRules((prev) =>
      prev.map((r) => {
        if (r.id === ruleId) {
          const nextState = !r.enabled;
          showToast(
            `Rule ${nextState ? 'Enabled' : 'Disabled'}`,
            r.name,
            nextState ? 'success' : 'info'
          );
          return { ...r, enabled: nextState };
        }
        return r;
      })
    );
  };

  // Create new rule
  const handleCreateRule = (newRuleData: Omit<CacheRule, 'id' | 'hitCount' | 'createdAt'>) => {
    const newRule: CacheRule = {
      ...newRuleData,
      id: 'rule_' + Math.random().toString(36).substring(2, 9),
      hitCount: 0,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setRules((prev) => [newRule, ...prev]);
  };

  // Generate API key
  const handleGenerateKey = (keyData: Omit<ApiKey, 'id' | 'createdAt' | 'lastUsedAt' | 'rotationStatus'>) => {
    const newKey: ApiKey = {
      ...keyData,
      id: 'key_' + Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString().slice(0, 10),
      lastUsedAt: 'Never',
      rotationStatus: 'active',
    };
    setApiKeys((prev) => [newKey, ...prev]);
  };

  // Rotate API Key
  const handleRotateKey = (keyId: string, gracePeriodHours: number) => {
    const randomHex = Array.from({ length: 32 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
    const newSecondary = `cf_live_${randomHex}`;

    setApiKeys((prev) =>
      prev.map((k) => {
        if (k.id === keyId) {
          return {
            ...k,
            rotationStatus: 'rotating',
            secondaryKey: newSecondary,
            gracePeriodEndsAt: `${gracePeriodHours}h from now`,
          };
        }
        return k;
      })
    );
  };

  // Revoke Key
  const handleRevokeKey = (keyId: string) => {
    setApiKeys((prev) => prev.filter((k) => k.id !== keyId));
  };

  // Purge key / tag / path
  const handlePurge = (target: string, type: 'url' | 'tag' | 'wildcard') => {
    showToast(
      'Cache Purge Dispatched',
      `Target: ${target} across 48 Anycast POPs`,
      'success'
    );
    // Mark matching request cache entries in current buffer as MISS/PURGED
    setRequests((prev) =>
      prev.map((r) => {
        if (r.path.includes(target) || target.includes(r.path)) {
          return {
            ...r,
            cacheOutcome: 'MISS',
            latencyMs: r.originLatencyMs,
          };
        }
        return r;
      })
    );
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-slate-900 font-sans antialiased">
      {/* 240px Anchored Sidebar Navigation */}
      <Navigation
        activeScreen={activeScreen}
        setActiveScreen={setActiveScreen}
        selectedCluster={selectedCluster}
        setSelectedCluster={setSelectedCluster}
        isStreaming={isStreaming}
        totalRequestsCount={requests.length}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopHeader
          activeScreen={activeScreen}
          isStreaming={isStreaming}
          setIsStreaming={setIsStreaming}
          onOpenPurgeModal={() => setIsPurgeModalOpen(true)}
          onSimulateRequest={handleSimulateRequest}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
          {activeScreen === 'overview' && (
            <OverviewScreen
              requests={requests}
              onNavigateToStream={() => setActiveScreen('stream')}
              onNavigateToPlayground={() => setActiveScreen('playground')}
            />
          )}

          {activeScreen === 'stream' && (
            <RequestStreamScreen
              requests={requests}
              isStreaming={isStreaming}
              setIsStreaming={setIsStreaming}
              onClearLogs={() => setRequests([])}
              onSimulateRequest={handleSimulateRequest}
              onPurgeKey={(key) => handlePurge(key, 'url')}
              onShowToast={showToast}
            />
          )}

          {activeScreen === 'playground' && (
            <PlaygroundScreen
              onShowToast={showToast}
              onRequestExecuted={(method, path, outcome, latency) => {
                const newReq: RequestLog = {
                  id: 'req_bench_' + Math.random().toString(36).substring(2, 7),
                  timestamp: new Date().toTimeString().split(' ')[0],
                  timeMs: Date.now(),
                  method,
                  statusCode: 200,
                  path,
                  cacheOutcome: outcome,
                  latencyMs: latency,
                  originLatencyMs: 194,
                  costSaved: outcome === 'HIT' ? 0.00015 : 0,
                  clientIp: '127.0.0.1 (Playground)',
                  pop: 'IAD',
                  headers: {
                    'x-cacheflow-status': outcome,
                    'x-cacheflow-latency': `${latency}ms`
                  },
                  responsePayload: { path, test: true, outcome },
                  ttlRemainingSec: outcome === 'HIT' ? 3600 : 0
                };
                setRequests((prev) => [newReq, ...prev.slice(0, 49)]);
              }}
            />
          )}

          {activeScreen === 'rules' && (
            <CacheRulesScreen
              rules={rules}
              onToggleRule={handleToggleRule}
              onCreateRule={handleCreateRule}
              onOpenPurgeModal={() => setIsPurgeModalOpen(true)}
              onShowToast={showToast}
            />
          )}

          {activeScreen === 'vault' && (
            <KeyVaultScreen
              apiKeys={apiKeys}
              onGenerateKey={handleGenerateKey}
              onRotateKey={handleRotateKey}
              onRevokeKey={handleRevokeKey}
              onShowToast={showToast}
            />
          )}

          {activeScreen === 'finops' && (
            <FinOpsScreen onShowToast={showToast} />
          )}
        </main>
      </div>

      {/* Global Invalidation / Purge Modal */}
      <PurgeModal
        isOpen={isPurgeModalOpen}
        onClose={() => setIsPurgeModalOpen(false)}
        onPurge={handlePurge}
      />

      {/* Toast Feedback System */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
