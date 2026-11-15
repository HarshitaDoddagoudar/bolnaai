import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Send, 
  Play, 
  Square, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  ShieldAlert, 
  Bot, 
  User, 
  Radio, 
  Save, 
  Settings2,
  Clock,
  PhoneCall,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { Scenario, ChatMessage, TestRecord } from '../types';
import { generateSimulationResponse } from '../services/simulationEngine';
import { speechService } from '../services/speechService';
import { TabKey } from './Sidebar';

interface VoiceSimulatorViewProps {
  scenarios: Scenario[];
  selectedScenarioId: string;
  onSelectScenario: (id: string) => void;
  promptVersion: 'V1' | 'V2' | 'V3';
  onChangePromptVersion: (ver: 'V1' | 'V2' | 'V3') => void;
  onSaveTestRecord: (test: TestRecord) => void;
  onOpenBolnaConfig: () => void;
  onNavigate: (tab: TabKey) => void;
}

export const VoiceSimulatorView: React.FC<VoiceSimulatorViewProps> = ({
  scenarios,
  selectedScenarioId,
  onSelectScenario,
  promptVersion,
  onChangePromptVersion,
  onSaveTestRecord,
  onOpenBolnaConfig,
  onNavigate
}) => {
  const activeScenario = scenarios.find(s => s.id === selectedScenarioId) || scenarios[0];

  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [ttsEnabled, setTtsEnabled] = useState<boolean>(true);
  const [durationSeconds, setDurationSeconds] = useState<number>(0);
  const [hasSavedRecord, setHasSavedRecord] = useState<boolean>(false);
  const [micError, setMicError] = useState<string | null>(null);

  const timerRef = useRef<number | null>(null);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll chat window
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Duration timer
  useEffect(() => {
    if (isRunning) {
      timerRef.current = window.setInterval(() => {
        setDurationSeconds(d => d + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  const startSimulation = () => {
    setIsRunning(true);
    setDurationSeconds(0);
    setHasSavedRecord(false);
    setMicError(null);

    const initialMessages: ChatMessage[] = [
      {
        id: `sys-${Date.now()}`,
        sender: 'system',
        text: 'FICTIONAL SIMULATION INITIALIZED: This is an emergency training exercise and NOT a real emergency service. In a real life emergency, immediately dial 112.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      },
      {
        id: `caller-${Date.now()}`,
        sender: 'caller',
        text: activeScenario.callerScript,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      }
    ];

    setMessages(initialMessages);

    // Initial response from agent
    setTimeout(() => {
      const response = generateSimulationResponse(activeScenario.callerScript, activeScenario, promptVersion, 0);
      const agentMsg: ChatMessage = {
        id: `agent-${Date.now()}`,
        sender: 'agent',
        text: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      };
      setMessages(prev => [...prev, agentMsg]);
      if (ttsEnabled) {
        speechService.speak(response.text);
      }
    }, 800);
  };

  const endSimulation = () => {
    setIsRunning(false);
    if (isListening) {
      speechService.stopListening();
      setIsListening(false);
    }
    speechService.stopSpeaking();

    const endMsg: ChatMessage = {
      id: `sys-end-${Date.now()}`,
      sender: 'system',
      text: 'SIMULATION CONCLUDED: Review the transcript below and save the record to safety evaluation history.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
    setMessages(prev => [...prev, endMsg]);
  };

  const resetSimulation = () => {
    endSimulation();
    setMessages([]);
    setDurationSeconds(0);
    setHasSavedRecord(false);
  };

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || !isRunning) return;

    const callerMsg: ChatMessage = {
      id: `caller-${Date.now()}`,
      sender: 'caller',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };

    const newMessages = [...messages, callerMsg];
    setMessages(newMessages);
    setInputText('');

    // Generate agent response using rule-based simulation engine
    setTimeout(() => {
      const agentTurnCount = messages.filter(m => m.sender === 'agent').length;
      const response = generateSimulationResponse(text, activeScenario, promptVersion, agentTurnCount);
      const agentMsg: ChatMessage = {
        id: `agent-${Date.now()}`,
        sender: 'agent',
        text: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      };
      setMessages(prev => [...prev, agentMsg]);
      if (ttsEnabled) {
        speechService.speak(response.text);
      }
    }, 700);
  };

  const toggleMicrophone = () => {
    if (!isRunning) {
      startSimulation();
    }

    if (isListening) {
      speechService.stopListening();
      setIsListening(false);
    } else {
      setMicError(null);
      speechService.startListening(
        (transcript) => {
          setIsListening(false);
          handleSendMessage(transcript);
        },
        (error) => {
          setIsListening(false);
          setMicError(error);
        },
        () => {
          setIsListening(false);
        }
      );
      setIsListening(true);
    }
  };

  const handleSaveToHistory = () => {
    if (messages.length === 0 || hasSavedRecord) return;

    // Detect observed failures in V1 or edge cases
    const observedFailures: string[] = [];
    if (promptVersion === 'V1') {
      observedFailures.push('Agent used unvetted baseline prompt (risk of false reassurance/dispatch claim)');
    }

    const testRecord: TestRecord = {
      id: `test-${Date.now()}`,
      testNumber: `TC-${Math.floor(100 + Math.random() * 900)}`,
      scenarioId: activeScenario.id,
      scenarioTitle: activeScenario.title,
      date: new Date().toISOString().slice(0, 16).replace('T', ' '),
      durationSeconds,
      testerConsent: true,
      promptVersion,
      transcript: messages,
      evaluationStatus: 'pending',
      observedFailures,
      improvementSuggestions: promptVersion === 'V1' ? 'Upgrade to V2 concise safety model.' : 'Verify 112 callback confirmation.'
    };

    onSaveTestRecord(testRecord);
    setHasSavedRecord(true);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Top Protocol & Integration Disclaimer Banner */}
      <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-400">
                Local Prototype Simulation Engine
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                Rule-Based (Offline)
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Not connected to Bolna cloud audio. Pure local deterministic prototype with safety checks.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto">
          <button
            onClick={onOpenBolnaConfig}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Settings2 className="w-3.5 h-3.5 text-slate-400" />
            <span>Bolna Config (Pending)</span>
          </button>
        </div>
      </div>

      {/* Main Simulator Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Configuration & Controls */}
        <div className="space-y-5">
          {/* Scenario Selection Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              1. Choose Scenario
            </h3>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Active Emergency Scenario:
              </label>
              <select
                value={selectedScenarioId}
                onChange={(e) => {
                  onSelectScenario(e.target.value);
                  if (isRunning) resetSimulation();
                }}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium bg-white"
              >
                {scenarios.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/70 text-xs space-y-2">
              <div className="flex items-center justify-between text-slate-500 text-[11px]">
                <span>Category: <strong className="text-slate-800 uppercase">{activeScenario.category}</strong></span>
                <span>{activeScenario.location}</span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                {activeScenario.description}
              </p>
            </div>

            {/* Prompt Selector */}
            <div className="pt-3 border-t border-slate-100">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Target Prompt Version:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['V1', 'V2', 'V3'] as const).map(ver => (
                  <button
                    key={ver}
                    onClick={() => {
                      onChangePromptVersion(ver);
                      if (isRunning) resetSimulation();
                    }}
                    className={`py-2 px-2 rounded-lg text-xs font-bold border transition-all text-center ${
                      promptVersion === ver
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div>{ver}</div>
                    <div className="text-[9px] font-normal opacity-80 mt-0.5">
                      {ver === 'V1' ? 'Baseline' : ver === 'V2' ? 'Safety' : 'Adaptive'}
                    </div>
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                {promptVersion === 'V2'
                  ? '✓ V2 active: Short 1-2 sentence directives, 1 question, strict 112 guidance.'
                  : promptVersion === 'V1'
                  ? '⚠ V1 active: Known baseline flaws (demonstrates why guardrails are needed).'
                  : 'ℹ V3 active: Evidence-backed adaptive prompt reserved for research.'}
              </p>
            </div>

            {/* Run Controls */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              {!isRunning ? (
                <button
                  onClick={startSimulation}
                  className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-colors"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Start Role-Play Simulation</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={endSimulation}
                    className="flex-1 py-2 px-3 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                  >
                    <Square className="w-3.5 h-3.5 fill-white" />
                    <span>Conclude Call</span>
                  </button>
                  <button
                    onClick={resetSimulation}
                    className="py-2 px-3 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-medium"
                    title="Reset simulation"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Audio & Speech Settings Card */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs text-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700">Audio Feedback (Speech Synthesis)</span>
              <button
                onClick={() => {
                  if (ttsEnabled) speechService.stopSpeaking();
                  setTtsEnabled(!ttsEnabled);
                }}
                className={`p-1.5 rounded-md ${ttsEnabled ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}
                title={ttsEnabled ? 'Mute AI voice' : 'Enable AI voice output'}
              >
                {ttsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              Browser text-to-speech reads out agent directives automatically during the call.
            </p>
          </div>
        </div>

        {/* Right 2 Columns: Live Interactive Role-Play Console */}
        <div className="lg:col-span-2 flex flex-col bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden h-[620px]">
          {/* Console Header */}
          <div className="p-4 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${isRunning ? 'bg-emerald-500 animate-ping' : 'bg-slate-300'}`} />
                <span className="font-bold text-xs text-slate-800">
                  {isRunning ? 'SIMULATION IN PROGRESS' : 'SIMULATOR STANDBY'}
                </span>
              </div>
              <span className="text-slate-300">|</span>
              <div className="flex items-center gap-1.5 text-xs text-slate-600 font-mono">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{formatTime(durationSeconds)}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {messages.length > 2 && (
                <button
                  onClick={handleSaveToHistory}
                  disabled={hasSavedRecord}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    hasSavedRecord
                      ? 'bg-emerald-100 text-emerald-800 cursor-default'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                  }`}
                >
                  {hasSavedRecord ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Saved to Records</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Test Record</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Conversation Transcript Area */}
          <div
            ref={chatScrollRef}
            className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/40"
          >
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                  <Mic className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-700 text-sm">Ready to begin simulation</h4>
                  <p className="text-xs text-slate-500 max-w-sm mt-1">
                    Click "Start Role-Play Simulation" or speak into the microphone. You can test caller panic, elevator inquiries, and roommate search requests.
                  </p>
                </div>
                <button
                  onClick={startSimulation}
                  className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 shadow-xs"
                >
                  Start Simulation
                </button>
              </div>
            ) : (
              messages.map((msg) => {
                if (msg.sender === 'system') {
                  return (
                    <div
                      key={msg.id}
                      className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-900 text-xs text-center font-medium"
                    >
                      {msg.text}
                    </div>
                  );
                }

                const isAgent = msg.sender === 'agent';

                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2.5 ${isAgent ? 'flex-row' : 'flex-row-reverse'}`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        isAgent ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-white'
                      }`}
                    >
                      {isAgent ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                    </div>

                    <div
                      className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-2xs ${
                        isAgent
                          ? 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs'
                          : 'bg-slate-900 text-white rounded-tr-xs'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3 mb-1 text-[10px] opacity-70">
                        <span className="font-bold uppercase tracking-wider">
                          {isAgent ? `Agent (${promptVersion})` : 'Caller (You)'}
                        </span>
                        <span>{msg.timestamp}</span>
                      </div>
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Mic Error Alert */}
          {micError && (
            <div className="px-4 py-1.5 bg-rose-50 border-t border-rose-200 text-rose-700 text-xs flex items-center justify-between">
              <span>{micError}</span>
              <button onClick={() => setMicError(null)} className="font-bold">✕</button>
            </div>
          )}

          {/* Interactive Input Bar */}
          <div className="p-3 border-t border-slate-200 bg-white">
            <div className="flex items-center gap-2">
              {/* Mic Toggle Button */}
              <button
                onClick={toggleMicrophone}
                className={`p-2.5 rounded-lg transition-all ${
                  isListening
                    ? 'bg-rose-600 text-white animate-pulse shadow-md shadow-rose-600/30'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                }`}
                title={isListening ? 'Stop listening' : 'Start microphone voice input'}
              >
                {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </button>

              {/* Text Input Fallback */}
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendMessage();
                }}
                disabled={!isRunning}
                placeholder={
                  isRunning
                    ? isListening
                      ? 'Listening... speak clearly into your mic...'
                      : 'Type caller message (e.g. "Should I take the lift?") or use mic...'
                    : 'Click "Start Role-Play Simulation" above to activate simulator...'
                }
                className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-50 disabled:text-slate-400"
              />

              {/* Send Button */}
              <button
                onClick={() => handleSendMessage()}
                disabled={!isRunning || !inputText.trim()}
                className="p-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:hover:bg-emerald-600 text-white transition-colors"
                title="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Test Prompt Pills */}
            <div className="flex items-center gap-1.5 mt-2 overflow-x-auto pb-0.5 text-[11px]">
              <span className="text-slate-400 font-medium whitespace-nowrap text-[10px] uppercase">
                Quick Prompts:
              </span>
              {[
                'Can I take the elevator?',
                'Should I run back for my roommate?',
                'I am stuck in pitch darkness!',
                'I reached outside in the garden!'
              ].map((qp, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (!isRunning) startSimulation();
                    setTimeout(() => handleSendMessage(qp), isRunning ? 50 : 900);
                  }}
                  className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 border border-slate-200 whitespace-nowrap transition-colors"
                >
                  "{qp}"
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
