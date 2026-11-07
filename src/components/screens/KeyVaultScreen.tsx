import React, { useState } from 'react';
import { 
  KeyRound, 
  Shield, 
  Copy, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  Plus, 
  Trash2, 
  Check, 
  AlertTriangle,
  X,
  Lock,
  Clock
} from 'lucide-react';
import { ApiKey } from '../../types/cacheflow';

interface KeyVaultScreenProps {
  apiKeys: ApiKey[];
  onGenerateKey: (key: Omit<ApiKey, 'id' | 'createdAt' | 'lastUsedAt' | 'rotationStatus'>) => void;
  onRotateKey: (keyId: string, gracePeriodHours: number) => void;
  onRevokeKey: (keyId: string) => void;
  onShowToast: (title: string, description?: string, type?: 'success' | 'info' | 'error') => void;
}

export const KeyVaultScreen: React.FC<KeyVaultScreenProps> = ({
  apiKeys,
  onGenerateKey,
  onRotateKey,
  onRevokeKey,
  onShowToast,
}) => {
  const [revealedKeyIds, setRevealedKeyIds] = useState<Record<string, boolean>>({});
  const [rotatingKey, setRotatingKey] = useState<ApiKey | null>(null);
  const [rotationChallengeInput, setRotationChallengeInput] = useState('');
  const [rotationGraceHours, setRotationGraceHours] = useState(72);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);

  // Form states for new key
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyEnv, setNewKeyEnv] = useState<'production' | 'staging' | 'development'>('production');
  const [newKeyPermissions, setNewKeyPermissions] = useState<('read' | 'write' | 'purge' | 'metrics')[]>([
    'read',
    'write',
    'purge',
  ]);

  const toggleReveal = (keyId: string) => {
    setRevealedKeyIds((prev) => ({
      ...prev,
      [keyId]: !prev[keyId],
    }));
  };

  const handleCopySecret = (secret: string, keyName: string) => {
    navigator.clipboard.writeText(secret);
    onShowToast('API Key copied to clipboard', keyName, 'success');
  };

  const handleConfirmRotation = () => {
    if (!rotatingKey) return;
    if (rotationChallengeInput.trim() !== 'ROTATE KEY') {
      onShowToast('Challenge text mismatch', 'Please type "ROTATE KEY" to confirm', 'error');
      return;
    }

    onRotateKey(rotatingKey.id, rotationGraceHours);
    onShowToast(
      'Dual-Key Rotation Initiated',
      `Secondary key generated. ${rotationGraceHours}h zero-downtime grace period active.`,
      'success'
    );
    setRotatingKey(null);
    setRotationChallengeInput('');
  };

  const handleCreateKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) {
      onShowToast('Validation error', 'Key name is required', 'error');
      return;
    }

    const randomHex = Array.from({ length: 32 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
    const prefix = newKeyEnv === 'production' ? 'cf_live_' : 'cf_test_';
    const fullSecret = `${prefix}${randomHex}`;
    const maskedSecret = `••••••••••••••••••••••••••••${randomHex.slice(-4)}`;

    onGenerateKey({
      name: newKeyName,
      environment: newKeyEnv,
      keyPrefix: prefix,
      maskedSecret,
      fullSecret,
      permissions: newKeyPermissions,
    });

    setIsGenerateModalOpen(false);
    setNewKeyName('');
    onShowToast('New API Key Generated', 'Store it securely in your secret manager', 'success');
  };

  const togglePermission = (perm: 'read' | 'write' | 'purge' | 'metrics') => {
    if (newKeyPermissions.includes(perm)) {
      if (newKeyPermissions.length === 1) return; // Keep at least one
      setNewKeyPermissions(newKeyPermissions.filter((p) => p !== perm));
    } else {
      setNewKeyPermissions([...newKeyPermissions, perm]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <Lock className="w-4 h-4 text-indigo-600" />
            <span>API Key Management Vault</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Secure client authentication credentials with zero-downtime dual-key rotation and granular scope permissions.
          </p>
        </div>

        <button
          onClick={() => setIsGenerateModalOpen(true)}
          className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs shadow-indigo-200"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Generate New Key</span>
        </button>
      </div>

      {/* Keys List */}
      <div className="space-y-3">
        {apiKeys.map((key) => {
          const isRevealed = revealedKeyIds[key.id];
          return (
            <div
              key={key.id}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-slate-300 transition-colors"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Key metadata & environment badge */}
                <div>
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-sm font-semibold text-slate-900">{key.name}</h3>
                    <span
                      className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full uppercase ${
                        key.environment === 'production'
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {key.environment}
                    </span>
                    {key.rotationStatus === 'rotating' && (
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>ROTATION IN PROGRESS</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-500 mt-1 font-mono">
                    <span>Created {key.createdAt}</span>
                    <span>·</span>
                    <span>Last used: {key.lastUsedAt}</span>
                  </div>
                </div>

                {/* Permissions chips */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {key.permissions.map((perm) => (
                    <span
                      key={perm}
                      className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200"
                    >
                      cache:{perm}
                    </span>
                  ))}
                </div>
              </div>

              {/* Secret Bar & Action triggers */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/80 font-mono text-xs text-slate-800 flex-1 max-w-lg">
                  <KeyRound className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate select-all">
                    {isRevealed ? key.fullSecret : key.maskedSecret}
                  </span>
                  <button
                    onClick={() => toggleReveal(key.id)}
                    className="text-slate-400 hover:text-slate-600 ml-auto p-1"
                    title={isRevealed ? 'Hide secret' : 'Reveal secret'}
                  >
                    {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => handleCopySecret(key.fullSecret, key.name)}
                    className="text-slate-400 hover:text-indigo-600 p-1"
                    title="Copy full API key"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setRotatingKey(key);
                      setRotationChallengeInput('');
                    }}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Rotate Key</span>
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`Revoke API key "${key.name}"? This action cannot be undone.`)) {
                        onRevokeKey(key.id);
                        onShowToast('API Key Revoked', key.name, 'info');
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Revoke key"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dual-Key Rotation Confirmation Drawer / Modal */}
      {rotatingKey && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setRotatingKey(null)}
          />

          <div className="relative bg-white border border-slate-200 rounded-xl shadow-2xl max-w-lg w-full z-10 overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-amber-50/60">
              <div className="flex items-center gap-2 text-amber-900 font-semibold text-sm">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Zero-Downtime Dual-Key Rotation</span>
              </div>
              <button onClick={() => setRotatingKey(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <p className="text-slate-600 leading-relaxed">
                You are rotating <strong>{rotatingKey.name}</strong>. A secondary key will be immediately active alongside the primary key, allowing your upstream services to update without downtime.
              </p>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Zero-Downtime Grace Period
                </label>
                <select
                  value={rotationGraceHours}
                  onChange={(e) => setRotationGraceHours(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 font-mono text-xs"
                >
                  <option value={24}>24 hours</option>
                  <option value={48}>48 hours</option>
                  <option value={72}>72 hours (Recommended)</option>
                  <option value={168}>7 days</option>
                </select>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  The old key will remain valid until the grace period expires.
                </span>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-2">
                <div className="font-semibold text-slate-800">Validation Challenge</div>
                <p className="text-slate-500">
                  To prevent accidental key cycling, please type <span className="font-mono font-bold text-slate-800">ROTATE KEY</span> below:
                </p>
                <input
                  type="text"
                  value={rotationChallengeInput}
                  onChange={(e) => setRotationChallengeInput(e.target.value)}
                  placeholder="ROTATE KEY"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500 font-mono text-xs uppercase"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRotatingKey(null)}
                  className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={rotationChallengeInput.trim() !== 'ROTATE KEY'}
                  onClick={handleConfirmRotation}
                  className="px-4 py-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:pointer-events-none rounded-lg transition-colors shadow-xs"
                >
                  Confirm & Issue Secondary Key
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Generate New Key Modal */}
      {isGenerateModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsGenerateModalOpen(false)}
          />

          <div className="relative bg-white border border-slate-200 rounded-xl shadow-2xl max-w-lg w-full z-10 overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-indigo-600" />
                <h3 className="font-semibold text-slate-900 text-sm">Generate New Edge API Key</h3>
              </div>
              <button onClick={() => setIsGenerateModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateKey} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Key Description / Client Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. EU-West E-Commerce Gateway"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:bg-white text-xs"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Target Environment</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['production', 'staging', 'development'] as const).map((env) => (
                    <button
                      key={env}
                      type="button"
                      onClick={() => setNewKeyEnv(env)}
                      className={`py-2 px-3 rounded-lg border text-xs capitalize font-medium transition-all ${
                        newKeyEnv === env
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-700 font-semibold'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {env}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1.5">Scoped Permissions</label>
                <div className="space-y-2">
                  {(['read', 'write', 'purge', 'metrics'] as const).map((p) => {
                    const isChecked = newKeyPermissions.includes(p);
                    return (
                      <label
                        key={p}
                        onClick={() => togglePermission(p)}
                        className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer select-none transition-colors ${
                          isChecked ? 'bg-indigo-50/50 border-indigo-200' : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div>
                          <div className="font-mono font-semibold text-slate-800 text-xs">cache:{p}</div>
                          <div className="text-[11px] text-slate-500">
                            {p === 'read' && 'Query and read cached entries'}
                            {p === 'write' && 'Store and prime cache records'}
                            {p === 'purge' && 'Invalidate tags, paths, and wildcards'}
                            {p === 'metrics' && 'Export latency and telemetry metrics'}
                          </div>
                        </div>
                        <div
                          className={`w-4 h-4 rounded flex items-center justify-center border ${
                            isChecked ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300'
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3" />}
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsGenerateModalOpen(false)}
                  className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
                >
                  Generate Key
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
