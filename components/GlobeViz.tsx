
import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import Globe, { GlobeMethods } from 'react-globe.gl';
import { GDPDataPoint, Language } from '../types';
import { TRANSLATIONS } from '../constants';
import * as d3 from 'd3-scale';

interface GlobeVizProps {
  data: GDPDataPoint[];
  onCountrySelect: (country: GDPDataPoint) => void;
  selectedCountry: GDPDataPoint | null;
  language: Language;
}

const GlobeViz: React.FC<GlobeVizProps> = ({ data, onCountrySelect, selectedCountry, language }) => {
  const globeEl = useRef<GlobeMethods | undefined>(undefined);
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [geoJson, setGeoJson] = useState<any>({ features: [] });
  const [hoveredPolygon, setHoveredPolygon] = useState<any | null>(null);

  const t = TRANSLATIONS[language];

  // Color scale for GDP: Low (Blue) -> Medium (Cyan/Green) -> High (Red/Gold)
  const colorScale = useMemo(() => {
    return d3.scaleLinear<string>()
      .domain([0, 500, 2000, 5000, 15000, 25000])
      .range(['#1e1b4b', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444']);
  }, []);

  // Resize handler
  useEffect(() => {
    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch GeoJSON for country borders
  useEffect(() => {
    // Using Low resolution (1:110m) for better performance on most devices
    // High resolution (50m) was causing lag during rotation/drag
    const geoJsonUrl = 'https://raw.githubusercontent.com/vasturiano/react-globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson';

    fetch(geoJsonUrl)
      .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then(countries => {
        setGeoJson(countries);
      })
      .catch(err => {
        console.error("Failed to fetch GeoJSON data", err);
      });
  }, []);

  // Auto-rotate config
  useEffect(() => {
    if (globeEl.current) {
      globeEl.current.controls().autoRotate = true;
      globeEl.current.controls().autoRotateSpeed = 0.5;
      globeEl.current.controls().enableZoom = true;
      globeEl.current.controls().dampingFactor = 0.1;
    }
  }, []);

  // Focus on selected country and stop rotation
  useEffect(() => {
    if (selectedCountry && globeEl.current) {
      globeEl.current.pointOfView({
        lat: selectedCountry.lat,
        lng: selectedCountry.lng,
        altitude: 1.8 
      }, 1500);
      globeEl.current.controls().autoRotate = false;
    }
  }, [selectedCountry]);

  // Merge GDP data into GeoJSON features
  const augmentedGeoJson = useMemo(() => {
    if (!geoJson.features.length || !data.length) return [];

    return geoJson.features.map((feature: any) => {
      let searchCode = feature.properties.ISO_A3;
      const searchName = feature.properties.NAME;
      const adm0 = feature.properties.ADM0_A3;

      // VISUAL ADJUSTMENT: Map Taiwan to China
      // If the geometric feature is Taiwan (TWN), we map it to China's data (CHN)
      if (searchCode === 'TWN' || searchName === 'Taiwan' || adm0 === 'TWN') {
        searchCode = 'CHN';
      }

      // Try to match GDP data to the geometry
      const countryData = data.find(d => 
        d.code === searchCode || 
        d.code === adm0 ||
        d.country === searchName ||
        d.country === feature.properties.NAME_LONG
      );

      return {
        ...feature,
        properties: {
          ...feature.properties,
          gdpData: countryData
        }
      };
    });
  }, [geoJson, data]);

  // Dynamic Styling Functions
  const getPolygonColor = useCallback((d: any) => {
    const countryData = d.properties.gdpData as GDPDataPoint | undefined;
    const isSelected = selectedCountry?.code === countryData?.code;
    const isHovered = hoveredPolygon === d;

    // Highlight states
    if (isSelected) return '#7dd3fc'; // Soft Sky Blue
    if (isHovered) return '#94a3b8'; // Slate 400 (softer gray)

    // Data-driven color
    if (countryData) {
      return colorScale(countryData.gdp);
    }

    // Default for no-data countries
    return '#0f172a'; // Very dark slate
  }, [selectedCountry, hoveredPolygon, colorScale]);

  const getPolygonAltitude = useCallback((d: any) => {
    const countryData = d.properties.gdpData as GDPDataPoint | undefined;
    const isSelected = selectedCountry?.code === countryData?.code;
    const isHovered = hoveredPolygon === d;

    // Base altitude scaling
    let altitude = 0.01; // Default thin layer

    if (countryData) {
      // Calculate altitude based on GDP (square root to dampen extreme differences)
      // Multiplier set to 0.0012 to make GDP thickness visible
      altitude = Math.max(0.01, Math.sqrt(countryData.gdp) * 0.0012);
    }

    // Interaction boosts
    if (isSelected) return altitude + 0.08;
    if (isHovered) return altitude + 0.04;

    return altitude;
  }, [selectedCountry, hoveredPolygon]);

  return (
    <div className="cursor-move relative">
      <Globe
        ref={globeEl}
        width={dimensions.width}
        height={dimensions.height}
        backgroundColor="#000000"
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        
        // Polygons (Countries)
        polygonsData={augmentedGeoJson}
        polygonAltitude={getPolygonAltitude}
        polygonCapColor={getPolygonColor}
        polygonSideColor={() => 'rgba(255, 255, 255, 0.1)'}
        polygonStrokeColor={() => '#333'}
        
        // Hover Tooltip
        polygonLabel={({ properties: d }: any) => {
          const data = d.gdpData as GDPDataPoint;
          return data ? `
            <div style="
              background: rgba(0, 0, 0, 0.85);
              backdrop-filter: blur(8px);
              color: white;
              padding: 12px;
              border-radius: 8px;
              border: 1px solid rgba(255, 255, 255, 0.2);
              font-family: sans-serif;
              box-shadow: 0 10px 25px rgba(0,0,0,0.5);
            ">
              <div style="font-weight: bold; font-size: 16px; margin-bottom: 4px;">${data.country}</div>
              <div style="display: grid; grid-template-columns: auto auto; gap: 4px 12px; font-size: 12px;">
                <span style="color: #94a3b8;">${t.globalRank}:</span>
                <span style="font-family: monospace; font-weight: bold;">#${data.rank}</span>
                <span style="color: #94a3b8;">2024 GDP:</span>
                <span style="color: #34d399; font-family: monospace; font-weight: bold;">$${data.gdp.toLocaleString()} B</span>
                <span style="color: #94a3b8;">${t.growthRate}:</span>
                <span style="color: ${data.growthRate >= 0 ? '#60a5fa' : '#f87171'}; font-family: monospace;">${data.growthRate}%</span>
              </div>
            </div>
          ` : `
            <div style="background: rgba(0,0,0,0.8); color: #aaa; padding: 4px 8px; border-radius: 4px; font-size: 12px;">
              ${d.NAME} (No Data)
            </div>
          `;
        }}
        
        onPolygonHover={setHoveredPolygon}
        onPolygonClick={(d: any) => {
          if (d.properties.gdpData) {
            onCountrySelect(d.properties.gdpData);
          }
        }}
        
        // Animation settings
        polygonsTransitionDuration={300}
        
        // Atmosphere
        atmosphereColor="#3b82f6"
        atmosphereAltitude={0.25}
      />
      
      {/* Instruction Overlay */}
      {!selectedCountry && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 pointer-events-none animate-pulse text-center z-10">
           <p className="text-white/40 text-xs tracking-[0.2em] uppercase font-medium">
             {t.clickToExplore}
           </p>
        </div>
      )}
    </div>
  );
};

export default GlobeViz;
