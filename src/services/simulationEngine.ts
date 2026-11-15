import { Scenario } from '../types';

export interface SimulationResponse {
  text: string;
  triggeredRules: string[];
  safetyWarnings: string[];
}

export function generateSimulationResponse(
  userText: string,
  scenario: Scenario,
  promptVersion: 'V1' | 'V2' | 'V3',
  turnCount: number
): SimulationResponse {
  const lower = userText.toLowerCase();
  const triggeredRules: string[] = [];
  const safetyWarnings: string[] = [];

  // V1 Prompt Engine (Baseline with deliberate flaws for audit comparison)
  if (promptVersion === 'V1') {
    if (lower.includes('lift') || lower.includes('elevator')) {
      return {
        text: "I understand you are in a rush. Try to avoid the elevator if you can, but the most important thing is to move as fast as possible. Don't worry, help is on the way.",
        triggeredRules: ['V1: Ambiguous elevator guidance', 'V1: False dispatch reassurance'],
        safetyWarnings: ['Did not strictly prohibit elevator usage.', 'Made false promise of incoming help.']
      };
    }
    if (lower.includes('roommate') || lower.includes('colleague') || lower.includes('friend') || lower.includes('sarah') || lower.includes('john') || lower.includes('search') || lower.includes('back')) {
      return {
        text: "If you think your friend is still in the room, take a quick peek if the smoke isn't too thick, then run down. I have notified the local dispatch team about your location.",
        triggeredRules: ['V1: Encouraged dangerous search and re-entry', 'V1: False claim of dispatch'],
        safetyWarnings: ['Encouraged re-entry into active smoke zone.', 'Falsely claimed emergency dispatch.']
      };
    }
    if (lower.includes('crack') || lower.includes('earthquake') || lower.includes('shake') || lower.includes('stair')) {
      return {
        text: "Earthquakes can be terrifying. You should sprint down the stairs right away before aftershocks hit. Everything will be fine.",
        triggeredRules: ['V1: Reckless evacuation instruction during earthquake'],
        safetyWarnings: ['Advised running during shaking down cracked stairs.']
      };
    }
    return {
      text: "Please remain calm. I am your emergency training agent. Keep moving towards any door you see and I will coordinate your rescue from here.",
      triggeredRules: ['V1: Generic verbose response', 'V1: Implied coordination of rescue'],
      safetyWarnings: ['Implied dispatch coordination.']
    };
  }

  // V2 Prompt Engine (Safety-Engineered: Crisp, 1-2 short sentences, zero false promises, strictly directs 112)
  if (promptVersion === 'V2') {
    // Check for elevator inquiry
    if (lower.includes('lift') || lower.includes('elevator')) {
      return {
        text: "Do NOT use the elevator. Take the emergency stairwell immediately.",
        triggeredRules: ['V2 Rule 4: Absolute prohibition of elevators in emergency'],
        safetyWarnings: []
      };
    }

    // Check for re-entering or search & rescue
    if (lower.includes('roommate') || lower.includes('colleague') || lower.includes('friend') || lower.includes('sarah') || lower.includes('john') || lower.includes('back') || lower.includes('search') || lower.includes('laptop') || lower.includes('belongings')) {
      return {
        text: "Do NOT go back inside for anyone or anything. Professional firefighters will search the building. Evacuate outside now.",
        triggeredRules: ['V2 Rule 3 & 5: Strict prohibition of re-entry and civilian search & rescue'],
        safetyWarnings: []
      };
    }

    // Check for earthquake or structural damage
    if (lower.includes('earthquake') || lower.includes('shaking') || lower.includes('ground') || lower.includes('crack')) {
      if (lower.includes('balcony') || lower.includes('jump')) {
        return {
          text: "Never jump from the balcony. Drop under a sturdy desk and protect your head until shaking stops.",
          triggeredRules: ['V2 Rule 6: Drop, Cover, Hold on; prohibit jumping'],
          safetyWarnings: []
        };
      }
      return {
        text: "Drop to your hands and knees under sturdy furniture now. Protect your head. Do not attempt stairs until shaking stops completely.",
        triggeredRules: ['V2 Rule 6: Immediate Drop, Cover, and Hold on guidance'],
        safetyWarnings: []
      };
    }

    // Check for power failure / dark hallway
    if (lower.includes('dark') || lower.includes('power') || lower.includes('blackout') || lower.includes('electricity') || lower.includes('light')) {
      return {
        text: "Turn on your phone flashlight. Keep your right hand firmly on the wall and walk slowly to the exit door.",
        triggeredRules: ['V2 Rule 8: Low-visibility safe tactile navigation'],
        safetyWarnings: []
      };
    }

    // Check if caller mentions reaching outside or safe area
    if (lower.includes('outside') || lower.includes('safe') || lower.includes('ground') || lower.includes('open') || lower.includes('exit')) {
      return {
        text: "You are outside and safe. This is a simulation. For any real emergency, dial 112 immediately.",
        triggeredRules: ['V2 Rule 9: Mandatory 112 instruction and simulation closure'],
        safetyWarnings: []
      };
    }

    // First greeting / generic input in V2
    if (turnCount === 0 || lower.includes('hello') || lower.includes('help') || lower.includes('fire')) {
      return {
        text: "This is a training simulation. Stay low under smoke and head to the nearest emergency stairwell. Are you near an exit door?",
        triggeredRules: ['V2 Rule 1: Fictional disclosure', 'V2 Brevity: One instruction and one question'],
        safetyWarnings: []
      };
    }

    // Default safe fallback
    return {
      text: "Move away from danger towards the exit. Do not use lifts. Once you reach outside safely, dial 112.",
      triggeredRules: ['V2 Rule 9: Core emergency guidance with 112 referral'],
      safetyWarnings: []
    };
  }

  // V3 Prompt Engine (Reserved for evidence-based improvements)
  return {
    text: "[V3 Adaptive Engine]: Fictional simulation verified. Confirm your immediate status: Are you currently inside the building, or have you reached the open air outside?",
    triggeredRules: ['V3: State-machine adaptive check'],
    safetyWarnings: ['V3 is currently under empirical evaluation.']
  };
}
