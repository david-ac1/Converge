'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useUserMigrationState } from '@/hooks/useUserMigrationState';
import PassportSchematic from '@/components/PassportSchematic';
import { getFlagUrl } from '@/lib/flagUtils';

export default function LandingPage() {
  const router = useRouter();
  const { initialize } = useUserMigrationState();
  const [activeCountryIdx, setActiveCountryIdx] = React.useState(0);

  const countries = [
    // TOP 10
    { code: 'sg', name: 'Singapore', nodes: 195, power: 99.4 },
    { code: 'jp', name: 'Japan', nodes: 193, power: 98.5 },
    { code: 'de', name: 'Germany', nodes: 192, power: 97.9 },
    { code: 'fr', name: 'France', nodes: 192, power: 97.9 },
    { code: 'it', name: 'Italy', nodes: 192, power: 97.9 },
    { code: 'es', name: 'Spain', nodes: 192, power: 97.9 },
    { code: 'kr', name: 'South Korea', nodes: 191, power: 97.4 },
    { code: 'fi', name: 'Finland', nodes: 191, power: 97.4 },
    { code: 'at', name: 'Austria', nodes: 190, power: 96.9 },
    { code: 'se', name: 'Sweden', nodes: 190, power: 96.9 },
    // 11-20
    { code: 'gb', name: 'United Kingdom', nodes: 189, power: 96.4 },
    { code: 'us', name: 'USA', nodes: 186, power: 94.8 },
    { code: 'au', name: 'Australia', nodes: 186, power: 94.8 },
    { code: 'nz', name: 'New Zealand', nodes: 186, power: 94.8 },
    { code: 'ae', name: 'UAE', nodes: 185, power: 94.3 },
    { code: 'ch', name: 'Switzerland', nodes: 184, power: 93.8 },
    { code: 'ca', name: 'Canada', nodes: 184, power: 93.8 },
    { code: 'pt', name: 'Portugal', nodes: 187, power: 95.3 },
    { code: 'nl', name: 'Netherlands', nodes: 190, power: 96.9 },
    { code: 'be', name: 'Belgium', nodes: 189, power: 96.4 },
    // 21-30 (MID TIER)
    { code: 'my', name: 'Malaysia', nodes: 182, power: 92.8 },
    { code: 'br', name: 'Brazil', nodes: 170, power: 86.7 },
    { code: 'mx', name: 'Mexico', nodes: 159, power: 81.0 },
    { code: 'ar', name: 'Argentina', nodes: 172, power: 87.7 },
    { code: 'cl', name: 'Chile', nodes: 176, power: 89.7 },
    { code: 'za', name: 'South Africa', nodes: 106, power: 54.0 },
    { code: 'th', name: 'Thailand', nodes: 81, power: 41.3 },
    { code: 'tr', name: 'Turkey', nodes: 119, power: 60.7 },
    { code: 'cn', name: 'China', nodes: 85, power: 43.4 },
    { code: 'in', name: 'India', nodes: 62, power: 31.6 },
    // 31-50 (LOWER TIER)
    { code: 'ng', name: 'Nigeria', nodes: 45, power: 22.9 },
    { code: 'gh', name: 'Ghana', nodes: 67, power: 34.2 },
    { code: 'ke', name: 'Kenya', nodes: 75, power: 38.3 },
    { code: 'eg', name: 'Egypt', nodes: 54, power: 27.6 },
    { code: 'pk', name: 'Pakistan', nodes: 35, power: 17.9 },
    { code: 'bd', name: 'Bangladesh', nodes: 42, power: 21.4 },
    { code: 'et', name: 'Ethiopia', nodes: 47, power: 24.0 },
    { code: 'tz', name: 'Tanzania', nodes: 67, power: 34.2 },
    { code: 'ug', name: 'Uganda', nodes: 67, power: 34.2 },
    { code: 'rw', name: 'Rwanda', nodes: 68, power: 34.7 },
    { code: 'sn', name: 'Senegal', nodes: 65, power: 33.2 },
    { code: 'cm', name: 'Cameroon', nodes: 54, power: 27.6 },
    { code: 'dz', name: 'Algeria', nodes: 55, power: 28.1 },
    { code: 'ma', name: 'Morocco', nodes: 69, power: 35.2 },
    { code: 'tn', name: 'Tunisia', nodes: 72, power: 36.7 },
    { code: 'jo', name: 'Jordan', nodes: 55, power: 28.1 },
    { code: 'lb', name: 'Lebanon', nodes: 49, power: 25.0 },
    { code: 'lk', name: 'Sri Lanka', nodes: 44, power: 22.4 },
    { code: 'np', name: 'Nepal', nodes: 40, power: 20.4 },
    { code: 'af', name: 'Afghanistan', nodes: 28, power: 14.3 },
  ];

  React.useEffect(() => {
    const timer = setInterval(() => {
      setActiveCountryIdx((prev) => (prev + 1) % countries.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [countries.length]);

  const activeCountry = countries[activeCountryIdx];

  const handleInit = (preset?: any) => {
    // Hackathon Scenario: Default to US -> Swiss
    const startState = preset?.start || {
      timestamp: new Date(),
      location: 'Austin, TX, USA',
      profession: 'Senior DevOps Engineer',
      income: 145000,
      skills: ['Kubernetes', 'AWS', 'Python', 'System Architecture'],
      qualifications: ['B.S. Computer Science'],
      familyStatus: 'Single',
      dependencies: 0,
      assets: 52000,
      liabilities: 15000,
      metadata: { citizenship: 'USA', riskTolerance: 'medium' }
    };

    const goalState = preset?.goal || {
      timestamp: new Date(new Date().setFullYear(new Date().getFullYear() + 5)),
      location: 'Zurich, Switzerland',
      profession: 'Cloud Architect',
      income: 160000,
      skills: ['German (B1)', 'European Banking Regulations'],
      qualifications: ['Masters (Optional)'],
      familyStatus: 'Single',
      dependencies: 0,
      assets: 100000,
      liabilities: 0,
      metadata: { targetVisa: 'B Permit / C Settlement', motive: 'Stability & Crypto Industry' }
    };

    initialize('hackathon_user_01', startState, goalState);
    router.push('/dashboard');
  };

  const presets = [
    {
      id: 'asset',
      label: '[01. ASSET_MAP]',
      start: { location: 'Lagos, Nigeria', profession: 'Backend Dev', income: 45000, metadata: { citizenship: 'Nigeria' } },
      goal: { location: 'Lisbon, Portugal', profession: 'Digital Nomad', metadata: { targetVisa: 'D8 Visa' } }
    },
    {
      id: 'passport',
      label: '[02. PASSPORT_LOGIC]',
      start: { location: 'London, UK', profession: 'Asset Manager', income: 250000, metadata: { citizenship: 'UK' } },
      goal: { location: 'Dubai, UAE', profession: 'Fund Manager', metadata: { targetVisa: 'Golden Visa' } }
    },
    {
      id: 'corridor',
      label: '[03. CORRIDOR_SIM]',
      start: { location: 'Toronto, Canada', profession: 'AI Researcher', income: 180000, metadata: { citizenship: 'Canada' } },
      goal: { location: 'Singapore', profession: 'CTO', metadata: { targetVisa: 'ONE Pass' } }
    },
    {
      id: 'terminal',
      label: '[04. TERMINAL]',
      start: { location: 'Mumbai, India', profession: 'Product Designer', income: 65000, metadata: { citizenship: 'India' } },
      goal: { location: 'Vancouver, Canada', profession: 'Design Lead', metadata: { targetVisa: 'Express Entry' } }
    }
  ];

  // Handle nav item click - some go to different pages, others init presets
  const handleNavClick = (preset: typeof presets[0]) => {
    if (preset.id === 'passport') {
      router.push('/passport-logic');
    } else {
      handleInit(preset);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Background Map SVG Overlay (Low opacity) */}
      <div className="fixed inset-0 pointer-events-none opacity-10 z-0">
        <svg className="w-full h-full object-cover" viewBox="0 0 1000 500">
          <path className="animate-draw" d="M150,150 Q400,100 600,200" fill="none" stroke="#00D1FF" strokeWidth="0.5"></path>
          <path className="animate-draw" style={{ animationDelay: '0.5s' }} d="M200,300 Q450,250 800,150" fill="none" stroke="#00D1FF" strokeWidth="1"></path>
          <path className="animate-draw" style={{ animationDelay: '1s' }} d="M600,200 Q700,350 850,300" fill="none" stroke="#00D1FF" strokeWidth="0.5"></path>
          <circle cx="150" cy="150" fill="#00D1FF" r="2"></circle>
          <circle cx="600" cy="200" fill="#00D1FF" r="2"></circle>
          <circle cx="800" cy="150" fill="#00D1FF" r="2"></circle>
          <circle cx="850" cy="300" fill="#00D1FF" r="2"></circle>
        </svg>
      </div>

      {/* Header */}
      <header className="flex items-center justify-between border-b border-primary/10 bg-background/80 backdrop-blur-md px-6 md:px-10 py-4 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="size-7 text-primary">
            <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path clipRule="evenodd" d="M24 4H6V17.3333V30.6667H24V44H42V30.6667V17.3333H24V4Z" fill="currentColor" fillRule="evenodd"></path>
            </svg>
          </div>
          <h2 className="text-xl font-black leading-tight tracking-tighter font-display uppercase tracking-[-0.05em]">CONVERGE</h2>
        </div>
        <nav className="hidden lg:flex items-center gap-10 font-mono text-[10px] tracking-widest">
          {presets.map((p) => (
            <span
              key={p.id}
              onClick={() => handleNavClick(p)}
              className="text-white/60 hover:text-primary transition-colors cursor-pointer"
            >
              {p.label}
            </span>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <span className="font-mono text-[10px] text-primary/70 hidden sm:inline uppercase">status: encrypted_link</span>
          <div className="h-8 w-px bg-primary/20"></div>
          <button className="bg-primary/10 border border-primary/30 text-primary px-3 py-1 rounded-sm font-mono text-[11px] font-bold">
            v1.0.4-STABLE
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative z-10">
        <section className="relative w-full max-w-[1440px] mx-auto px-6 py-12 md:py-24 grid lg:grid-cols-2 gap-16 items-center">
          {/* Coordinate Labels */}
          <div className="absolute top-4 left-6 font-mono text-[9px] text-primary/40 uppercase tracking-widest">[40.7128° N]</div>
          <div className="absolute top-4 right-6 font-mono text-[9px] text-primary/40 uppercase tracking-widest">[74.0060° W]</div>

          {/* Left Column: Text & CTA */}
          <div className="flex flex-col gap-10 relative z-20">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 text-primary font-mono text-[11px] tracking-[0.3em] uppercase">
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse shadow-[0_0_8px_#00D1FF]"></span>
                Mobility_Architecture_v1.0
              </div>
              <h1 className="text-white text-6xl md:text-8xl font-black leading-[0.9] tracking-tighter uppercase font-display">
                Global <br />Mobility <br />is a <span className="text-primary italic">Strategy</span>
              </h1>
              <p className="text-white/40 text-lg font-normal leading-relaxed max-w-[500px] border-l-2 border-primary/20 pl-6">
                Deconstructing global access into granular engineering schematics. Leverage passport power through technical precision and biometric data alignment.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-6 items-center">
              <button
                onClick={() => handleInit()}
                className="w-full sm:w-auto min-w-[240px] bg-primary text-black h-14 px-8 font-mono text-sm font-black tracking-widest hover:bg-white transition-all shadow-[0_0_30px_rgba(0,209,255,0.3)]"
              >
                <span className="cursor-blink">INIT_SIM_v1.0</span>
              </button>
              <div className="flex flex-col font-mono text-[10px] text-white/30 gap-1 uppercase tracking-tighter">
                <span>{'// LOAD_VECTOR: 233ms'}</span>
                <span>{'// BUFFER_SYNC: OK'}</span>
                <span>{'// LAT_COORD: 51.5074 N'}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Schematic */}
          <div className="relative flex items-center justify-center p-4">
            <PassportSchematic />
          </div>
        </section>

        {/* Metric Grid Section */}
        <section className="w-full max-w-[1440px] mx-auto px-6 py-12 relative">
          <div className="absolute bottom-4 left-6 font-mono text-[9px] text-primary/40 uppercase tracking-widest">[34.0522° N]</div>
          <div className="absolute bottom-4 right-6 font-mono text-[9px] text-primary/40 uppercase tracking-widest">[118.2437° W]</div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-0 border border-primary/10">
            {/* Metric 1 */}
            <div className="p-8 border-r border-primary/10 flex flex-col gap-4 group hover:bg-primary/5 transition-colors relative overflow-hidden">
              <div className="flex justify-between items-start">
                <span className="font-mono text-[9px] text-primary/50 tracking-[0.2em]">{activeCountry.code.toUpperCase()}_ACCESS_NODES</span>
                <img
                  src={getFlagUrl(activeCountry.code, 'medium')}
                  alt={activeCountry.name}
                  className="w-6 h-auto opacity-80 group-hover:opacity-100 transition-opacity"
                />
              </div>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-black font-display tracking-tighter transition-all duration-500">
                  {activeCountry.nodes}
                </span>
                <span className="font-mono text-[10px] text-primary mb-1">/COUNTRIES</span>
              </div>
              <div className="h-1 w-full bg-white/5 overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-1000 ease-out"
                  style={{ width: `${(activeCountry.nodes / 195) * 100}%` }}
                ></div>
              </div>
            </div>
            {/* Metric 2 */}
            <div className="p-8 border-r border-primary/10 flex flex-col gap-4 group hover:bg-primary/5 transition-colors">
              <span className="font-mono text-[9px] text-primary/50 tracking-[0.2em]">VISA_FREE_POWER</span>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-black font-display tracking-tighter transition-all duration-500">
                  {activeCountry.power}%
                </span>
              </div>
              <div className="h-1 w-full bg-white/5 overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-1000 ease-out"
                  style={{ width: `${activeCountry.power}%` }}
                ></div>
              </div>
            </div>
            {/* Metric 3 */}
            <div className="p-8 border-r border-primary/10 flex flex-col gap-4 group hover:bg-primary/5 transition-colors">
              <span className="font-mono text-[9px] text-primary/50 tracking-[0.2em]">CALC_LATENCY</span>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-black font-display tracking-tighter">14ms</span>
                <span className="font-mono text-[10px] text-primary mb-1">SYS_OP</span>
              </div>
              <div className="h-1 w-full bg-white/5 overflow-hidden">
                <div className="h-full bg-primary w-[15%]"></div>
              </div>
            </div>
            {/* Metric 4 */}
            <div className="p-8 flex flex-col gap-4 group hover:bg-primary/5 transition-colors">
              <span className="font-mono text-[9px] text-primary/50 tracking-[0.2em]">DATA_STREAM</span>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-black font-display tracking-tighter">LIVE</span>
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse mb-3"></span>
              </div>
              <div className="h-1 w-full bg-white/5 overflow-hidden">
                <div className="h-full bg-primary w-full"></div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-primary/10 bg-black py-12 px-6">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div className="size-5 bg-primary"></div>
              <span className="font-display font-black tracking-widest text-lg">CONVERGE</span>
            </div>
            <p className="font-mono text-[10px] text-white/30 tracking-tight uppercase">GLOBAL_MOBILITY_ENGINEERING_SYSTEMS_2026</p>
          </div>
          <div className="text-right flex flex-col gap-2 items-end">
            <div className="font-mono text-[11px] text-white/60">SYSTEM_STATUS: <span className="text-green-500">OPERATIONAL</span></div>
            <div className="font-mono text-[9px] text-white/20">REL: 2026.Q1_STABLE</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
