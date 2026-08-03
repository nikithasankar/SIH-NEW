import React, { useState } from 'react';

export interface FilterState {
  searchQuery: string;
  minScoutScore: number | null; // e.g. 80+
  // Basic
  gender: string;
  minAge: number | null;
  maxAge: number | null;
  // Sports
  sport: string;
  position: string;
  experienceLevel: string;
  dominantHand: string;
  dominantLeg: string;
  // Location
  state: string;
  district: string;
  school: string;
  // Performance
  minFormAccuracy: number | null;
  minConsistency: number | null;
  minStrength: number | null;
  minSpeed: number | null;
}

interface Props {
  filters: FilterState;
  onChange: (updated: FilterState) => void;
  onReset: () => void;
}

export const ScoutFilters: React.FC<Props> = ({ filters, onChange, onReset }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleTextChange = (key: keyof FilterState, val: string) => {
    onChange({ ...filters, [key]: val });
  };

  const handleNumChange = (key: keyof FilterState, val: string) => {
    const num = val === '' ? null : Number(val);
    onChange({ ...filters, [key]: num });
  };

  const sportsOptions = ['All', 'Football', 'Basketball', 'Athletics', 'Badminton', 'Cricket', 'Tennis', 'Swimming', 'Volleyball'];
  const experienceOptions = ['All', 'Junior', 'State', 'National', 'Pro'];

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Search Bar + Toggle Filter Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => handleTextChange('searchQuery', e.target.value)}
            placeholder="Search by Athlete Name, ID (ATH-1001), or Email..."
            className="w-full bg-surface border border-[var(--glass-border)] rounded-2xl px-5 py-3 text-sm text-white placeholder-muted outline-none focus:border-[var(--color-primary)] transition-colors"
          />
          {filters.searchQuery && (
            <button
              onClick={() => handleTextChange('searchQuery', '')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-white text-xs font-mono"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Filter: Scout Score 80+ */}
          <button
            onClick={() => onChange({ ...filters, minScoutScore: filters.minScoutScore === 80 ? null : 80 })}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold font-mono transition-all border ${
              filters.minScoutScore === 80
                ? 'bg-amber-400 text-black border-amber-400 shadow-sm'
                : 'bg-surface text-muted hover:text-white border-[var(--glass-border)]'
            }`}
          >
            🏆 Scout Score 80+ {filters.minScoutScore === 80 ? '✓' : ''}
          </button>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 border transition-all ${
              isOpen || Object.values(filters).some((v) => v !== '' && v !== null)
                ? 'bg-primary text-black border-primary'
                : 'glass-card text-white hover:border-primary/40'
            }`}
          >
            <span>🎛️</span>
            <span>All Category Filters</span>
            <span>{isOpen ? '▲' : '▼'}</span>
          </button>

          {(filters.minScoutScore || Object.values(filters).some((v) => v !== '' && v !== null)) && (
            <button
              onClick={onReset}
              className="px-3 py-2.5 rounded-2xl text-xs font-semibold text-danger hover:bg-rose-500/10 transition-colors"
            >
              Reset All
            </button>
          )}
        </div>
      </div>

      {/* Expandable Advanced Multi-Category Filters Drawer */}
      {isOpen && (
        <div className="glass-card p-6 border border-primary/30 animate-slide-up space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--glass-border)]">
            <h4 className="font-bold text-sm text-white flex items-center gap-2">
              <span>🎯</span> Multi-Category Talent Search Filters
            </h4>
            <span className="text-xs text-muted font-mono">18 Metric Filters</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* 1. Basic Filters */}
            <div className="space-y-3">
              <span className="text-xs font-mono font-bold text-primary uppercase block tracking-wider">
                👤 Basic Filters
              </span>

              <div>
                <label className="text-[11px] text-muted block mb-1">Gender</label>
                <select
                  value={filters.gender}
                  onChange={(e) => handleTextChange('gender', e.target.value)}
                  className="w-full bg-surface border border-[var(--glass-border)] rounded-xl px-3 py-2 text-xs text-white outline-none"
                >
                  <option value="">All Genders</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-muted block mb-1">Min Age</label>
                  <input
                    type="number"
                    value={filters.minAge ?? ''}
                    onChange={(e) => handleNumChange('minAge', e.target.value)}
                    placeholder="15"
                    className="w-full bg-surface border border-[var(--glass-border)] rounded-xl px-3 py-2 text-xs text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-muted block mb-1">Max Age</label>
                  <input
                    type="number"
                    value={filters.maxAge ?? ''}
                    onChange={(e) => handleNumChange('maxAge', e.target.value)}
                    placeholder="25"
                    className="w-full bg-surface border border-[var(--glass-border)] rounded-xl px-3 py-2 text-xs text-white outline-none"
                  />
                </div>
              </div>
            </div>

            {/* 2. Sports Filters */}
            <div className="space-y-3">
              <span className="text-xs font-mono font-bold text-amber-400 uppercase block tracking-wider">
                🏅 Sports Filters
              </span>

              <div>
                <label className="text-[11px] text-muted block mb-1">Sport</label>
                <select
                  value={filters.sport}
                  onChange={(e) => handleTextChange('sport', e.target.value)}
                  className="w-full bg-surface border border-[var(--glass-border)] rounded-xl px-3 py-2 text-xs text-white outline-none"
                >
                  {sportsOptions.map((s) => (
                    <option key={s} value={s === 'All' ? '' : s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] text-muted block mb-1">Experience Level</label>
                <select
                  value={filters.experienceLevel}
                  onChange={(e) => handleTextChange('experienceLevel', e.target.value)}
                  className="w-full bg-surface border border-[var(--glass-border)] rounded-xl px-3 py-2 text-xs text-white outline-none"
                >
                  {experienceOptions.map((e) => (
                    <option key={e} value={e === 'All' ? '' : e}>
                      {e}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 3. Location Filters */}
            <div className="space-y-3">
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase block tracking-wider">
                📍 Location Filters
              </span>

              <div>
                <label className="text-[11px] text-muted block mb-1">State / Province</label>
                <input
                  type="text"
                  value={filters.state}
                  onChange={(e) => handleTextChange('state', e.target.value)}
                  placeholder="e.g. Delhi, Karnataka, Maharashtra"
                  className="w-full bg-surface border border-[var(--glass-border)] rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] text-muted block mb-1">District / Academy</label>
                <input
                  type="text"
                  value={filters.district}
                  onChange={(e) => handleTextChange('district', e.target.value)}
                  placeholder="e.g. Bengaluru Urban, DPS, Academy"
                  className="w-full bg-surface border border-[var(--glass-border)] rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>
            </div>

            {/* 4. Performance Filters */}
            <div className="space-y-3">
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase block tracking-wider">
                📊 Performance Filters
              </span>

              <div>
                <label className="text-[11px] text-muted block mb-1">Min Form Accuracy %</label>
                <input
                  type="number"
                  value={filters.minFormAccuracy ?? ''}
                  onChange={(e) => handleNumChange('minFormAccuracy', e.target.value)}
                  placeholder="e.g. 85"
                  className="w-full bg-surface border border-[var(--glass-border)] rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] text-muted block mb-1">Min Consistency Score %</label>
                <input
                  type="number"
                  value={filters.minConsistency ?? ''}
                  onChange={(e) => handleNumChange('minConsistency', e.target.value)}
                  placeholder="e.g. 90"
                  className="w-full bg-surface border border-[var(--glass-border)] rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
