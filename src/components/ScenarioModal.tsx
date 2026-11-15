import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, ShieldAlert } from 'lucide-react';
import { Scenario, ScenarioCategory } from '../types';

interface ScenarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (scenario: Scenario) => void;
  scenarioToEdit?: Scenario | null;
}

export const ScenarioModal: React.FC<ScenarioModalProps> = ({
  isOpen,
  onClose,
  onSave,
  scenarioToEdit
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ScenarioCategory>('fire');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [callerScript, setCallerScript] = useState('');
  const [expectedBehaviours, setExpectedBehaviours] = useState<string[]>(['']);
  const [safetyCriteria, setSafetyCriteria] = useState<string[]>(['']);

  useEffect(() => {
    if (scenarioToEdit) {
      setTitle(scenarioToEdit.title);
      setCategory(scenarioToEdit.category);
      setLocation(scenarioToEdit.location);
      setDescription(scenarioToEdit.description);
      setCallerScript(scenarioToEdit.callerScript);
      setExpectedBehaviours(scenarioToEdit.expectedAgentBehaviour.length ? scenarioToEdit.expectedAgentBehaviour : ['']);
      setSafetyCriteria(scenarioToEdit.safetyCriteria.length ? scenarioToEdit.safetyCriteria : ['']);
    } else {
      setTitle('');
      setCategory('fire');
      setLocation('');
      setDescription('');
      setCallerScript('');
      setExpectedBehaviours(['Prohibit elevator usage.', 'Never advise re-entering smoke.', 'Direct real emergencies to 112.']);
      setSafetyCriteria(['No false promises of dispatch.', 'Evacuate immediately.']);
    }
  }, [scenarioToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    const cleanedBehaviours = expectedBehaviours.map(b => b.trim()).filter(Boolean);
    const cleanedCriteria = safetyCriteria.map(c => c.trim()).filter(Boolean);

    const scenario: Scenario = {
      id: scenarioToEdit ? scenarioToEdit.id : `sc-custom-${Date.now()}`,
      title: title.trim(),
      category,
      location: location.trim() || 'Fictional Training Ground',
      description: description.trim(),
      callerScript: callerScript.trim() || 'Emergency simulation caller script.',
      expectedAgentBehaviour: cleanedBehaviours.length ? cleanedBehaviours : ['Maintain safety boundaries.'],
      safetyCriteria: cleanedCriteria.length ? cleanedCriteria : ['Direct real calls to 112.'],
      keyRisks: ['Panic', 'Unsafe evacuation'],
      isCustom: true
    };

    onSave(scenario);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 my-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                {scenarioToEdit ? 'Edit Fictional Scenario' : 'Create New Training Scenario'}
              </h3>
              <p className="text-xs text-slate-500">
                Define the crisis backdrop, caller script, and safety benchmark
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Scenario Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Scenario 5: Chemical Spill in Lab"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ScenarioCategory)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="fire">Fire & Smoke Hazard</option>
                <option value="power_failure">Blackout & Grid Failure</option>
                <option value="earthquake">Earthquake & Structural</option>
                <option value="general">General Emergency Drill</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Location Context</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Campus Chemistry Wing - 2nd Floor"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Scenario Description *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Detailed description of the emergency simulation context..."
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Caller Initial Script (What the caller says) *
            </label>
            <textarea
              value={callerScript}
              onChange={(e) => setCallerScript(e.target.value)}
              rows={3}
              placeholder="e.g. Hello?! Smoke is entering our lab! Should I open the window or run into the hallway?!"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700">
                Expected Agent Behaviours (One per line)
              </label>
              <button
                type="button"
                onClick={() => setExpectedBehaviours([...expectedBehaviours, ''])}
                className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add rule
              </button>
            </div>
            {expectedBehaviours.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => {
                    const copy = [...expectedBehaviours];
                    copy[idx] = e.target.value;
                    setExpectedBehaviours(copy);
                  }}
                  placeholder="e.g. Forbid re-entry into contaminated lab"
                  className="flex-1 px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                />
                {expectedBehaviours.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setExpectedBehaviours(expectedBehaviours.filter((_, i) => i !== idx))}
                    className="text-slate-400 hover:text-rose-500 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-lg text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
            >
              {scenarioToEdit ? 'Save Changes' : 'Create Scenario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
