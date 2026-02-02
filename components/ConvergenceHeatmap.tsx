'use client';

/**
 * Convergence Heatmap Component
 * Interactive world map showing migration pressure using react-simple-maps
 */

import React, { useState, useEffect, memo } from 'react';
import { motion } from 'framer-motion';
import {
    ComposableMap,
    Geographies,
    Geography,
    ZoomableGroup,
} from 'react-simple-maps';
import { TOP_15_DESTINATIONS, COUNTRY_NAMES, CountryConvergence } from '@/lib/convergenceEngine';

// GeoJSON URL
const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

// ISO Alpha-2 to ISO Numeric mapping for matching with TopoJSON
const ISO_MAPPING: Record<string, string> = {
    'ca': '124', 'us': '840', 'gb': '826', 'de': '276', 'au': '036',
    'fr': '250', 'es': '724', 'pt': '620', 'nl': '528', 'ch': '756',
    'ae': '784', 'sg': '702', 'nz': '554', 'ie': '372', 'se': '752',
    'jp': '392', 'kr': '410', 'it': '380', 'be': '056', 'at': '040',
    'no': '578', 'dk': '208', 'fi': '246', 'cl': '152', 'uy': '858',
    'mx': '484', 'br': '076', 'ar': '032', 'ng': '566', 'in': '356',
    'cn': '156', 'pk': '586', 'bd': '050', 'ph': '608', 'eg': '818',
    'za': '710', 'ke': '404', 'gh': '288', 'ir': '364', 'tr': '792',
    'ru': '643', 'ua': '804', 'pl': '616', 'cz': '203', 'hu': '348',
    'ro': '642', 'gr': '300', 'my': '458', 'th': '764', 'id': '360', 'vn': '704'
};

// Reverse mapping for click handling
const NUMERIC_TO_ISO: Record<string, string> = Object.fromEntries(
    Object.entries(ISO_MAPPING).map(([k, v]) => [v, k])
);

interface ConvergenceHeatmapProps {
    convergenceData: CountryConvergence[];
    selectedCountry: string | null;
    onCountryClick: (countryCode: string) => void;
    originCountry: string;
}

// Color scale based on pressure score
function getPressureColor(score: number): string {
    if (score >= 80) return '#ef4444'; // Red - Critical
    if (score >= 60) return '#f97316'; // Orange - High
    if (score >= 40) return '#eab308'; // Yellow - Moderate
    if (score >= 20) return '#22c55e'; // Green - Low
    return '#10b981'; // Emerald - Very Low
}

function getGlowIntensity(isTop15: boolean, pressureScore: number): string {
    if (!isTop15) return 'none';
    const opacity = 0.3 + (pressureScore / 100) * 0.5;
    return `drop-shadow(0 0 8px rgba(0, 255, 255, ${opacity}))`;
}

