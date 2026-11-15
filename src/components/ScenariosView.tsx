import React, { useState } from 'react';
import { 
  Flame, 
  Zap, 
  Activity, 
  ShieldAlert, 
  Play, 
  Plus, 
  Edit3, 
  CheckCircle, 
  AlertTriangle,
  Search,
  BookOpen
} from 'lucide-react';
import { Scenario, ScenarioCategory } from '../types';
import { ScenarioModal } from './ScenarioModal';

interface ScenariosViewProps {
  scenarios: Scenario[];
  onSaveScenario: (scenario: Scenario) => void;
  onSelectScenarioForSim: (scenarioId: string) => void;
}

export const ScenariosView: React.FC<ScenariosViewProps> = ({
  scenarios,
  onSaveScenario,
  onSelectScenarioForSim
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingScenario, setEditingScenario] = useState<Scenario | null>(null);

  const filteredScenarios = scenarios.filter(sc => {
    const matchesCat = filterCategory === 'all' || sc.category === filterCategory;
    const matchesSearch = sc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          sc.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const getCategoryBadge = (category: ScenarioCategory) => {
    switch (category) {
      case 'fire':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <Flame className="w-3 h-3 text-rose-600" /> Fire Hazard
          </span>
        );
      case 'power_failure':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Zap className="w-3 h-3 text-amber-600" /> Power Blackout
          </span>
        );
      case 'earthquake':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Activity className="w-3 h-3 text-indigo-600" /> Earthquake
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
            <ShieldAlert className="w-3 h-3" /> Drill
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900">Emergency Training Scenarios</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Preloaded fictional crisis simulations designed to test agent safety boundaries
          </p>
        </div>
        <button
          onClick={() => {
            setEditingScenario(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Scenario</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search scenarios or risks..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Scenarios' },
            { id: 'fire', label: 'Fires' },
            { id: 'power_failure', label: 'Power Failure' },
            { id: 'earthquake', label: 'Earthquake' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterCategory(cat.id)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                filterCategory === cat.id
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Scenarios Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredScenarios.map((sc) => (
          <div
            key={sc.id}
            className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col justify-between hover:border-emerald-500/50 transition-all"
          >
            {/* Top Info Header */}
            <div className="p-5 border-b border-slate-100">
              <div className="flex items-center justify-between gap-2 mb-2">
                {getCategoryBadge(sc.category)}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-medium text-slate-400">{sc.location}</span>
                  <button
                    onClick={() => {
                      setEditingScenario(sc);
                      setIsModalOpen(true);
                    }}
                    className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                    title="Edit scenario"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <h3 className="text-sm font-bold text-slate-900 mb-1">{sc.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-3">{sc.description}</p>

              {/* Caller Script Box */}
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 text-xs">
                <span className="font-bold text-slate-700 flex items-center gap-1.5 mb-1 text-[11px] uppercase tracking-wider">
                  <BookOpen className="w-3.5 h-3.5 text-emerald-600" /> Caller Script:
                </span>
                <p className="italic text-slate-700 leading-relaxed font-sans">
                  "{sc.callerScript}"
                </p>
              </div>
            </div>

            {/* Expected Agent Behaviour & Safety Benchmark */}
            <div className="p-5 space-y-4 flex-1 bg-slate-50/50 text-xs">
              <div>
                <h4 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Expected Agent Behaviour
                </h4>
                <ul className="space-y-1.5 text-slate-600">
                  {sc.expectedAgentBehaviour.map((beh, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-[11px] leading-tight">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span>{beh}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Safety Evaluation Criteria
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {sc.safetyCriteria.map((crit, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200"
                    >
                      {crit}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer with Start Simulation Action */}
            <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Rule engine evaluation ready
              </span>
              <button
                onClick={() => onSelectScenarioForSim(sc.id)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Start Simulation</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      <ScenarioModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={onSaveScenario}
        scenarioToEdit={editingScenario}
      />
    </div>
  );
};
