import React from 'react';
import { AlertTriangle, PhoneCall, ShieldAlert } from 'lucide-react';

export const SafetyBanner: React.FC = () => {
  return (
    <div className="bg-amber-500/10 border-b border-amber-500/30 px-4 py-2.5 text-amber-950 dark:text-amber-200">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm font-medium">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
          <span className="font-bold tracking-wide text-amber-900">
            FICTIONAL TRAINING SIMULATION – NOT AN EMERGENCY SERVICE.
          </span>
          <span className="hidden md:inline text-amber-800/80">
            Does not contact or dispatch first responders.
          </span>
        </div>
        <div className="flex items-center gap-2 bg-amber-500/20 px-3 py-1 rounded-full border border-amber-500/40 text-amber-900 font-semibold shadow-xs">
          <PhoneCall className="w-3.5 h-3.5 text-amber-700 animate-bounce" />
          <span>If this is a real emergency, stop the simulation and dial <strong className="text-red-700 text-sm font-extrabold underline decoration-2">112</strong></span>
        </div>
      </div>
    </div>
  );
};