const ConvergenceHeatmap: React.FC<ConvergenceHeatmapProps> = memo(({
    convergenceData,
    selectedCountry,
    onCountryClick,
    originCountry
}) => {
    const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
    const [tooltipData, setTooltipData] = useState<{ x: number; y: number; country: CountryConvergence | null }>({ x: 0, y: 0, country: null });

    // Build lookup map for quick access
    const dataMap = new Map<string, CountryConvergence>();
    convergenceData.forEach(c => {
        const numericCode = ISO_MAPPING[c.countryCode];
        if (numericCode) {
            dataMap.set(numericCode, c);
        }
    });

    const handleMouseMove = (e: React.MouseEvent) => {
        setTooltipData(prev => ({ ...prev, x: e.clientX, y: e.clientY }));
    };

    return (
        <div className="relative w-full h-full bg-black/40 border border-primary/20 rounded-lg overflow-hidden" onMouseMove={handleMouseMove}>
            {/* Map Legend */}
            <div className="absolute top-4 left-4 z-10 bg-black/80 border border-primary/30 rounded p-3">
                <div className="font-mono text-[9px] text-primary/60 tracking-widest mb-2">PRESSURE INDEX</div>
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <span className="text-[10px] text-white/70">Critical (80+)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-orange-500" />
                        <span className="text-[10px] text-white/70">High (60-79)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                        <span className="text-[10px] text-white/70">Moderate (40-59)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                        <span className="text-[10px] text-white/70">Low (0-39)</span>
                    </div>
                </div>
            </div>

            {/* Origin Indicator */}
            <div className="absolute top-4 right-4 z-10 bg-black/80 border border-cyan-500/50 rounded px-3 py-2">
                <div className="font-mono text-[9px] text-cyan-400 tracking-widest">ORIGIN PASSPORT</div>
                <div className="text-white font-bold text-sm mt-1">
                    {COUNTRY_NAMES[originCountry] || originCountry.toUpperCase()}
                </div>
            </div>

            {/* Tooltip */}
            {hoveredCountry && tooltipData.country && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="fixed z-50 pointer-events-none bg-black/95 border border-primary/40 rounded-lg p-3 shadow-xl"
                    style={{
                        left: tooltipData.x + 15,
                        top: tooltipData.y + 15,
                        minWidth: '180px'
                    }}
                >
                    <div className="font-bold text-white text-sm mb-1">{tooltipData.country.country}</div>
                    <div className="flex items-center gap-2 mb-2">
                        <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: getPressureColor(tooltipData.country.pressureScore) }}
                        />
                        <span className="text-xs text-white/70">
                            Pressure: <span className="text-white font-mono">{tooltipData.country.pressureScore}</span>/100
                        </span>
                    </div>
                    <div className="text-[10px] text-white/50">
                        Top Origins: {tooltipData.country.topOrigins.slice(0, 3).join(', ')}
                    </div>
                    <div className="text-[10px] text-cyan-400 mt-1">Click for details →</div>
                </motion.div>
            )}

            {/* Map */}
            <ComposableMap
                projection="geoMercator"
                projectionConfig={{
                    scale: 120,
                    center: [10, 30]
                }}
                style={{ width: '100%', height: '100%' }}
            >
                <ZoomableGroup>
                    <Geographies geography={GEO_URL}>
                        {({ geographies }) =>
                            geographies.map((geo) => {
                                const geoId = geo.id;
                                const countryData = dataMap.get(geoId);
                                const isoCode = NUMERIC_TO_ISO[geoId];
                                const isTop15 = isoCode && TOP_15_DESTINATIONS.includes(isoCode);
                                const isSelected = selectedCountry === isoCode;
                                const isHovered = hoveredCountry === geoId;
                                const isOrigin = isoCode === originCountry;

                                let fillColor = '#1a1a2e'; // Default dark
                                if (countryData) {
                                    fillColor = getPressureColor(countryData.pressureScore);
                                } else if (isOrigin) {
                                    fillColor = '#06b6d4'; // Cyan for origin
                                }

                                return (
                                    <Geography
                                        key={geo.rsmKey}
                                        geography={geo}
                                        onMouseEnter={() => {
                                            setHoveredCountry(geoId);
                                            if (countryData) {
                                                setTooltipData(prev => ({ ...prev, country: countryData }));
                                            }
                                        }}
                                        onMouseLeave={() => {
                                            setHoveredCountry(null);
                                            setTooltipData(prev => ({ ...prev, country: null }));
                                        }}
                                        onClick={() => {
                                            if (isoCode) onCountryClick(isoCode);
                                        }}
                                        style={{
                                            default: {
                                                fill: fillColor,
                                                stroke: isTop15 ? '#00ffff' : '#333',
                                                strokeWidth: isTop15 ? 0.8 : 0.3,
                                                outline: 'none',
                                                filter: isTop15 ? getGlowIntensity(true, countryData?.pressureScore || 50) : 'none',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease'
                                            },
                                            hover: {
                                                fill: isOrigin ? '#22d3ee' : fillColor,
                                                stroke: '#00ffff',
                                                strokeWidth: 1,
                                                outline: 'none',
                                                filter: 'drop-shadow(0 0 10px rgba(0, 255, 255, 0.6))',
                                                cursor: 'pointer'
                                            },
                                            pressed: {
                                                fill: '#0ea5e9',
                                                stroke: '#00ffff',
                                                strokeWidth: 1.5,
                                                outline: 'none'
                                            }
                                        }}
                                    />
                                );
                            })
                        }
                    </Geographies>
                </ZoomableGroup>
            </ComposableMap>

            {/* Glow Effect Overlay for Top 15 */}
            <div className="absolute inset-0 pointer-events-none">
                <svg className="w-full h-full opacity-20">
                    <defs>
                        <filter id="glow">
                            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>
                </svg>
            </div>
        </div>
    );
});

ConvergenceHeatmap.displayName = 'ConvergenceHeatmap';

export default ConvergenceHeatmap;
