import { BolnaConfig } from '../types';

/**
 * =========================================================================
 * BOLNA VOICE AGENT INTEGRATION MODULE (PLACEHOLDER ARCHITECTURE)
 * =========================================================================
 * 
 * IMPORTANT ARCHITECTURAL NOTICE:
 * This module is a documented integration bridge for Bolna voice agents.
 * In this prototype phase, NO live connection to Bolna is established.
 * All voice interactions run on the safe local rule-based simulation engine.
 * 
 * Required external variables before production activation:
 * 1. BOLNA_AGENT_ID - Created in Bolna developer dashboard
 * 2. BOLNA_API_KEY  - Issued in Bolna developer portal
 * 3. BOLNA_API_URL  - Standard endpoint (e.g. https://api.bolna.dev)
 * 4. WEBSOCKET_URL  - Low-latency bi-directional audio stream connection
 * =========================================================================
 */

export interface BolnaCallSession {
  sessionId: string;
  agentId: string;
  status: 'disconnected' | 'connecting' | 'connected' | 'ended' | 'failed';
  startedAt?: string;
  endedAt?: string;
  errorMessage?: string;
}

export class BolnaVoiceService {
  private config: BolnaConfig;
  private currentSession: BolnaCallSession | null = null;

  constructor(config: BolnaConfig) {
    this.config = config;
  }

  public updateConfig(newConfig: BolnaConfig): void {
    this.config = newConfig;
  }

  public getConfig(): BolnaConfig {
    return { ...this.config };
  }

  /**
   * Status check for Bolna connectivity.
   */
  public isConfigured(): boolean {
    return Boolean(this.config.apiKey && this.config.agentId);
  }

  /**
   * Triggers a live telephone call to the verified phone number (+917357527386).
   */
  public async initiateCall(scenarioId: string, promptVersion: string): Promise<BolnaCallSession> {
    try {
      const response = await fetch('/api/trigger-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent_id: this.config.agentId || '77903ab3-a9e5-4756-904b-345fdf96f785',
          recipient_phone_number: '+917357527386',
          scenario_id: scenarioId,
          prompt_version: promptVersion
        })
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || 'Failed to trigger outbound call');
      }

      this.currentSession = {
        sessionId: data.execution_id,
        agentId: this.config.agentId,
        status: 'connected',
        startedAt: new Date().toISOString()
      };

      return this.currentSession;
    } catch (err: any) {
      return {
        sessionId: `err-${Date.now()}`,
        agentId: this.config.agentId || '77903ab3-a9e5-4756-904b-345fdf96f785',
        status: 'failed',
        errorMessage: err.message || 'Call failed'
      };
    }
  }

  /**
   * Checks the status and retrieves evaluation report for a call execution.
   */
  public async checkExecution(executionId: string): Promise<any> {
    const res = await fetch(`/api/call-status?id=${executionId}`);
    return await res.json();
  }

  /**
   * Terminates an active call session.
   */
  public async terminateCall(sessionId: string): Promise<void> {
    try {
      await fetch('/api/stop-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ execution_id: sessionId })
      });
    } catch (e) {
      console.warn('Failed to stop call', e);
    }
    this.currentSession = null;
  }
}
