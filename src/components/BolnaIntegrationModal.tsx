import React, { useState } from 'react';
import { X, Radio, Key, Cloud, ShieldAlert, CheckCircle, ExternalLink, AlertTriangle } from 'lucide-react';
import { BolnaConfig } from '../types';

interface BolnaIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: BolnaConfig;
  onSaveConfig: (config: BolnaConfig) => void;
}

export const BolnaIntegrationModal: React.FC<BolnaIntegrationModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig
}) => {
  const [apiKey, setApiKey] = useState(config.apiKey || '');
  const [agentId, setAgentId] = useState(config.agentId || 'bolna_agent_demo_smartcrisis_v2');
  const [apiBaseUrl, setApiBaseUrl] = useState(config.apiBaseUrl || 'https://api.bolna.dev/v1');
  const [webhookUrl, setWebhookUrl] = useState(config.webhookUrl || 'https://smartcrisis.internal/api/webhooks/voice');
  const [environment, setEnvironment] = useState<'sandbox' | 'production'>(config.environment || 'sandbox');

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig({
      apiKey: apiKey.trim(),
      agentId: agentId.trim(),
      apiBaseUrl: apiBaseUrl.trim(),
      webhookUrl: webhookUrl.trim(),
      environment,
      isConnected: false // Kept false: strictly labeled as local prototype until live key validated
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 my-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-emerald-400 flex items-center justify-center">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Bolna Voice AI Integration Config</h3>
              <p className="text-xs text-slate-500">Documented placeholders for production voice agent bridge</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Integration Status Disclaimer Alert */}
        <div className="my-4 p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs space-y-1">
          <div className="flex items-center gap-2 font-bold text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Local Prototype Mode Active</span>
          </div>
          <p className="text-amber-800 text-[11px] leading-relaxed">
            The voice simulator currently runs on a deterministic, safe local rule-based simulation engine. 
            No live Bolna voice session is active until valid credentials and agent endpoints are configured.
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Bolna Agent ID (Placeholder)
            </label>
            <input
              type="text"
              value={agentId}
              onChange={(e) => setAgentId(e.target.value)}
              placeholder="e.g. bolna_agent_991823ab"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-mono"
            />
            <p className="text-[10px] text-slate-400 mt-1">Configured in Bolna Voice Agent dashboard.</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Bolna API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter Bolna secret API key (optional for local prototype)..."
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-mono"
            />
            <p className="text-[10px] text-slate-400 mt-1">Never committed to source control.</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Bolna API Base URL
              </label>
              <input
                type="text"
                value={apiBaseUrl}
                onChange={(e) => setApiBaseUrl(e.target.value)}
                placeholder="https://api.bolna.dev/v1"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-mono text-[11px]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Environment</label>
              <select
                value={environment}
                onChange={(e) => setEnvironment(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
              >
                <option value="sandbox">Sandbox (Testing)</option>
                <option value="production">Production</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Webhook Call Event Endpoint
            </label>
            <input
              type="text"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://smartcrisis.internal/api/webhooks/voice"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-mono text-[11px]"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              Settings persist in browser localStorage
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Close
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm"
              >
                Save Configuration
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
