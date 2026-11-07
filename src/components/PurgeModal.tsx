import React, { useState } from 'react';
import { Trash2, X, Zap, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';

interface PurgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPurge: (target: string, type: 'url' | 'tag' | 'wildcard') => void;
}

export const PurgeModal: React.FC<PurgeModalProps> = ({ isOpen, onClose, onPurge }) => {
  const [purgeType, setPurgeType] = useState<'url' | 'tag' | 'wildcard'>('url');
  const [purgeInput, setPurgeInput] = useState('');
  const [isPurging, setIsPurging] = useState(false);
  const [purgeSuccess, setPurgeSuccess] = useState<{
    target: string;
    popsCount: number;
    propagationMs: number;
  } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!purgeInput.trim()) return;

    setIsPurging(true);
    setPurgeSuccess(null);

    setTimeout(() => {
      setIsPurging(false);
      const res = {
        target: purgeInput,
        popsCount: 48,
        propagationMs: Math.floor(Math.random() * 40) + 105,
      };
      setPurgeSuccess(res);
      onPurge(purgeInput, purgeType);
      setTimeout(() => {
        setPurgeInput('');
      }, 500);
    }, 450);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative bg-white border border-slate-200 rounded-xl shadow-2xl max-w-lg w-full z-10 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2">
            <Trash2 className="w-4 h-4 text-rose-600" />
            <h3 className="font-semibold text-slate-900 text-sm">Instant Global Cache Invalidation</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 space-y-4 text-xs">
          <p className="text-slate-500 leading-relaxed">
            Purged keys are globally removed across all 48 Anycast POP memory nodes within &lt;150ms. Next upstream requests will initiate origin revalidation.
          </p>

          {/* Type Selector Tabs */}
          <div>
            <label className="block font-medium text-slate-700 mb-1.5">Purge Method</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setPurgeType('url');
                  setPurgeSuccess(null);
                }}
                className={`py-2 px-3 rounded-lg border text-xs font-medium transition-all ${
                  purgeType === 'url'
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-700 font-semibold'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Exact Path / URL
              </button>

              <button
                type="button"
                onClick={() => {
                  setPurgeType('tag');
                  setPurgeSuccess(null);
                }}
                className={`py-2 px-3 rounded-lg border text-xs font-medium transition-all ${
                  purgeType === 'tag'
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-700 font-semibold'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Surrogate-Key / Tag
              </button>

              <button
                type="button"
                onClick={() => {
                  setPurgeType('wildcard');
                  setPurgeSuccess(null);
                }}
                className={`py-2 px-3 rounded-lg border text-xs font-medium transition-all ${
                  purgeType === 'wildcard'
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-700 font-semibold'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Wildcard Prefix
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                {purgeType === 'url' && 'Exact Request Path'}
                {purgeType === 'tag' && 'Surrogate-Key Cache Tag'}
                {purgeType === 'wildcard' && 'Wildcard Pattern'}
              </label>
              <input
                type="text"
                required
                value={purgeInput}
                onChange={(e) => setPurgeInput(e.target.value)}
                placeholder={
                  purgeType === 'url'
                    ? '/api/v1/catalog/products/prod_88291'
                    : purgeType === 'tag'
                    ? 'catalog:prod_88291 or pricing:eur'
                    : '/api/v1/catalog/**'
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:bg-white font-mono text-xs"
              />
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">
                Quick Fill:
              </span>
              <button
                type="button"
                onClick={() => setPurgeInput('/api/v1/catalog/products/prod_88291')}
                className="text-[11px] font-mono text-indigo-600 hover:underline"
              >
                Catalog Item
              </button>
              <span className="text-slate-300">·</span>
              <button
                type="button"
                onClick={() => setPurgeInput('catalog:all')}
                className="text-[11px] font-mono text-indigo-600 hover:underline"
              >
                Tag: catalog:all
              </button>
              <span className="text-slate-300">·</span>
              <button
                type="button"
                onClick={() => setPurgeInput('/api/v1/pricing/**')}
                className="text-[11px] font-mono text-indigo-600 hover:underline"
              >
                Prefix: /pricing/**
              </button>
            </div>

            {/* Success Telemetry Box */}
            {purgeSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <div className="font-semibold text-emerald-900">
                    Purged across {purgeSuccess.popsCount} Anycast POPs
                  </div>
                  <div className="text-emerald-700 font-mono text-[11px] mt-0.5">
                    Target: {purgeSuccess.target} · Propagation in {purgeSuccess.propagationMs}ms
                  </div>
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                {purgeSuccess ? 'Done' : 'Cancel'}
              </button>

              <button
                type="submit"
                disabled={isPurging || !purgeInput.trim()}
                className="px-4 py-2 font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
              >
                {isPurging ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Broadcasting Purge...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Invalidate Globally</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
