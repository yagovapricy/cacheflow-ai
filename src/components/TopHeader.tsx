import React from 'react';
import { 
  Play, 
  Pause, 
  Trash2, 
  RefreshCw, 
  Search, 
  SlidersHorizontal,
  Plus
} from 'lucide-react';
import { ActiveScreen } from '../types/cacheflow';

interface TopHeaderProps {
  activeScreen: ActiveScreen;
  isStreaming: boolean;
  setIsStreaming: (val: boolean) => void;
  onOpenPurgeModal: () => void;
  onSimulateRequest: () => void;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  activeScreen,
  isStreaming,
  setIsStreaming,
  onOpenPurgeModal,
  onSimulateRequest,
  searchQuery,
  setSearchQuery,
}) => {
  const getScreenTitle = () => {
    switch (activeScreen) {
      case 'overview':
        return { section: 'Telemetry', title: 'Executive Overview & Latency KPIs' };
      case 'stream':
        return { section: 'Monitoring', title: 'Live Request Stream Inspector' };
      case 'playground':
        return { section: 'Developer Workbench', title: 'Query & Cache Execution Playground' };
      case 'rules':
        return { section: 'Edge Routing', title: 'Cache Rules & Invalidation Manager' };
      case 'vault':
        return { section: 'Security', title: 'API Key Management Vault' };
      case 'finops':
        return { section: 'FinOps', title: 'Cloud Cost Optimization & ROI Analysis' };
      default:
        return { section: 'Dashboard', title: 'CacheFlow Precision' };
    }
  };

  const { section, title } = getScreenTitle();

  return (
    <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between gap-4 sticky top-0 z-10">
      {/* Breadcrumb Trail */}
      <div className="flex items-center gap-2 text-xs min-w-0">
        <span className="text-slate-400 font-medium">{section}</span>
        <span className="text-slate-300">/</span>
        <h1 className="font-semibold text-slate-800 text-sm tracking-tight truncate">
          {title}
        </h1>
      </div>

      {/* Global Actions */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Global Search Bar (especially for stream/rules/vault) */}
        <div className="relative hidden md:block">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filter paths, keys, status..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-56 pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:border-indigo-500 focus:bg-white transition-all placeholder:text-slate-400 font-mono"
          />
        </div>

        {/* Live Stream Play/Pause Toggle */}
        <button
          onClick={() => setIsStreaming(!isStreaming)}
          className={`px-3 py-1.5 text-xs font-medium rounded-md border flex items-center gap-1.5 transition-colors ${
            isStreaming
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
          }`}
          title={isStreaming ? 'Pause live request streaming' : 'Resume live request streaming'}
        >
          {isStreaming ? (
            <>
              <Pause className="w-3.5 h-3.5 text-emerald-600" />
              <span>Stream Active</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 text-slate-600" />
              <span>Stream Paused</span>
            </>
          )}
        </button>

        {/* Trigger mock incoming request */}
        <button
          onClick={onSimulateRequest}
          className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 hover:border-slate-300 transition-colors flex items-center gap-1.5 shadow-2xs"
        >
          <RefreshCw className="w-3.5 h-3.5 text-indigo-600" />
          <span className="hidden sm:inline">Simulate Hit</span>
        </button>

        {/* Instant Purge Button */}
        <button
          onClick={onOpenPurgeModal}
          className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors flex items-center gap-1.5 shadow-xs shadow-indigo-200"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Purge Edge</span>
        </button>
      </div>
    </header>
  );
};
