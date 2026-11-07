import React from 'react';
import { 
  Activity, 
  Radio, 
  Terminal, 
  Layers, 
  KeyRound, 
  TrendingDown, 
  Server, 
  ChevronDown, 
  CheckCircle2,
  ExternalLink,
  Zap
} from 'lucide-react';
import { ActiveScreen } from '../types/cacheflow';

interface NavigationProps {
  activeScreen: ActiveScreen;
  setActiveScreen: (screen: ActiveScreen) => void;
  selectedCluster: string;
  setSelectedCluster: (cluster: string) => void;
  isStreaming: boolean;
  totalRequestsCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeScreen,
  setActiveScreen,
  selectedCluster,
  setSelectedCluster,
  isStreaming,
  totalRequestsCount
}) => {
  const [clusterDropdownOpen, setClusterDropdownOpen] = React.useState(false);

  const clusters = [
    { id: 'prod-global', name: 'Production Global Edge', region: '48 POPs (Anycast)', status: 'optimal' },
    { id: 'staging-us', name: 'Staging US Edge', region: '12 POPs (Americas)', status: 'optimal' },
    { id: 'dev-local', name: 'Dev Sandbox Node', region: 'Local Proxy :8080', status: 'optimal' },
  ];

  const currentClusterObj = clusters.find(c => c.id === selectedCluster) || clusters[0];

  const navItems: { id: ActiveScreen; label: string; icon: React.FC<{ className?: string }>; badge?: string }[] = [
    { id: 'overview', label: 'Overview & KPIs', icon: Activity },
    { id: 'stream', label: 'Request Stream', icon: Radio, badge: isStreaming ? 'LIVE' : 'PAUSED' },
    { id: 'playground', label: 'Query Playground', icon: Terminal },
    { id: 'rules', label: 'Cache Rules & Purge', icon: Layers },
    { id: 'vault', label: 'API Key Vault', icon: KeyRound },
    { id: 'finops', label: 'FinOps & Cost ROI', icon: TrendingDown },
  ];

  return (
    <aside className="w-64 shrink-0 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0 select-none z-20">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-200">
            <Zap className="w-4 h-4 fill-white" />
          </div>
          <div>
            <div className="font-heading font-bold text-base tracking-tight text-slate-900 leading-none">
              CacheFlow
            </div>
            <div className="text-[11px] text-slate-400 font-medium tracking-normal mt-1 flex items-center gap-1.5">
              <span>Precision System</span>
              <span className="text-slate-300">·</span>
              <span className="font-mono text-[10px] text-slate-500 font-semibold">v2.4-edge</span>
            </div>
          </div>
        </div>

        {/* Cluster Selector */}
        <div className="mt-3 relative">
          <button
            onClick={() => setClusterDropdownOpen(!clusterDropdownOpen)}
            className="w-full flex items-center justify-between p-2 rounded-md bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-left transition-colors"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <div className="truncate">
                <div className="text-xs font-semibold text-slate-800 truncate">{currentClusterObj.name}</div>
                <div className="text-[10px] text-slate-500 truncate">{currentClusterObj.region}</div>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
          </button>

          {clusterDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-30 py-1 overflow-hidden">
              {clusters.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setSelectedCluster(c.id);
                    setClusterDropdownOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center justify-between transition-colors ${
                    selectedCluster === c.id ? 'bg-indigo-50/70' : ''
                  }`}
                >
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-slate-800">{c.name}</div>
                    <div className="text-[10px] text-slate-500">{c.region}</div>
                  </div>
                  {selectedCluster === c.id && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-2 pb-1.5 text-[10px] font-mono font-semibold tracking-wider text-slate-400 uppercase">
          Navigation
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeScreen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveScreen(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-all ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? 'text-indigo-600' : 'text-slate-400'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                    isStreaming
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        <div className="pt-5 px-2 pb-1.5 text-[10px] font-mono font-semibold tracking-wider text-slate-400 uppercase">
          Edge Telemetry
        </div>

        <div className="bg-slate-50/80 rounded-lg p-3 border border-slate-200/80 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 text-[11px]">Cache Hit Rate</span>
            <span className="font-mono text-emerald-700 font-semibold tabular-nums text-xs">88.4%</span>
          </div>
          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: '88.4%' }} />
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-slate-500 text-[11px]">Avg Latency</span>
            <span className="font-mono text-indigo-700 font-semibold tabular-nums text-xs">11.8ms</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>Requests</span>
            <span className="font-mono tabular-nums text-slate-700 font-medium">
              {totalRequestsCount.toLocaleString()}
            </span>
          </div>
        </div>
      </nav>

      {/* Footer Operator Info */}
      <div className="p-3 border-t border-slate-200 bg-slate-50/50">
        <div className="flex items-center gap-2.5 px-2 py-1.5">
          <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">
            SL
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold text-slate-800 truncate">Sarah Lin</div>
            <div className="text-[10px] text-slate-500 truncate">Principal Infra Engineer</div>
          </div>
        </div>
      </div>
    </aside>
  );
};
