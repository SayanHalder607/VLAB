import React from 'react';
import type { ComponentInstance } from '../types';
import { getSchematicDimensions, getSchematicPinCoords } from '../utils/schematicLayout';
import { COMPONENT_DEFINITIONS } from '../utils/componentDefinitions';

interface ComponentRendererProps {
  instance: ComponentInstance;
  viewMode: 'breadboard' | 'schematic';
  isPinActive: (pinId: string) => boolean;
  getPinVoltage?: (pinId: string) => number;
  sensorValues?: Record<string, any>;
  hoveredPinId?: string;
}

// Helper for resistor band colors
const getResistorBands = (ohms: number = 220): string[] => {
  if (ohms === 220) return ['#dc2626', '#dc2626', '#78350f']; // Red, Red, Brown
  if (ohms === 1000) return ['#78350f', '#000000', '#dc2626']; // Brown, Black, Red
  if (ohms === 4700) return ['#eab308', '#6b21a8', '#dc2626']; // Yellow, Violet, Red
  if (ohms === 10000) return ['#78350f', '#000000', '#d97706']; // Brown, Black, Orange
  if (ohms === 100000) return ['#78350f', '#000000', '#eab308']; // Brown, Black, Yellow
  
  // Default fallback bands
  return ['#78350f', '#dc2626', '#78350f'];
};

export const ComponentSVGs: React.FC<ComponentRendererProps> = ({
  instance,
  viewMode,
  isPinActive,
  getPinVoltage,
  sensorValues = {},
  hoveredPinId,
}) => {
  const { type, name, properties } = instance;
  const isSchematic = viewMode === 'schematic';

  // Check if LED is ON
  let isLedOn = false;
  if (type === 'led') {
    const ledColor = properties.color || 'red';
    const forwardVoltages: Record<string, number> = {
      red: 1.8,
      green: 2.0,
      blue: 3.0,
      yellow: 2.0,
      white: 3.0,
    };
    const fv = forwardVoltages[ledColor] || 1.8;
    const anodeVolt = getPinVoltage ? getPinVoltage('anode') : (isPinActive('anode') ? 5.0 : 0.0);
    const cathodeVolt = getPinVoltage ? getPinVoltage('cathode') : (isPinActive('cathode') ? 5.0 : 0.0);
    isLedOn = (anodeVolt - cathodeVolt) >= fv;
  }
  
  // Motor speeds
  let isMotorSpinning = false;
  if (type === 'dc_motor') {
    isMotorSpinning = isPinActive('t1') || isPinActive('t2');
  } else if (type === 'l298n') {
    isMotorSpinning = isPinActive('out1') || isPinActive('out2');
  }

  // Buzzer active
  const isBuzzerActive = type === 'buzzer' && (isPinActive('positive'));

  // Relay switch active
  const isRelayOn = type === 'relay' && (isPinActive('in') || properties.state);

  // Render Schematic view symbols
  if (isSchematic) {
    switch (type) {
      case 'arduino':
      case 'raspberry_pi': {
        const dim = getSchematicDimensions(type);
        const meta = COMPONENT_DEFINITIONS[type];
        return (
          <g>
            {/* Block Symbol */}
            <rect width={dim.width} height={dim.height} fill="#0f172a" stroke="#38bdf8" strokeWidth={2.5} rx={6} />
            <text x={dim.width / 2} y={22} fill="#38bdf8" fontSize={11} fontWeight="bold" textAnchor="middle">
              {type === 'arduino' ? 'ARDUINO UNO' : 'RASPBERRY PI PICO'}
            </text>
            <line x1={8} y1={30} x2={dim.width - 8} y2={30} stroke="#334155" strokeWidth={1.5} />
            
            {/* Draw Pin Ticks and Names inside the block */}
            {meta && meta.pins.map(p => {
              const pCoords = getSchematicPinCoords(type, p.id);
              const isLeft = pCoords.x < dim.width / 2;
              return (
                <g key={p.id}>
                  {/* Pin Tick line */}
                  <line
                    x1={pCoords.x}
                    y1={pCoords.y}
                    x2={isLeft ? pCoords.x + 8 : pCoords.x - 8}
                    y2={pCoords.y}
                    stroke="#475569"
                    strokeWidth={1.5}
                  />
                  {/* Pin Name Label */}
                  <text
                    x={isLeft ? pCoords.x + 12 : pCoords.x - 12}
                    y={pCoords.y + 3}
                    fill="#94a3b8"
                    fontSize={7.5}
                    fontWeight="semibold"
                    textAnchor={isLeft ? "start" : "end"}
                  >
                    {p.name}
                  </text>
                </g>
              );
            })}
          </g>
        );
      }

      case 'breadboard':
        // Hide breadboard in schematic view
        return null;

      case 'led':
        return (
          <g>
            {/* LED Diode Symbol */}
            <g>
              {/* Triangle pointing right */}
              <polygon points="15,10 27,20 15,30" fill="none" stroke="#f43f5e" strokeWidth={2} />
              {/* Vertical bar */}
              <line x1={27} y1={10} x2={27} y2={30} stroke="#f43f5e" strokeWidth={2} />
              {/* Horizontal lead lines */}
              <line x1={0} y1={20} x2={15} y2={20} stroke="#475569" strokeWidth={1.5} />
              <line x1={27} y1={20} x2={40} y2={20} stroke="#475569" strokeWidth={1.5} />
              {/* Outward light arrows */}
              <line x1={18} y1={8} x2={24} y2={2} stroke="#f43f5e" strokeWidth={1.2} />
              <polygon points="24,2 21,3 23,5" fill="#f43f5e" />
              <line x1={23} y1={12} x2={29} y2={6} stroke="#f43f5e" strokeWidth={1.2} />
              <polygon points="29,6 26,7 28,9" fill="#f43f5e" />
            </g>
            <text x={20} y={38} fill="#64748b" fontSize={7.5} textAnchor="middle" fontWeight="semibold">LED</text>
          </g>
        );

      case 'resistor':
        return (
          <g>
            {/* Resistor rectangle symbol */}
            <rect x={12} y={5} width={36} height={10} fill="none" stroke="#fb923c" strokeWidth={2} />
            <line x1={0} y1={10} x2={12} y2={10} stroke="#475569" strokeWidth={1.5} />
            <line x1={48} y1={10} x2={60} y2={10} stroke="#475569" strokeWidth={1.5} />
            <text x={30} y={24} fill="#fb923c" fontSize={7.5} fontWeight="semibold" textAnchor="middle">
              R ({properties.resistance || 220}Ω)
            </text>
          </g>
        );

      case 'push_button':
        return (
          <g>
            {/* Switch symbol */}
            <line x1={0} y1={20} x2={12} y2={20} stroke="#38bdf8" strokeWidth={1.5} />
            <line x1={28} y1={20} x2={40} y2={20} stroke="#38bdf8" strokeWidth={1.5} />
            <line x1={12} y1={20} x2={28} y2={12} stroke="#38bdf8" strokeWidth={2} />
            <circle cx={12} cy={20} r={2} fill="#38bdf8" />
            <circle cx={28} cy={20} r={2} fill="#38bdf8" />
            {/* Push button shaft indicator */}
            <line x1={20} y1={16} x2={20} y2={8} stroke="#475569" strokeWidth={1} strokeDasharray="2,2" />
            <rect x={16} y={5} width={8} height={3} fill="#475569" />
            <text x={20} y={35} fill="#64748b" fontSize={7.5} fontWeight="semibold" textAnchor="middle">SW</text>
          </g>
        );

      case 'buzzer':
        return (
          <g>
            {/* Buzzer symbol */}
            <path d="M 10 25 L 10 10 L 40 10 L 40 25" fill="none" stroke="#a855f7" strokeWidth={2} />
            <path d="M 5 25 L 45 25 L 45 30 L 5 30 Z" fill="#a855f7" />
            <line x1={15} y1={30} x2={15} y2={45} stroke="#475569" strokeWidth={1.5} />
            <line x1={35} y1={30} x2={35} y2={45} stroke="#475569" strokeWidth={1.5} />
            <text x={25} y={45} fill="#a855f7" fontSize={7.5} fontWeight="semibold" textAnchor="middle">LS</text>
          </g>
        );

      case 'potentiometer':
        return (
          <g>
            {/* Resistor body */}
            <rect x={10} y={15} width={40} height={10} fill="none" stroke="#fb923c" strokeWidth={2} />
            <line x1={0} y1={20} x2={10} y2={20} stroke="#475569" strokeWidth={1.5} />
            <line x1={50} y1={20} x2={60} y2={20} stroke="#475569" strokeWidth={1.5} />
            {/* Wiper arrow */}
            <path d="M 30 35 L 30 29" fill="none" stroke="#fb923c" strokeWidth={1.5} />
            <polygon points="30,25 27,30 33,30" fill="#fb923c" />
            <text x={30} y={10} fill="#fb923c" fontSize={7.5} fontWeight="semibold" textAnchor="middle">POT</text>
          </g>
        );

      case 'capacitor':
        return (
          <g>
            {/* Two parallel plates */}
            <line x1={16} y1={10} x2={16} y2={30} stroke="#38bdf8" strokeWidth={2.5} />
            <line x1={24} y1={10} x2={24} y2={30} stroke="#38bdf8" strokeWidth={2.5} />
            <line x1={0} y1={20} x2={16} y2={20} stroke="#475569" strokeWidth={1.5} />
            <line x1={24} y1={20} x2={40} y2={20} stroke="#475569" strokeWidth={1.5} />
            <text x={20} y={8} fill="#38bdf8" fontSize={7.5} fontWeight="semibold" textAnchor="middle">C</text>
          </g>
        );

      case 'slide_switch':
        return (
          <g>
            <circle cx={10} cy={15} r={2} fill="#38bdf8" />
            <circle cx={25} cy={25} r={2} fill="#38bdf8" />
            <circle cx={40} cy={15} r={2} fill="#38bdf8" />
            <line x1={0} y1={15} x2={10} y2={15} stroke="#475569" strokeWidth={1.5} />
            <line x1={25} y1={25} x2={25} y2={40} stroke="#475569" strokeWidth={1.5} />
            <line x1={40} y1={15} x2={50} y2={15} stroke="#475569" strokeWidth={1.5} />
            {/* Switch arm toggling visual position */}
            <line x1={25} y1={25} x2={10} y2={16} stroke="#38bdf8" strokeWidth={2.5} />
            <text x={25} y={10} fill="#38bdf8" fontSize={7.5} fontWeight="semibold" textAnchor="middle">SW</text>
          </g>
        );

      case 'battery_9v':
      case 'battery_coin':
      case 'battery_1_5v':
        return (
          <g>
            {/* DC Voltage Source Schematic Symbol */}
            {/* Alternating long and short lines */}
            <line x1={20} y1={10} x2={20} y2={30} stroke="#22c55e" strokeWidth={2.5} />
            <line x1={26} y1={15} x2={26} y2={25} stroke="#22c55e" strokeWidth={1.5} />
            <line x1={32} y1={10} x2={32} y2={30} stroke="#22c55e" strokeWidth={2.5} />
            <line x1={38} y1={15} x2={38} y2={25} stroke="#22c55e" strokeWidth={1.5} />
            
            <line x1={0} y1={20} x2={20} y2={20} stroke="#475569" strokeWidth={1.5} />
            <line x1={38} y1={20} x2={60} y2={20} stroke="#475569" strokeWidth={1.5} />
            
            <text x={12} y={12} fill="#22c55e" fontSize={8} fontWeight="bold">+</text>
            <text x={48} y={12} fill="#64748b" fontSize={8} fontWeight="bold">-</text>
            <text x={30} y={38} fill="#22c55e" fontSize={7.5} fontWeight="semibold" textAnchor="middle">
              {type === 'battery_9v' ? '9V' : type === 'battery_coin' ? '3V' : '1.5V'}
            </text>
          </g>
        );

      case 'npn_transistor':
        return (
          <g>
            {/* BJT NPN schematic symbol */}
            <circle cx={25} cy={25} r={20} fill="none" stroke="#a855f7" strokeWidth={2} />
            {/* Base line */}
            <line x1={15} y1={15} x2={15} y2={35} stroke="#a855f7" strokeWidth={3} />
            <line x1={0} y1={25} x2={15} y2={25} stroke="#475569" strokeWidth={1.5} />
            {/* Collector line */}
            <line x1={15} y1={20} x2={35} y2={10} stroke="#a855f7" strokeWidth={1.8} />
            <line x1={35} y1={10} x2={35} y2={0} stroke="#475569" strokeWidth={1.5} />
            {/* Emitter line */}
            <line x1={15} y1={30} x2={35} y2={40} stroke="#a855f7" strokeWidth={1.8} />
            <line x1={35} y1={40} x2={35} y2={50} stroke="#475569" strokeWidth={1.5} />
            {/* NPN Arrow on Emitter */}
            <polygon points="35,40 27,34 32,32" fill="#a855f7" />
            <text x={42} y={28} fill="#a855f7" fontSize={7.5} fontWeight="semibold">Q</text>
          </g>
        );

      case 'diode':
        return (
          <g>
            {/* Diode triangle + vertical line */}
            <polygon points="20,10 32,15 20,20" fill="none" stroke="#f43f5e" strokeWidth={2} />
            <line x1={32} y1={10} x2={32} y2={20} stroke="#f43f5e" strokeWidth={2} />
            <line x1={0} y1={15} x2={20} y2={15} stroke="#475569" strokeWidth={1.5} />
            <line x1={32} y1={15} x2={60} y2={15} stroke="#475569" strokeWidth={1.5} />
            <text x={30} y={28} fill="#f43f5e" fontSize={7.5} fontWeight="semibold" textAnchor="middle">D</text>
          </g>
        );

      case 'photoresistor':
        return (
          <g>
            {/* Resistor symbol with light arrows pointing down at it */}
            <rect x={15} y={10} width={30} height={10} fill="none" stroke="#eab308" strokeWidth={2} />
            <line x1={0} y1={15} x2={15} y2={15} stroke="#475569" strokeWidth={1.5} />
            <line x1={45} y1={15} x2={60} y2={15} stroke="#475569" strokeWidth={1.5} />
            {/* Inward light arrows */}
            <line x1={20} y1={4} x2={26} y2={9} stroke="#eab308" strokeWidth={1} />
            <polygon points="26,9 22,8 24,6" fill="#eab308" />
            <line x1={28} y1={4} x2={34} y2={9} stroke="#eab308" strokeWidth={1} />
            <polygon points="34,9 30,8 32,6" fill="#eab308" />
            <text x={30} y={27} fill="#eab308" fontSize={7} fontWeight="semibold" textAnchor="middle">LDR</text>
          </g>
        );

      case 'led_rgb':
        return (
          <g>
            {/* Three diodes in one symbol */}
            <rect x={10} y={5} width={40} height={40} fill="none" stroke="#ef4444" strokeWidth={2} rx={4} />
            <text x={30} y={26} fill="#ef4444" fontSize={9} fontWeight="bold" textAnchor="middle">RGB</text>
            <text x={15} y={14} fill="#f87171" fontSize={6}>R</text>
            <text x={30} y={14} fill="#4ade80" fontSize={6}>G</text>
            <text x={45} y={14} fill="#60a5fa" fontSize={6}>B</text>
          </g>
        );

      case 'gate_and':
        return (
          <g>
            <path d="M 20 10 L 35 10 A 15 15 0 0 1 35 40 L 20 40 Z" fill="#0f172a" stroke="#38bdf8" strokeWidth={2} />
            <line x1={10} y1={15} x2={20} y2={15} stroke="#475569" strokeWidth={1.5} />
            <line x1={10} y1={35} x2={20} y2={35} stroke="#475569" strokeWidth={1.5} />
            <line x1={50} y1={25} x2={60} y2={25} stroke="#475569" strokeWidth={1.5} />
            <text x={28} y={29} fill="#38bdf8" fontSize={9} fontWeight="bold" textAnchor="middle">&amp;</text>
          </g>
        );
      case 'gate_or':
        return (
          <g>
            <path d="M 18 10 Q 28 10 32 10 Q 48 25 32 40 Q 28 40 18 40 Q 23 25 18 10" fill="#0f172a" stroke="#38bdf8" strokeWidth={2} />
            <line x1={10} y1={15} x2={21} y2={15} stroke="#475569" strokeWidth={1.5} />
            <line x1={10} y1={35} x2={21} y2={35} stroke="#475569" strokeWidth={1.5} />
            <line x1={42} y1={25} x2={60} y2={25} stroke="#475569" strokeWidth={1.5} />
            <text x={28} y={28} fill="#38bdf8" fontSize={7} fontWeight="bold" textAnchor="middle">OR</text>
          </g>
        );
      case 'gate_not':
        return (
          <g>
            <polygon points="18,10 38,20 18,30" fill="#0f172a" stroke="#38bdf8" strokeWidth={2} />
            <circle cx={41} cy={20} r={3} fill="#0f172a" stroke="#38bdf8" strokeWidth={2} />
            <line x1={10} y1={20} x2={18} y2={20} stroke="#475569" strokeWidth={1.5} />
            <line x1={44} y1={20} x2={50} y2={20} stroke="#475569" strokeWidth={1.5} />
          </g>
        );
      case 'gate_xor':
        return (
          <g>
            <path d="M 14 10 Q 19 25 14 40" fill="none" stroke="#38bdf8" strokeWidth={2} />
            <path d="M 18 10 Q 28 10 32 10 Q 48 25 32 40 Q 28 40 18 40 Q 23 25 18 10" fill="#0f172a" stroke="#38bdf8" strokeWidth={2} />
            <line x1={10} y1={15} x2={21} y2={15} stroke="#475569" strokeWidth={1.5} />
            <line x1={10} y1={35} x2={21} y2={35} stroke="#475569" strokeWidth={1.5} />
            <line x1={42} y1={25} x2={60} y2={25} stroke="#475569" strokeWidth={1.5} />
            <text x={28} y={28} fill="#38bdf8" fontSize={6} fontWeight="bold" textAnchor="middle">XOR</text>
          </g>
        );

      default: {
        const dim = getSchematicDimensions(type);
        const meta = COMPONENT_DEFINITIONS[type];
        return (
          <g>
            <rect width={dim.width} height={dim.height} fill="#0f172a" stroke="#94a3b8" strokeWidth={2} rx={4} />
            <text x={dim.width / 2} y={16} fill="#f1f5f9" fontSize={8} fontWeight="bold" textAnchor="middle">
              {name.toUpperCase()}
            </text>
            <line x1={5} y1={22} x2={dim.width - 5} y2={22} stroke="#334155" strokeWidth={1} />
            
            {/* Draw Pin Indicators and Labels dynamically */}
            {meta && meta.pins.map(p => {
              const pCoords = getSchematicPinCoords(type, p.id);
              const isLeft = pCoords.x < dim.width / 2;
              return (
                <g key={p.id}>
                  {/* Pin Circle */}
                  <circle cx={pCoords.x} cy={pCoords.y} r={2} fill="#475569" stroke="#94a3b8" strokeWidth={1} />
                  {/* Pin name */}
                  <text
                    x={isLeft ? pCoords.x + 6 : pCoords.x - 6}
                    y={pCoords.y + 2.5}
                    fill="#64748b"
                    fontSize={6.5}
                    fontWeight="bold"
                    textAnchor={isLeft ? "start" : "end"}
                  >
                    {p.name}
                  </text>
                </g>
              );
            })}
          </g>
        );
      }
    }
  }

  // Render Realistic (Breadboard) view designs
  switch (type) {
    case 'arduino':
      return (
        <g>
          {/* Main PCB Board - Tinkercad Teal */}
          <path d="M 4 0 L 196 0 A 4 4 0 0 1 200 4 L 200 136 A 4 4 0 0 1 196 140 L 4 140 A 4 4 0 0 1 0 136 L 0 4 A 4 4 0 0 1 4 0 Z" fill="#00878F" stroke="#005B60" strokeWidth={2} />
          
          {/* subtle board traces decoration */}
          <path d="M 20 60 L 30 70 L 30 110 M 150 40 L 160 30 L 180 30" fill="none" stroke="#009BA4" strokeWidth={1} opacity={0.6} />

          {/* USB Type-B port (metallic silver) */}
          <g>
            <rect x={-10} y={15} width={32} height={26} fill="#E0E0E0" stroke="#B0B0B0" strokeWidth={1} rx={2} />
            <rect x={-6} y={18} width={26} height={20} fill="#F5F5F5" />
            <path d="M -4 21 L 10 21 L 8 33 L -2 33 Z" fill="#D0D0D0" />
            {/* USB symbol */}
            <circle cx={4} cy={27} r={1.5} fill="#888" />
          </g>

          {/* Power jack cylinder (black matte) */}
          <g>
            <rect x={-8} y={78} width={34} height={26} fill="#1A1A1A" rx={2} />
            <rect x={2} y={80} width={22} height={22} fill="#2A2A2A" />
            <circle cx={14} cy={91} r={6} fill="#09090b" />
            <circle cx={14} cy={91} r={3} fill="#d4d4d8" /> {/* center pin */}
          </g>

          {/* Voltage Regulator and Capacitors */}
          <g>
            <rect x={35} y={45} width={12} height={12} fill="#222" rx={1} />
            <rect x={47} y={48} width={3} height={6} fill="#A0A0A0" />
            <circle cx={35} cy={80} r={4} fill="#E0E0E0" stroke="#B0B0B0" strokeWidth={0.5} />
            <circle cx={35} cy={100} r={4} fill="#E0E0E0" stroke="#B0B0B0" strokeWidth={0.5} />
            <path d="M 33 78 L 37 78 M 33 98 L 37 98" stroke="#333" strokeWidth={0.5} />
          </g>

          {/* Red reset button */}
          <g>
            <rect x={12} y={5} width={14} height={14} fill="#E5E5E5" rx={2} stroke="#B0B0B0" strokeWidth={1} />
            <circle cx={19} cy={12} r={4.5} fill="#EF4444" />
            <circle cx={19} cy={12} r={3} fill="#DC2626" />
          </g>

          {/* Large ATmega328P IC chip */}
          <g>
            {/* Pins */}
            {Array.from({ length: 14 }).map((_, idx) => {
              const lx = 63 + idx * 5.8;
              return (
                <g key={`atmega-pin-${idx}`}>
                  <rect x={lx} y={100} width={2.5} height={6} fill="#C0C0C0" />
                  <rect x={lx} y={120} width={2.5} height={6} fill="#C0C0C0" />
                </g>
              );
            })}
            {/* Body */}
            <rect x={58} y={103} width={88} height={20} fill="#1C1C1C" rx={2} />
            {/* Notch */}
            <path d="M 146 108 A 4 4 0 0 0 146 118" fill="#111" />
            {/* Label */}
            <text x={102} y={116} fill="#999999" fontSize={6.5} fontFamily="monospace" fontWeight="bold" textAnchor="middle">ATMEGA328P-PU</text>
            <circle cx={142} cy={107} r={1} fill="#555" />
          </g>

          {/* Centered texts and logos */}
          <g>
            <text x={110} y={53} fill="#ffffff" fontWeight="bold" fontSize={14} fontFamily="sans-serif" textAnchor="middle" letterSpacing="0.5">ARDUINO</text>
            <text x={86} y={76} fill="#ffffff" fontSize={16} textAnchor="middle" fontWeight="bold">∞</text>
            <rect x={98} y={64} width={26} height={14} fill="none" stroke="#ffffff" strokeWidth={1.5} rx={2} />
            <text x={111} y={75} fill="#ffffff" fontWeight="bold" fontSize={9} textAnchor="middle">UNO</text>
          </g>

          {/* 3 small yellow LEDs labeled "TX", "RX", "L" & "ON" */}
          <g>
            <rect x={160} y={48} width={5} height={4} fill={isPinActive('arduino-D13') || isPinActive('D13') ? '#fbbf24' : '#3f3f46'} stroke="#27272a" strokeWidth={0.5} />
            <text x={153} y={52} fill="#ffffff" fontSize={6} fontWeight="bold" textAnchor="end" opacity={0.8}>L</text>
            
            <rect x={160} y={58} width={5} height={4} fill={isPinActive('arduino-D1') || isPinActive('D1') ? '#fbbf24' : '#3f3f46'} stroke="#27272a" strokeWidth={0.5} />
            <text x={153} y={62} fill="#ffffff" fontSize={6} fontWeight="bold" textAnchor="end" opacity={0.8}>TX</text>
            
            <rect x={160} y={68} width={5} height={4} fill={isPinActive('arduino-D0') || isPinActive('D0') ? '#fbbf24' : '#3f3f46'} stroke="#27272a" strokeWidth={0.5} />
            <text x={153} y={72} fill="#ffffff" fontSize={6} fontWeight="bold" textAnchor="end" opacity={0.8}>RX</text>

            <rect x={180} y={105} width={5} height={4} fill="#22c55e" stroke="#27272a" strokeWidth={0.5} />
            <text x={180} y={115} fill="#ffffff" fontSize={6} fontWeight="bold" textAnchor="middle" opacity={0.8}>ON</text>
          </g>

          {/* Toggle label */}
          <text x={188} y={38} fill="#ffffff" fontSize={6} fontWeight="bold" textAnchor="end" opacity={0.6}>ON/OFF</text>

          {/* Render Top Pin Headers & Labels */}
          {[
            { id: 'arduino-D0', label: '0', x: 185, y: 12 },
            { id: 'arduino-D1', label: '1', x: 177, y: 12 },
            { id: 'arduino-D2', label: '2', x: 169, y: 12 },
            { id: 'arduino-D3', label: '3', x: 161, y: 12 },
            { id: 'arduino-D4', label: '4', x: 153, y: 12 },
            { id: 'arduino-D5', label: '5', x: 145, y: 12 },
            { id: 'arduino-D6', label: '6', x: 137, y: 12 },
            { id: 'arduino-D7', label: '7', x: 129, y: 12 },
            { id: 'arduino-D8', label: '8', x: 115, y: 12 },
            { id: 'arduino-D9', label: '9', x: 107, y: 12 },
            { id: 'arduino-D10', label: '10', x: 99, y: 12 },
            { id: 'arduino-D11', label: '11', x: 91, y: 12 },
            { id: 'arduino-D12', label: '12', x: 83, y: 12 },
            { id: 'arduino-D13', label: '13', x: 75, y: 12 },
            { id: 'arduino-GND', label: 'GND', x: 67, y: 12 },
            { id: 'arduino-AREF', label: 'AREF', x: 59, y: 12 }
          ].map(p => (
            <g key={p.id}>
              <rect x={p.x - 3} y={p.y - 4} width={6} height={8} fill="#27272a" stroke="#52525b" strokeWidth={0.5} data-pin={p.id} />
              <text x={p.x} y={p.y - 6} fill="#ffffff" fontSize={6} fontWeight="bold" textAnchor="middle" opacity={0.9}>{p.label}</text>
            </g>
          ))}
          <text x={185} y={26} fill="#ffffff" fontSize={5} fontWeight="bold" textAnchor="end" opacity={0.6}>DIGITAL (PWM~)</text>

          {/* Render Bottom Pin Headers & Labels */}
          {[
            { id: 'arduino-IOREF', label: 'IOREF', x: 59, y: 128 },
            { id: 'arduino-RESET', label: 'RESET', x: 67, y: 128 },
            { id: 'arduino-3.3V', label: '3.3V', x: 75, y: 128 },
            { id: 'arduino-5V', label: '5V', x: 83, y: 128 },
            { id: 'arduino-GND1', label: 'GND', x: 91, y: 128 },
            { id: 'arduino-GND2', label: 'GND', x: 99, y: 128 },
            { id: 'arduino-Vin', label: 'Vin', x: 107, y: 128 },
            { id: 'arduino-A0', label: 'A0', x: 125, y: 128 },
            { id: 'arduino-A1', label: 'A1', x: 133, y: 128 },
            { id: 'arduino-A2', label: 'A2', x: 141, y: 128 },
            { id: 'arduino-A3', label: 'A3', x: 149, y: 128 },
            { id: 'arduino-A4', label: 'A4', x: 157, y: 128 },
            { id: 'arduino-A5', label: 'A5', x: 165, y: 128 }
          ].map(p => (
            <g key={p.id}>
              <rect x={p.x - 3} y={p.y - 4} width={6} height={8} fill="#27272a" stroke="#52525b" strokeWidth={0.5} data-pin={p.id} />
              <text x={p.x} y={p.y - 6} fill="#ffffff" fontSize={5} fontWeight="bold" textAnchor="middle" opacity={0.9}>{p.label}</text>
            </g>
          ))}
          <text x={75} y={138} fill="#ffffff" fontSize={5.5} fontWeight="bold" textAnchor="start" opacity={0.6}>POWER</text>
          <text x={145} y={138} fill="#ffffff" fontSize={5.5} fontWeight="bold" textAnchor="middle" opacity={0.6}>ANALOG IN</text>
        </g>
      );

    case 'raspberry_pi':
      return (
        <g>
          {/* Raspberry Pi Green PCB */}
          <rect width={250} height={100} fill="#065f46" stroke="#064e3b" strokeWidth={3} rx={8} />
          
          {/* USB micro Port */}
          <rect x={5} y={35} width={20} height={30} fill="#475569" rx={2} />
          <text x={13} y={53} fill="#94a3b8" fontSize={8} textAnchor="middle" transform="rotate(-90 13 53)" fontWeight="bold">USB</text>

          {/* Boot Select Button */}
          <rect x={60} y={40} width={12} height={20} fill="#f8fafc" rx={1} />
          <circle cx={66} cy={50} r={3} fill="#cbd5e1" />
          
          {/* RP2040 Microchip */}
          <rect x={130} y={30} width={40} height={40} fill="#1f2937" rx={2} transform="rotate(45 150 50)" />
          <text x={150} y={53} fill="#4b5563" fontSize={8} fontWeight="bold" textAnchor="middle">RP2040</text>

          {/* Pin Headers */}
          <rect x={10} y={10} width={230} height={10} fill="#1e293b" />
          <rect x={10} y={80} width={230} height={10} fill="#1e293b" />

          {/* Title label */}
          <text x={150} y={25} fill="#a7f3d0" fontSize={10} fontWeight="bold" textAnchor="middle">Raspberry Pi Pico</text>
          
          {/* Onboard LED */}
          <rect x={210} y={40} width={6} height={6} fill={isPinActive('GP25') ? '#3b82f6' : '#374151'} />
          <text x={213} y={55} fill="#a7f3d0" fontSize={7} textAnchor="middle">GP25</text>
        </g>
      );

    case 'breadboard': {
      // Determine which rail is hovered
      let hoveredRailGroup: 'top_neg' | 'top_pos' | 'bot_neg' | 'bot_pos' | null = null;
      let hoveredUpperCol: string | null = null;
      let hoveredLowerCol: string | null = null;

      if (hoveredPinId) {
        if (hoveredPinId.startsWith('rail_top_neg')) hoveredRailGroup = 'top_neg';
        else if (hoveredPinId.startsWith('rail_top_pos')) hoveredRailGroup = 'top_pos';
        else if (hoveredPinId.startsWith('rail_bot_neg')) hoveredRailGroup = 'bot_neg';
        else if (hoveredPinId.startsWith('rail_bot_pos')) hoveredRailGroup = 'bot_pos';
        else if (hoveredPinId.startsWith('hole_')) {
          const parts = hoveredPinId.split('_');
          if (parts.length === 3) {
            const row = parts[1];
            const col = parts[2];
            if (['A', 'B', 'C', 'D', 'E'].includes(row)) hoveredUpperCol = col;
            else if (['F', 'G', 'H', 'I', 'J'].includes(row)) hoveredLowerCol = col;
          }
        }
      }

      return (
        <g>
          {/* Realistic Breadboard Body - Tinkercad Style */}
          <rect width={550} height={256} fill="#E6E6E6" stroke="#cccccc" strokeWidth={2} rx={8} />
          
          {/* Central Dividing Channel */}
          <rect x={10} y={122} width={530} height={12} fill="#d4d4d4" rx={2} />
          {/* Small indentations in the center channel */}
          {Array.from({ length: 30 }).map((_, i) => (
            <rect key={`indent-${i}`} x={48 + i * 16.5} y={124} width={4} height={8} fill="#c4c4c4" rx={1} />
          ))}

          {/* Hover Rail Highlights */}
          {hoveredRailGroup === 'top_neg' && <rect x={42} y={12} width={488} height={12} fill="rgba(59, 130, 246, 0.25)" rx={3} />}
          {hoveredRailGroup === 'top_pos' && <rect x={42} y={26} width={488} height={12} fill="rgba(239, 68, 68, 0.25)" rx={3} />}
          {hoveredRailGroup === 'bot_neg' && <rect x={42} y={218} width={488} height={12} fill="rgba(59, 130, 246, 0.25)" rx={3} />}
          {hoveredRailGroup === 'bot_pos' && <rect x={42} y={232} width={488} height={12} fill="rgba(239, 68, 68, 0.25)" rx={3} />}
          
          {hoveredUpperCol && <rect x={44 + (parseInt(hoveredUpperCol) - 1) * 16.5} y={52} width={12} height={68} fill="rgba(34, 197, 94, 0.25)" rx={2} />}
          {hoveredLowerCol && <rect x={44 + (parseInt(hoveredLowerCol) - 1) * 16.5} y={136} width={12} height={68} fill="rgba(34, 197, 94, 0.25)" rx={2} />}

          {/* Power Rail Colored Lines */}
          <line x1={40} y1={10} x2={525} y2={10} stroke="#3b82f6" strokeWidth={1.5} />
          <text x={28} y={21} fill="#3b82f6" fontSize={14} fontWeight="bold">-</text>
          
          <line x1={40} y1={40} x2={525} y2={40} stroke="#ef4444" strokeWidth={1.5} />
          <text x={28} y={35} fill="#ef4444" fontSize={14} fontWeight="bold">+</text>
          
          <line x1={40} y1={216} x2={525} y2={216} stroke="#3b82f6" strokeWidth={1.5} />
          <text x={28} y={227} fill="#3b82f6" fontSize={14} fontWeight="bold">-</text>

          <line x1={40} y1={246} x2={525} y2={246} stroke="#ef4444" strokeWidth={1.5} />
          <text x={28} y={241} fill="#ef4444" fontSize={14} fontWeight="bold">+</text>

          {/* Labels for Breadboard Columns */}
          {Array.from({ length: 30 }).map((_, i) => (
            <g key={`col-label-${i}`}>
              {(i + 1) % 5 === 0 && (
                <text x={50 + i * 16.5} y={49} fill="#888888" fontSize={9} fontWeight="bold" textAnchor="middle">
                  {i + 1}
                </text>
              )}
              {(i + 1) % 5 === 0 && (
                <text x={50 + i * 16.5} y={211} fill="#888888" fontSize={9} fontWeight="bold" textAnchor="middle">
                  {i + 1}
                </text>
              )}
            </g>
          ))}

          {/* Labels for Rows A-J */}
          {['a', 'b', 'c', 'd', 'e'].map((letter, idx) => (
            <text key={`row-upper-${letter}`} x={36} y={118 - idx * 14} fill="#888888" fontSize={10} textAnchor="middle" fontWeight="bold">
              {letter}
            </text>
          ))}
          {['f', 'g', 'h', 'i', 'j'].map((letter, idx) => (
            <text key={`row-lower-${letter}`} x={36} y={146 + idx * 14} fill="#888888" fontSize={10} textAnchor="middle" fontWeight="bold">
              {letter}
            </text>
          ))}
        </g>
      );
    }

    case 'led': {
      const ledColor = properties.color || 'red';
      const colorMap: Record<string, { body: string; off: string; dome: string; glow: string }> = {
        red: { body: '#FF3333', off: '#88222299', dome: '#fca5a5', glow: 'rgba(255, 51, 51, 0.8)' },
        green: { body: '#33FF33', off: '#22772299', dome: '#86efac', glow: 'rgba(51, 255, 51, 0.8)' },
        blue: { body: '#4488FF', off: '#22448899', dome: '#93c5fd', glow: 'rgba(68, 136, 255, 0.8)' },
        yellow: { body: '#FFAA00', off: '#88662299', dome: '#fde047', glow: 'rgba(255, 170, 0, 0.8)' },
        white: { body: '#FFFFFF', off: '#99999999', dome: '#e2e8f0', glow: 'rgba(255, 255, 255, 0.8)' },
      };
      const colors = colorMap[ledColor] || colorMap.red;
      const ledColorVal = isLedOn ? colors.body : colors.off;
      const ledFilter = isLedOn ? `drop-shadow(0px 0px 8px ${colors.glow})` : 'none';

      return (
        <g>
          {/* LED Legs (Metallic silver) */}
          {/* Anode (Longer, bent slightly) */}
          <path d="M 15 45 L 15 35 L 12 30 L 12 25" fill="none" stroke="#C0C0C0" strokeWidth={2} />
          {/* Cathode (Shorter, straight) */}
          <line x1={25} y1={25} x2={25} y2={45} stroke="#C0C0C0" strokeWidth={2} />

          {/* Internal Anode/Cathode Plates */}
          <rect x={11} y={18} width={4} height={6} fill="#444" />
          <path d="M 23 15 L 28 15 L 28 24 L 23 24 Z" fill="#444" />

          {/* LED Glass Dome (Translucent Epoxy) */}
          <path 
            d="M 8 25 L 8 16 A 12 12 0 0 1 32 16 L 32 25 Z" 
            fill={ledColorVal} 
            opacity={0.85} 
            stroke={colors.dome} 
            strokeWidth={1.5}
            style={{ 
              transition: 'fill 80ms ease-in-out, filter 80ms ease-in-out',
              filter: ledFilter 
            }}
          />
          
          {/* Flat base edge for Cathode side indicator */}
          <path 
            d="M 6 25 L 32 25 L 32 28 L 6 28 Z" 
            fill={ledColorVal} 
            stroke={colors.dome} 
            strokeWidth={1}
            style={{ 
              transition: 'fill 80ms ease-in-out, filter 80ms ease-in-out',
              filter: ledFilter 
            }}
          />

          {/* White Glossy Highlight to simulate 3D plastic */}
          <path 
            d="M 12 10 A 6 6 0 0 1 18 6 A 10 10 0 0 0 10 16 Z" 
            fill="#FFFFFF" 
            opacity={0.6} 
          />

          {/* Extra Radial Glow circles */}
          {isLedOn && (
            <g>
              <circle cx={20} cy={16} r={16} fill={colors.body} opacity={0.2} className="pulse-glow pointer-events-none" />
              <circle cx={20} cy={16} r={6} fill="#fff" opacity={0.6} className="pointer-events-none" />
            </g>
          )}
        </g>
      );
    }

    case 'resistor':
      const bands = getResistorBands(properties.resistance);
      return (
        <g>
          {/* Wire lead line through resistor (metallic silver) */}
          <line x1={0} y1={10} x2={60} y2={10} stroke="#C0C0C0" strokeWidth={2.5} />
          <line x1={0} y1={10} x2={15} y2={10} stroke="#E0E0E0" strokeWidth={1} />
          <line x1={45} y1={10} x2={60} y2={10} stroke="#E0E0E0" strokeWidth={1} />

          {/* Ceramic Resistor Body - Tinkercad beige pill */}
          <rect x={12} y={4} width={36} height={12} fill="#E1C699" stroke="#C3A072" strokeWidth={1} rx={5} />
          
          {/* Color Bands */}
          <path d="M 18 4 L 18 16" stroke={bands[0]} strokeWidth={2.5} />
          <path d="M 24 4 L 24 16" stroke={bands[1]} strokeWidth={2.5} />
          <path d="M 30 4 L 30 16" stroke={bands[2]} strokeWidth={2.5} />
          <path d="M 38 4 L 38 16" stroke="#DAA520" strokeWidth={2.5} /> {/* Gold Tolerance */}
          
          {/* Subtle 3D highlight on body */}
          <rect x={13} y={5} width={34} height={3} fill="#ffffff" opacity={0.4} rx={1.5} />
        </g>
      );

    case 'push_button':
      return (
        <g>
          {/* Base plate */}
          <rect width={40} height={40} fill="#1e293b" stroke="#0f172a" strokeWidth={2} rx={6} />
          
          {/* Circular housing */}
          <circle cx={20} cy={20} r={14} fill="#334155" stroke="#475569" strokeWidth={1.5} />
          
          {/* Tactile plunger switch */}
          <circle cx={20} cy={20} r={10} fill="#f43f5e" className="active:scale-95 transition-transform" />
          
          {/* Corner legs */}
          <rect x={-3} y={8} width={3} height={6} fill="#94a3b8" rx={1} />
          <rect x={-3} y={26} width={3} height={6} fill="#94a3b8" rx={1} />
          <rect x={40} y={8} width={3} height={6} fill="#94a3b8" rx={1} />
          <rect x={40} y={26} width={3} height={6} fill="#94a3b8" rx={1} />
        </g>
      );

    case 'buzzer':
      return (
        <g>
          {/* Piezo buzzer black cylinder */}
          <circle cx={30} cy={30} r={28} fill="#111" stroke="#333" strokeWidth={2} />
          <circle cx={30} cy={30} r={24} fill="#1e1e1e" />
          
          {/* Sound hole in center */}
          <circle cx={30} cy={30} r={8} fill="#090909" />
          
          {/* Positive sign symbol */}
          <text x={16} y={20} fill="#ef4444" fontSize={10} fontWeight="bold">+</text>

          {/* Sound waves animation */}
          {isBuzzerActive && (
            <g stroke="#a855f7" strokeWidth={2} fill="none" opacity={0.8}>
              <circle cx={30} cy={30} r={34} strokeDasharray="5,10" className="wire-animated" />
              <circle cx={30} cy={30} r={42} strokeDasharray="10,5" className="wire-animated" />
            </g>
          )}
        </g>
      );

    case 'dht11':
      return (
        <g>
          {/* Blue plastic housing */}
          <rect width={60} height={70} fill="#2563eb" stroke="#1d4ed8" strokeWidth={2} rx={4} />
          
          {/* Ventilator Grille slots */}
          {Array.from({ length: 5 }).map((_, idx) => (
            <rect key={idx} x={10 + idx * 8} y={12} width={4} height={30} fill="#1e3a8a" rx={1} />
          ))}

          {/* Connecting board strip */}
          <rect x={0} y={70} width={60} height={10} fill="#1e293b" />
          
          {/* Pins protruding */}
          <line x1={15} y1={70} x2={15} y2={85} stroke="#cbd5e1" strokeWidth={2.5} />
          <line x1={30} y1={70} x2={30} y2={85} stroke="#cbd5e1" strokeWidth={2.5} />
          <line x1={45} y1={70} x2={45} y2={85} stroke="#cbd5e1" strokeWidth={2.5} />

          {/* Labels */}
          <text x={30} y={60} fill="#93c5fd" fontSize={7} textAnchor="middle" fontWeight="bold">DHT11</text>
          <text x={30} y={50} fill="#ffffff" fontSize={8} textAnchor="middle" fontWeight="semibold">
            {sensorValues.temperature || 24}°C
          </text>
        </g>
      );

    case 'hc_sr04':
      return (
        <g>
          {/* Blue PCB plate */}
          <rect width={90} height={50} fill="#1e3a8a" stroke="#172554" strokeWidth={2} rx={6} />
          
          {/* Ultrasonic eyes (Transceiver & Receiver) */}
          <circle cx={25} cy={25} r={16} fill="#475569" stroke="#94a3b8" strokeWidth={2} />
          <circle cx={25} cy={25} r={12} fill="#334155" />
          <circle cx={25} cy={25} r={10} fill="#0f172a" />
          <text x={25} y={28} fill="#94a3b8" fontSize={9} textAnchor="middle" fontWeight="bold">T</text>
          
          <circle cx={65} cy={25} r={16} fill="#475569" stroke="#94a3b8" strokeWidth={2} />
          <circle cx={65} cy={25} r={12} fill="#334155" />
          <circle cx={65} cy={25} r={10} fill="#0f172a" />
          <text x={65} y={28} fill="#94a3b8" fontSize={9} textAnchor="middle" fontWeight="bold">R</text>

          {/* Crystal Oscillator component */}
          <rect x={41} y={4} width={8} height={12} fill="#94a3b8" rx={1} />

          {/* Pins labels */}
          <text x={45} y={42} fill="#93c5fd" fontSize={6} textAnchor="middle">HC-SR04</text>
        </g>
      );

    case 'pir_sensor':
      return (
        <g>
          {/* Green PCB */}
          <rect width={70} height={70} fill="#14532d" stroke="#166534" strokeWidth={2} rx={6} />
          
          {/* White Fresnel Dome Lens */}
          <circle cx={35} cy={35} r={25} fill="#f8fafc" stroke="#e2e8f0" strokeWidth={1.5} />
          
          {/* Lens hexagonal pattern mock */}
          <circle cx={35} cy={35} r={18} fill="none" stroke="#e2e8f0" strokeWidth={1} strokeDasharray="3,3" />
          <circle cx={35} cy={35} r={10} fill="none" stroke="#cbd5e1" strokeWidth={1} />
          
          {/* Visual Alert Glow for motion detected */}
          {sensorValues.motion && (
            <circle cx={35} cy={35} r={25} fill="#ef4444" opacity={0.25} className="pulse-glow" />
          )}

          <text x={35} y={64} fill="#a7f3d0" fontSize={7} textAnchor="middle" fontWeight="bold">PIR SENSOR</text>
        </g>
      );

    case 'ds18b20':
      return (
        <g>
          {/* Waterproof Probe cap (Metal cylinder) */}
          <rect x={10} y={5} width={20} height={30} fill="#94a3b8" stroke="#64748b" rx={2} />
          {/* Cap rib marks */}
          <line x1={10} y1={12} x2={30} y2={12} stroke="#475569" />
          <line x1={10} y1={22} x2={30} y2={22} stroke="#475569" />

          {/* Heatshrink tube sleeve */}
          <rect x={13} y={35} width={14} height={12} fill="#111" />
          
          {/* Text value */}
          <text x={20} y={23} fill="#0f172a" fontSize={7} fontWeight="bold" textAnchor="middle">
            {sensorValues.tempProbe || 25}°
          </text>
          
          {/* Cable wires coming out */}
          <line x1={15} y1={47} x2={10} y2={55} stroke="#ef4444" strokeWidth={2} /> {/* VCC */}
          <line x1={20} y1={47} x2={20} y2={55} stroke="#eab308" strokeWidth={2} /> {/* DQ */}
          <line x1={25} y1={47} x2={30} y2={55} stroke="#1e293b" strokeWidth={2} /> {/* GND */}
        </g>
      );

    case 'yf_s201':
      return (
        <g>
          {/* Black plastic circular impeller body */}
          <circle cx={35} cy={35} r={30} fill="#1e293b" stroke="#0f172a" strokeWidth={2} />
          
          {/* Flanges for pipe connectors */}
          <rect x={-8} y={23} width={12} height={24} fill="#0f172a" rx={1} />
          <rect x={66} y={23} width={12} height={24} fill="#0f172a" rx={1} />

          {/* Rotor spinning effect if flow rate active */}
          <g transform={`rotate(${sensorValues.flowRate > 0 ? (Date.now() / 5) % 360 : 0} 35 35)`}>
            <circle cx={35} cy={35} r={18} fill="none" stroke="#64748b" strokeWidth={2} strokeDasharray="6,8" />
            <line x1={35} y1={17} x2={35} y2={53} stroke="#64748b" strokeWidth={2} />
            <line x1={17} y1={35} x2={53} y2={35} stroke="#64748b" strokeWidth={2} />
          </g>

          <text x={35} y={15} fill="#94a3b8" fontSize={6} textAnchor="middle" fontWeight="bold">YF-S201</text>
        </g>
      );

    case 'relay':
      return (
        <g>
          {/* Board */}
          <rect width={60} height={70} fill="#1e293b" stroke="#334155" strokeWidth={2} rx={4} />
          
          {/* Relay Cube (Blue) */}
          <rect x={10} y={10} width={40} height={42} fill={isRelayOn ? '#1d4ed8' : '#2563eb'} rx={2} />
          <text x={30} y={28} fill="#ffffff" fontSize={8} textAnchor="middle" fontWeight="bold">RELAY</text>
          <text x={30} y={38} fill="#93c5fd" fontSize={6} textAnchor="middle">SRD-05VDC</text>
          <text x={30} y={48} fill="#ffffff" fontSize={7} textAnchor="middle" fontWeight="bold">
            {isRelayOn ? '[ON]' : '[OFF]'}
          </text>

          {/* Power status indicator LED */}
          <circle cx={50} cy={60} r={2.5} fill={isRelayOn ? '#22c55e' : '#ef4444'} />
        </g>
      );

    case 'l298n':
      return (
        <g>
          {/* Red/Black board base */}
          <rect width={100} height={100} fill="#991b1b" stroke="#7f1d1d" strokeWidth={2} rx={6} />
          
          {/* Heatsink (Aluminium fins) */}
          <rect x={15} y={10} width={70} height={35} fill="#1f2937" rx={2} />
          {Array.from({ length: 8 }).map((_, i) => (
            <line key={i} x1={20 + i * 8} y1={10} x2={20 + i * 8} y2={45} stroke="#4b5563" strokeWidth={2.5} />
          ))}

          {/* Driver chip beneath heatsink mock */}
          <text x={50} y={30} fill="#ffffff" fontSize={8} fontWeight="bold" textAnchor="middle">L298N</text>

          {/* Blue screw terminal connectors */}
          <rect x={5} y={75} width={15} height={20} fill="#2563eb" /> {/* Motor A */}
          <rect x={80} y={75} width={15} height={20} fill="#2563eb" /> {/* Motor B */}
          <rect x={40} y={78} width={20} height={18} fill="#2563eb" /> {/* Power */}

          {/* Status LEDs */}
          <circle cx={30} cy={60} r={2} fill={isMotorSpinning ? '#22c55e' : '#374151'} />
          <circle cx={70} cy={60} r={2} fill={isMotorSpinning ? '#22c55e' : '#374151'} />
        </g>
      );

    case 'dc_motor':
      return (
        <g>
          {/* Circular metal motor body */}
          <circle cx={30} cy={40} r={26} fill="#94a3b8" stroke="#cbd5e1" strokeWidth={1.5} />
          
          {/* Flat edges */}
          <rect x={3} y={24} width={54} height={32} fill="#94a3b8" />

          {/* Motor spindle shaft */}
          <circle cx={30} cy={40} r={6} fill="#e2e8f0" />
          
          {/* Shaft pin */}
          <g transform={`rotate(${isMotorSpinning ? (Date.now() / 2) % 360 : 0} 30 40)`}>
            <rect x={28} y={15} width={4} height={25} fill="#f59e0b" rx={1} />
            <circle cx={30} cy={18} r={2} fill="#000" />
          </g>

          <text x={30} y={72} fill="#0f172a" fontSize={7} textAnchor="middle" fontWeight="bold">DC MOTOR</text>
        </g>
      );

    case 'stepper_motor':
      return (
        <g>
          {/* Square metallic body */}
          <rect width={70} height={70} fill="#334155" stroke="#475569" strokeWidth={2} rx={4} />
          
          {/* Circular metal faceplate */}
          <circle cx={35} cy={35} r={25} fill="#64748b" stroke="#94a3b8" strokeWidth={1} />
          
          {/* Center spindle */}
          <circle cx={35} cy={35} r={8} fill="#cbd5e1" />
          
          {/* Rotating shaft alignment notch */}
          <g transform={`rotate(${isMotorSpinning ? (Date.now() / 4) % 360 : 0} 35 35)`}>
            <rect x={33} y={15} width={4} height={20} fill="#f59e0b" rx={1} />
          </g>

          <text x={35} y={64} fill="#cbd5e1" fontSize={7} textAnchor="middle" fontWeight="bold">STEPPER</text>
        </g>
      );

    case 'pulse_sensor':
      return (
        <g>
          {/* Heart shaped black PCB */}
          <path d="M 25 15 C 20 5, 5 5, 5 22 C 5 36, 25 46, 25 46 C 25 46, 45 36, 45 22 C 45 5, 30 5, 25 15 Z" fill="#111" stroke="#333" strokeWidth={2} />
          
          {/* Active green optical photoplethysmogram led */}
          <circle cx={25} cy={22} r={5} fill="#22c55e" className="pulse-glow" />
          
          {/* Heart logo graphic */}
          <path d="M 25 18 C 22 15, 18 15, 18 20 C 18 25, 25 28, 25 28 C 25 28, 32 25, 32 20 C 32 15, 28 15, 25 18 Z" fill="none" stroke="#ef4444" strokeWidth={1} />

          <text x={25} y={40} fill="#ffffff" fontSize={6} textAnchor="middle" fontWeight="bold">
            {sensorValues.bpm || 72} BPM
          </text>
        </g>
      );

    case 'lm35':
      return (
        <g>
          {/* TO-92 flat face transistor package */}
          <path d="M 5 25 A 15 15 0 0 1 35 25 L 35 32 L 5 32 Z" fill="#1e293b" stroke="#0f172a" />
          <rect x={5} y={32} width={30} height={3} fill="#0f172a" />

          {/* Three leads */}
          <line x1={10} y1={35} x2={10} y2={48} stroke="#94a3b8" strokeWidth={1.5} />
          <line x1={20} y1={35} x2={20} y2={48} stroke="#cbd5e1" strokeWidth={1.5} />
          <line x1={30} y1={35} x2={30} y2={48} stroke="#94a3b8" strokeWidth={1.5} />

          <text x={20} y={22} fill="#ffffff" fontSize={7} textAnchor="middle" fontWeight="bold">LM35</text>
          <text x={20} y={42} fill="#ef4444" fontSize={5} textAnchor="middle">
            {sensorValues.temperature || 25}°C
          </text>
        </g>
      );

    case 'potentiometer': {
      const angle = (properties.value || 0) * 2.7 - 135; // Map 0-100 to angle
      return (
        <g>
          {/* Outer case */}
          <rect width={50} height={40} fill="#1e293b" stroke="#334155" strokeWidth={2} rx={6} />
          {/* Circular base */}
          <circle cx={25} cy={20} r={14} fill="#0f172a" stroke="#475569" strokeWidth={1.5} />
          {/* Dial indicator knob */}
          <g transform={`rotate(${angle} 25 20)`}>
            <circle cx={25} cy={20} r={10} fill="#3b82f6" />
            <line x1={25} y1={20} x2={25} y2={10} stroke="#ffffff" strokeWidth={2} strokeLinecap="round" />
          </g>
          {/* Connection Legs */}
          <line x1={10} y1={40} x2={10} y2={45} stroke="#cbd5e1" strokeWidth={2.5} />
          <line x1={25} y1={40} x2={25} y2={45} stroke="#cbd5e1" strokeWidth={2.5} />
          <line x1={40} y1={40} x2={40} y2={45} stroke="#cbd5e1" strokeWidth={2.5} />
          <text x={25} y={38} fill="#94a3b8" fontSize={6} textAnchor="middle" fontWeight="bold">POT</text>
        </g>
      );
    }

    case 'capacitor':
      return (
        <g>
          {/* Ceramic capacitor tear drop shape */}
          <path d="M 5 25 C 2 10, 28 10, 25 25 C 22 32, 8 32, 5 25 Z" fill="#38bdf8" stroke="#0284c7" strokeWidth={1.5} />
          <text x={15} y={22} fill="#0f172a" fontSize={7} fontWeight="bold" textAnchor="middle">104</text>
          {/* Two leads */}
          <line x1={10} y1={29} x2={10} y2={38} stroke="#cbd5e1" strokeWidth={2} />
          <line x1={20} y1={29} x2={20} y2={38} stroke="#94a3b8" strokeWidth={2} />
        </g>
      );

    case 'slide_switch':
      return (
        <g>
          {/* Outer silver cover */}
          <rect width={50} height={20} fill="#94a3b8" stroke="#475569" strokeWidth={1} rx={2} />
          {/* Slider channel */}
          <rect x={10} y={6} width={30} height={8} fill="#1e293b" rx={1} />
          {/* Slider knob */}
          <rect x={properties.position === 1 ? 28 : 12} y={3} width={10} height={14} fill="#f43f5e" rx={1} stroke="#e11d48" strokeWidth={1} />
          {/* Three leads */}
          <line x1={12} y1={20} x2={12} y2={25} stroke="#cbd5e1" strokeWidth={2} />
          <line x1={25} y1={20} x2={25} y2={25} stroke="#cbd5e1" strokeWidth={2} />
          <line x1={38} y1={20} x2={38} y2={25} stroke="#cbd5e1" strokeWidth={2} />
        </g>
      );

    case 'battery_9v':
      return (
        <g>
          {/* Rectangular body */}
          <rect width={80} height={60} fill="#1e293b" stroke="#0f172a" strokeWidth={3} rx={8} />
          {/* Accent copper/orange stripe */}
          <rect x={0} y={0} width={15} height={60} fill="#ea580c" rx={2} />
          {/* Snap terminals */}
          {/* Positive male stud */}
          <circle cx={25} cy={15} r={8} fill="#94a3b8" stroke="#64748b" strokeWidth={1.5} />
          <circle cx={25} cy={15} r={4} fill="#cbd5e1" />
          {/* Negative female socket */}
          <circle cx={55} cy={15} r={8} fill="#64748b" stroke="#475569" strokeWidth={1.5} />
          <polygon points="51,15 55,11 59,15 55,19" fill="#1e293b" />
          
          <text x={45} y={40} fill="#ffffff" fontSize={12} fontWeight="extrabold">9V</text>
          <text x={45} y={50} fill="#94a3b8" fontSize={7} textAnchor="middle">Heavy Duty</text>
        </g>
      );

    case 'battery_coin':
      return (
        <g>
          {/* Outer black holder */}
          <circle cx={25} cy={25} r={24} fill="#111" stroke="#333" strokeWidth={2} />
          {/* Metal cell contacts */}
          <circle cx={25} cy={25} r={20} fill="#cbd5e1" stroke="#94a3b8" strokeWidth={1} />
          {/* Text engraving */}
          <text x={25} y={23} fill="#475569" fontSize={8} fontWeight="bold" textAnchor="middle">CR2032</text>
          <text x={25} y={32} fill="#475569" fontSize={8} fontWeight="bold" textAnchor="middle">3V</text>
          <text x={40} y={18} fill="#e11d48" fontSize={10} fontWeight="bold">+</text>
          {/* Pins */}
          <line x1={15} y1={42} x2={15} y2={46} stroke="#cbd5e1" strokeWidth={2.5} />
          <line x1={35} y1={42} x2={35} y2={46} stroke="#94a3b8" strokeWidth={2.5} />
        </g>
      );

    case 'battery_1_5v':
      return (
        <g>
          {/* Alkaline battery AA shape */}
          <rect width={30} height={66} fill="#065f46" stroke="#044e39" strokeWidth={2} rx={4} />
          {/* Gold cap top */}
          <rect x={5} y={0} width={20} height={8} fill="#d97706" rx={1} />
          {/* Positive terminal nub */}
          <rect x={11} y={-3} width={8} height={4} fill="#f59e0b" rx={1} />
          {/* Labels */}
          <text x={15} y={30} fill="#f59e0b" fontSize={9} fontWeight="bold" textAnchor="middle" transform="rotate(-90 15 30)">1.5V</text>
          <text x={15} y={48} fill="#ffffff" fontSize={8} fontWeight="semibold" textAnchor="middle" transform="rotate(-90 15 48)">AA</text>
          <text x={15} y={15} fill="#ffffff" fontSize={8} fontWeight="bold" textAnchor="middle">+</text>
          <text x={15} y={60} fill="#94a3b8" fontSize={8} fontWeight="bold" textAnchor="middle">-</text>
        </g>
      );

    case 'microbit':
      return (
        <g>
          {/* microbit board */}
          <rect width={120} height={90} fill="#1e293b" stroke="#0f172a" strokeWidth={3} rx={10} />
          
          {/* Gold finger pads at bottom */}
          <rect x={0} y={80} width={120} height={10} fill="#eab308" rx={2} />
          {Array.from({ length: 24 }).map((_, i) => (
            <line key={i} x1={5 + i * 5} y1={80} x2={5 + i * 5} y2={90} stroke="#1e293b" strokeWidth={1.5} />
          ))}
          {/* Pins labels */}
          <text x={15} y={76} fill="#ffffff" fontSize={7} textAnchor="middle" fontWeight="bold">0</text>
          <text x={35} y={76} fill="#ffffff" fontSize={7} textAnchor="middle" fontWeight="bold">1</text>
          <text x={55} y={76} fill="#ffffff" fontSize={7} textAnchor="middle" fontWeight="bold">2</text>
          <text x={80} y={76} fill="#ef4444" fontSize={7} textAnchor="middle" fontWeight="bold">3V</text>
          <text x={105} y={76} fill="#94a3b8" fontSize={7} textAnchor="middle" fontWeight="bold">GND</text>
          
          {/* 5x5 LED Grid in center */}
          <g opacity={0.85}>
            {Array.from({ length: 5 }).map((_, r) =>
              Array.from({ length: 5 }).map((_, c) => (
                <rect
                  key={`${r}-${c}`}
                  x={45 + c * 7}
                  y={20 + r * 7}
                  width={4}
                  height={4}
                  fill={isPinActive('pin0') ? '#ef4444' : '#374151'}
                  rx={1}
                />
              ))
            )}
          </g>
          
          {/* Buttons A & B */}
          <rect x={10} y={35} width={12} height={12} fill="#111" rx={2} />
          <circle cx={16} cy={41} r={3} fill="#ef4444" />
          <text x={16} y={56} fill="#cbd5e1" fontSize={8} fontWeight="bold" textAnchor="middle">A</text>

          <rect x={98} y={35} width={12} height={12} fill="#111" rx={2} />
          <circle cx={104} cy={41} r={3} fill="#ef4444" />
          <text x={104} y={56} fill="#cbd5e1" fontSize={8} fontWeight="bold" textAnchor="middle">B</text>

          <text x={60} y={64} fill="#cbd5e1" fontSize={8} textAnchor="middle" fontWeight="semibold">micro:bit</text>
        </g>
      );

    case 'vibration_motor':
      return (
        <g>
          {/* Flat circular pancake motor */}
          <circle cx={20} cy={20} r={18} fill="#94a3b8" stroke="#475569" strokeWidth={1.5} />
          <circle cx={20} cy={20} r={14} fill="#cbd5e1" />
          <circle cx={20} cy={20} r={6} fill="#e2e8f0" stroke="#cbd5e1" strokeWidth={1} />
          {/* Wires */}
          <path d="M 12 32 C 10 38, 5 36, 15 42" fill="none" stroke="#ef4444" strokeWidth={2} />
          <path d="M 28 32 C 30 38, 35 36, 25 42" fill="none" stroke="#3b82f6" strokeWidth={2} />
        </g>
      );

    case 'servo': {
      const servoAngle = properties.angle || 0; // degrees
      return (
        <g>
          {/* Blue plastic case */}
          <rect width={60} height={50} fill="#1d4ed8" stroke="#172554" strokeWidth={2} rx={4} />
          {/* Circular mounting gear */}
          <circle cx={30} cy={20} r={12} fill="#1e293b" />
          {/* White horn/arm rotating */}
          <g transform={`rotate(${servoAngle} 30 20)`}>
            <rect x={15} y={17} width={30} height={6} fill="#f8fafc" rx={2} stroke="#cbd5e1" />
            <circle cx={30} cy={20} r={4} fill="#cbd5e1" />
            <circle cx={20} cy={20} r={1.5} fill="#475569" />
            <circle cx={40} cy={20} r={1.5} fill="#475569" />
          </g>
          {/* Text */}
          <text x={30} y={42} fill="#93c5fd" fontSize={7} textAnchor="middle" fontWeight="bold">SERVO SG90</text>
        </g>
      );
    }

    case 'gear_motor':
      return (
        <g>
          {/* Yellow gear box */}
          <rect width={50} height={80} fill="#eab308" stroke="#ca8a04" strokeWidth={2} rx={6} />
          {/* DC motor cylinder attached at bottom */}
          <rect x={10} y={45} width={30} height={30} fill="#64748b" rx={4} />
          {/* Steel shaft protruding */}
          <circle cx={25} cy={25} r={8} fill="#94a3b8" />
          <rect x={22} y={15} width={6} height={20} fill="#cbd5e1" />
          {/* Axle label */}
          <text x={25} y={72} fill="#1e293b" fontSize={7} textAnchor="middle" fontWeight="bold">GEARMOTOR</text>
        </g>
      );

    case 'npn_transistor':
      return (
        <g>
          {/* TO-92 flat face transistor package */}
          <path d="M 5 20 A 15 15 0 0 1 35 20 L 35 27 L 5 27 Z" fill="#1f2937" stroke="#111827" strokeWidth={1} />
          <rect x={5} y={27} width={30} height={3} fill="#111827" />

          {/* Three leads */}
          <line x1={10} y1={30} x2={10} y2={40} stroke="#94a3b8" strokeWidth={1.5} />
          <line x1={20} y1={30} x2={20} y2={40} stroke="#cbd5e1" strokeWidth={1.5} />
          <line x1={30} y1={30} x2={30} y2={40} stroke="#94a3b8" strokeWidth={1.5} />

          <text x={20} y={17} fill="#ffffff" fontSize={6} textAnchor="middle" fontWeight="bold">NPN</text>
          <text x={20} y={35} fill="#64748b" fontSize={5} textAnchor="middle">C B E</text>
        </g>
      );

    case 'led_rgb': {
      // Dynamic RGB color based on voltage
      // Map 0-5V to 0-255 RGB values
      const getPwmColor = (pinId: string) => {
        const v = getPinVoltage(pinId);
        return Math.min(255, Math.max(0, Math.round((v / 5.0) * 255)));
      };
      
      const r = properties.r !== undefined ? properties.r : getPwmColor('red');
      const g = properties.g !== undefined ? properties.g : getPwmColor('green');
      const b = properties.b !== undefined ? properties.b : getPwmColor('blue');
      const activeColor = `rgb(${r}, ${g}, ${b})`;
      const isRgbOn = r > 10 || g > 10 || b > 10;
      const rgbFilter = isRgbOn ? `drop-shadow(0px 0px 8px rgba(${r}, ${g}, ${b}, 0.8))` : 'none';
      
      return (
        <g>
          {/* Four long wire legs */}
          <line x1={10} y1={25} x2={10} y2={42} stroke="#cbd5e1" strokeWidth={1.5} />
          <line x1={18} y1={25} x2={18} y2={42} stroke="#94a3b8" strokeWidth={1.5} /> {/* Cathode */}
          <line x1={26} y1={25} x2={26} y2={42} stroke="#cbd5e1" strokeWidth={1.5} />
          <line x1={34} y1={25} x2={34} y2={42} stroke="#cbd5e1" strokeWidth={1.5} />

          {/* Milky frosted LED dome */}
          <path d="M 8 25 L 8 13 A 12 12 0 0 1 32 13 L 32 25 Z" fill="#e2e8f0" opacity={0.8} stroke="#cbd5e1" strokeWidth={1} style={{ transition: 'filter 80ms ease-in-out', filter: rgbFilter }} />
          <rect x={6} y={23} width={28} height={2} fill="#cbd5e1" />

          {/* Color mixing core visual */}
          <circle cx={20} cy={14} r={6} fill="#ffffff" opacity={0.6} />
          <circle cx={20} cy={14} r={4} fill={isRgbOn ? activeColor : '#94a3b8'} style={{ transition: 'fill 80ms ease-in-out' }} />
          
          {/* Glow if lit */}
          {isRgbOn && (
            <g>
              <circle cx={20} cy={14} r={18} fill={activeColor} opacity={0.25} className="pulse-glow pointer-events-none" />
              <circle cx={20} cy={14} r={28} fill="none" stroke={activeColor} strokeWidth={4} opacity={0.3} className="pulse-glow pointer-events-none" />
            </g>
          )}
        </g>
      );
    }

    case 'diode':
      return (
        <g>
          {/* Lead wire */}
          <line x1={0} y1={10} x2={60} y2={10} stroke="#94a3b8" strokeWidth={2} />
          {/* Diode body */}
          <rect x={15} y={4} width={30} height={12} fill="#1e293b" rx={1} stroke="#0f172a" strokeWidth={1} />
          {/* Cathode band (silver) */}
          <rect x={38} y={4} width={4} height={12} fill="#cbd5e1" />
        </g>
      );

    case 'photoresistor':
      return (
        <g>
          {/* Wires */}
          <line x1={12} y1={20} x2={12} y2={32} stroke="#94a3b8" strokeWidth={2} />
          <line x1={28} y1={20} x2={28} y2={32} stroke="#cbd5e1" strokeWidth={2} />
          {/* Ceramic base */}
          <circle cx={20} cy={15} r={12} fill="#fca5a5" stroke="#f87171" strokeWidth={1} />
          {/* Cadmium sulfide squiggly line */}
          <path d="M 12 12 Q 15 8, 17 12 T 22 12 T 27 12" fill="none" stroke="#dc2626" strokeWidth={1.8} strokeLinecap="round" />
        </g>
      );

    case 'soil_moisture':
      return (
        <g>
          {/* Probe PCB body */}
          <rect width={40} height={80} fill="#dc2626" stroke="#991b1b" strokeWidth={2} rx={4} />
          {/* Cutout gap for the two prongs */}
          <rect x={12} y={25} width={16} height={50} fill="#f8fafc" />
          {/* Metal contact trace lines on prongs */}
          <rect x={4} y={30} width={5} height={40} fill="#cbd5e1" rx={1} />
          <rect x={31} y={30} width={5} height={40} fill="#cbd5e1" rx={1} />
          
          {/* Connecting board strip */}
          <rect x={0} y={75} width={40} height={5} fill="#1e293b" />
          
          {/* Pins protruding */}
          <line x1={10} y1={80} x2={10} y2={85} stroke="#cbd5e1" strokeWidth={2.5} />
          <line x1={20} y1={80} x2={20} y2={85} stroke="#cbd5e1" strokeWidth={2.5} />
          <line x1={30} y1={80} x2={30} y2={85} stroke="#cbd5e1" strokeWidth={2.5} />
          
          <text x={20} y={15} fill="#ffffff" fontSize={7} textAnchor="middle" fontWeight="bold">SOIL</text>
        </g>
      );

  case 'arduino_nano':
      return (
        <g>
          <rect width={180} height={70} fill="#1d4ed8" stroke="#1e3a8a" strokeWidth={2} rx={6} />
          <rect x={70} y={20} width={30} height={30} fill="#1e293b" rx={2} />
          <text x={85} y={38} fill="#4b5563" fontSize={7} textAnchor="middle" fontWeight="bold">328P</text>
          <text x={90} y={15} fill="#93c5fd" fontSize={8} textAnchor="middle" fontWeight="bold">ARDUINO NANO</text>
          {Array.from({ length: 15 }).map((_, i) => (
            <g key={i}>
              <rect x={10 + i * 11} y={2} width={4} height={6} fill="#e2e8f0" />
              <rect x={10 + i * 11} y={62} width={4} height={6} fill="#e2e8f0" />
            </g>
          ))}
          <rect x={2} y={22} width={15} height={26} fill="#475569" rx={1} />
        </g>
      );

    case 'ir_sensor': {
      const isDetected = properties.detected || isPinActive('out');
      return (
        <g>
          <rect width={60} height={40} fill="#1e293b" stroke="#0f172a" strokeWidth={1.5} rx={4} />
          <circle cx={15} cy={12} r={5} fill="#3b82f6" opacity={0.8} stroke="#93c5fd" />
          <circle cx={45} cy={12} r={5} fill="#111827" stroke="#374151" />
          <circle cx={30} cy={28} r={3} fill={isDetected ? '#22c55e' : '#374151'} />
          <text x={30} y={38} fill="#64748b" fontSize={6} textAnchor="middle" fontWeight="bold">IR SENSOR</text>
        </g>
      );
    }

    case 'lcd':
      return (
        <g>
          <rect width={180} height={90} fill="#16a34a" stroke="#14532d" strokeWidth={3} rx={6} />
          <rect x={12} y={12} width={156} height={50} fill="#064e3b" stroke="#042f2c" strokeWidth={2} rx={2} />
          <text x={20} y={34} fill="#a7f3d0" fontSize={11} fontFamily="monospace" fontWeight="bold">
            {properties.text || 'CircuitLab 16x2'}
          </text>
          <text x={20} y={50} fill="#059669" fontSize={8} fontFamily="monospace">
            I2C Addr: 0x27
          </text>
          <text x={90} y={80} fill="#14532d" fontSize={7} textAnchor="middle" fontWeight="bold">GND VCC SDA SCL</text>
        </g>
      );

    case 'gate_and':
      return (
        <g>
          <rect width={70} height={50} fill="#1e293b" stroke="#334155" strokeWidth={2} rx={4} />
          <path d="M 25 15 L 35 15 A 10 10 0 0 1 35 35 L 25 35 Z" fill="none" stroke="#f59e0b" strokeWidth={2} />
          <text x={35} y={45} fill="#94a3b8" fontSize={7} textAnchor="middle" fontWeight="bold">AND GATE</text>
        </g>
      );

    case 'gate_or':
      return (
        <g>
          <rect width={70} height={50} fill="#1e293b" stroke="#334155" strokeWidth={2} rx={4} />
          <path d="M 22 15 Q 28 15 32 15 Q 42 25 32 35 Q 28 35 22 35 Q 25 25 22 15" fill="none" stroke="#f59e0b" strokeWidth={2} />
          <text x={35} y={45} fill="#94a3b8" fontSize={7} textAnchor="middle" fontWeight="bold">OR GATE</text>
        </g>
      );

    case 'gate_not':
      return (
        <g>
          <rect width={60} height={40} fill="#1e293b" stroke="#334155" strokeWidth={2} rx={4} />
          <polygon points="20,12 34,20 20,28" fill="none" stroke="#f59e0b" strokeWidth={2} />
          <circle cx={37} cy={20} r={2} fill="none" stroke="#f59e0b" strokeWidth={1.5} />
          <text x={30} y={36} fill="#94a3b8" fontSize={7} textAnchor="middle" fontWeight="bold">NOT GATE</text>
        </g>
      );

    case 'gate_xor':
      return (
        <g>
          <rect width={70} height={50} fill="#1e293b" stroke="#334155" strokeWidth={2} rx={4} />
          <path d="M 19 15 Q 23 25 19 35" fill="none" stroke="#f59e0b" strokeWidth={2} />
          <path d="M 22 15 Q 28 15 32 15 Q 42 25 32 35 Q 28 35 22 35 Q 25 25 22 15" fill="none" stroke="#f59e0b" strokeWidth={2} />
          <text x={35} y={45} fill="#94a3b8" fontSize={7} textAnchor="middle" fontWeight="bold">XOR GATE</text>
        </g>
      );

    case 'capacitor_ceramic':
      return (
        <g>
          <line x1={0} y1={10} x2={40} y2={10} stroke="#94a3b8" strokeWidth={1.5} />
          <circle cx={20} cy={10} r={7} fill="#d97706" stroke="#b45309" strokeWidth={1} />
          <text x={20} y={12} fill="#fff" fontSize={5} fontWeight="bold" textAnchor="middle">104</text>
        </g>
      );

    case 'inductor':
      return (
        <g>
          <line x1={0} y1={10} x2={50} y2={10} stroke="#94a3b8" strokeWidth={1.5} />
          <rect x={10} y={5} width={30} height={10} fill="#15803d" stroke="#166534" strokeWidth={1} rx={2} />
          {/* Coil loops */}
          <path d="M 12 10 Q 15 2 18 10 Q 21 2 24 10 Q 27 2 30 10 Q 33 2 36 10 Q 38 2 38 10" fill="none" stroke="#eab308" strokeWidth={1.2} />
        </g>
      );

    case 'zener_diode':
      return (
        <g>
          <line x1={0} y1={10} x2={50} y2={10} stroke="#94a3b8" strokeWidth={1.5} />
          {/* Glass orange diode body */}
          <rect x={15} y={4} width={20} height={12} fill="#f97316" opacity={0.8} stroke="#ea580c" strokeWidth={1} rx={1} />
          {/* Zener cathode line bent */}
          <path d="M 28 6 L 28 14 L 30 14" fill="none" stroke="#222" strokeWidth={1.5} />
          <path d="M 26 6 L 28 6" fill="none" stroke="#222" strokeWidth={1.5} />
        </g>
      );

    case 'pnp_transistor':
      return (
        <g>
          {/* TO-92 package layout */}
          <path d="M 8 32 L 8 16 A 12 12 0 0 1 32 16 L 32 32 Z" fill="#222" stroke="#333" strokeWidth={1} />
          <rect x={8} y={30} width={24} height={4} fill="#111" />
          <text x={20} y={23} fill="#888" fontSize={7} textAnchor="middle" fontWeight="bold">PNP</text>
          {/* Ticks for emitter, base, collector pins */}
          <circle cx={10} cy={30} r={2} fill="#64748b" />
          <circle cx={20} cy={10} r={2} fill="#64748b" />
          <circle cx={30} cy={30} r={2} fill="#64748b" />
        </g>
      );

    case 'mosfet':
      return (
        <g>
          {/* TO-220 shape package */}
          <rect x={5} y={5} width={30} height={30} fill="#222" stroke="#333" strokeWidth={1} rx={1} />
          {/* Metal tab */}
          <rect x={10} y={-2} width={20} height={8} fill="#94a3b8" rx={1} />
          <circle cx={20} cy={2} r={2} fill="#475569" />
          <text x={20} y={23} fill="#aaa" fontSize={6} textAnchor="middle" fontWeight="bold">MOS-N</text>
          {/* Pin dots */}
          <circle cx={10} cy={30} r={2} fill="#64748b" />
          <circle cx={20} cy={30} r={2} fill="#64748b" />
          <circle cx={30} cy={30} r={2} fill="#64748b" />
        </g>
      );

    case 'dip_switch':
      return (
        <g>
          {/* Red DIP switch body */}
          <rect width={60} height={40} fill="#b91c1c" stroke="#991b1b" strokeWidth={2} rx={2} />
          <text x={30} y={24} fill="#fecaca" fontSize={7} textAnchor="middle" fontWeight="bold">DIP SW</text>
          {/* 4 Switch slots and toggles */}
          {[10, 25, 40, 55].map((sx, idx) => (
            <g key={idx}>
              <rect x={sx - 3} y={8} width={6} height={24} fill="#440000" rx={1} />
              {/* Toggle actuator */}
              <rect x={sx - 2.5} y={properties[`state${idx+1}`] ? 8 : 22} width={5} height={10} fill="#fff" rx={0.5} />
            </g>
          ))}
        </g>
      );

    case 'toggle_switch':
      return (
        <g>
          {/* Blue body toggle switch */}
          <rect width={40} height={40} fill="#1d4ed8" stroke="#1e40af" strokeWidth={2} rx={2} />
          {/* Lever base */}
          <circle cx={20} cy={20} r={8} fill="#94a3b8" stroke="#64748b" strokeWidth={1} />
          {/* Toggle lever */}
          <line x1={20} y1={20} x2={properties.state ? 28 : 12} y2={10} stroke="#cbd5e1" strokeWidth={3} strokeLinecap="round" />
        </g>
      );

    case 'thermistor':
      return (
        <g>
          <line x1={0} y1={10} x2={45} y2={10} stroke="#94a3b8" strokeWidth={1.5} />
          <circle cx={22} cy={10} r={6} fill="#b45309" stroke="#78350f" strokeWidth={1} />
          <text x={22} y={12} fill="#fff" fontSize={5} fontWeight="bold" textAnchor="middle">NTC</text>
        </g>
      );

    case 'battery_aa':
      return (
        <g>
          {/* AA Battery Cylinder */}
          <rect width={80} height={30} fill="#333" stroke="#222" strokeWidth={1.5} rx={3} />
          {/* Gold highlight wrap */}
          <rect x={20} y={1} width={40} height={28} fill="#d97706" />
          {/* Positive nipple */}
          <rect x={80} y={8} width={3} height={14} fill="#fbbf24" rx={1} />
          <text x={40} y={18} fill="#fff" fontSize={8} fontWeight="bold" textAnchor="middle">AA 1.5V</text>
          <text x={70} y={19} fill="#fff" fontSize={11} fontWeight="bold">+</text>
          <text x={10} y={19} fill="#fff" fontSize={11} fontWeight="bold">-</text>
        </g>
      );

    case 'power_supply_5v':
      return (
        <g>
          {/* Bench power supply chassis */}
          <rect width={80} height={60} fill="#1e293b" stroke="#334155" strokeWidth={2} rx={4} />
          {/* LED display segment */}
          <rect x={15} y={10} width={50} height={20} fill="#090d16" rx={2} />
          <text x={40} y={25} fill="#ef4444" fontSize={12} fontFamily="monospace" fontWeight="bold" textAnchor="middle">5.00V</text>
          {/* Sockets */}
          <circle cx={20} cy={50} r={5} fill="#000" />
          <circle cx={20} cy={50} r={2} fill="#222" />
          <text x={20} y={42} fill="#94a3b8" fontSize={6} textAnchor="middle">-</text>
          
          <circle cx={60} cy={50} r={5} fill="#dc2626" />
          <circle cx={60} cy={50} r={2} fill="#fff" />
          <text x={60} y={42} fill="#fca5a5" fontSize={6} textAnchor="middle">+</text>
        </g>
      );

    case 'buzzer_passive':
      return (
        <g>
          <circle cx={30} cy={30} r={28} fill="#1f2937" stroke="#374151" strokeWidth={2} />
          {/* Center sound hole */}
          <circle cx={30} cy={30} r={8} fill="#111827" />
          <text x={30} y={48} fill="#6b7280" fontSize={7} textAnchor="middle" fontWeight="bold">PASSIVE</text>
        </g>
      );

    case 'speaker':
      return (
        <g>
          {/* Round Speaker Cone */}
          <circle cx={35} cy={35} r={33} fill="#111" stroke="#333" strokeWidth={2} />
          <circle cx={35} cy={35} r={20} fill="#222" stroke="#444" strokeWidth={1} />
          <circle cx={35} cy={35} r={8} fill="#000" />
          {/* Mounting frame ears */}
          <rect x={0} y={32} width={4} height={6} fill="#aaa" rx={1} />
          <rect x={66} y={32} width={4} height={6} fill="#aaa" rx={1} />
        </g>
      );

    case 'fuse':
      return (
        <g>
          <line x1={0} y1={7} x2={50} y2={7} stroke="#94a3b8" strokeWidth={1.5} />
          {/* Glass body */}
          <rect x={8} y={2} width={34} height={10} fill="#cbd5e1" opacity={0.6} stroke="#64748b" strokeWidth={0.5} />
          {/* Metal caps */}
          <rect x={8} y={2} width={6} height={10} fill="#94a3b8" />
          <rect x={36} y={2} width={6} height={10} fill="#94a3b8" />
          {/* Internal filament */}
          <line x1={14} y1={7} x2={36} y2={7} stroke="#ef4444" strokeWidth={0.8} />
        </g>
      );

    case 'shift_register_74hc595':
      return (
        <g>
          <rect width={100} height={50} fill="#1e293b" stroke="#334155" strokeWidth={2} rx={3} />
          <circle cx={5} cy={25} r={3} fill="#111" /> {/* Pin 1 index notch */}
          <text x={50} y={29} fill="#64748b" fontSize={9} fontWeight="bold" fontFamily="monospace" textAnchor="middle">74HC595</text>
        </g>
      );

    case 'hex_inverter_74hc04':
      return (
        <g>
          <rect width={90} height={50} fill="#1e293b" stroke="#334155" strokeWidth={2} rx={3} />
          <circle cx={5} cy={25} r={3} fill="#111" />
          <text x={45} y={29} fill="#64748b" fontSize={9} fontWeight="bold" fontFamily="monospace" textAnchor="middle">74HC04</text>
        </g>
      );

    case 'gate_nand_74hc00':
      return (
        <g>
          <rect width={90} height={50} fill="#1e293b" stroke="#334155" strokeWidth={2} rx={3} />
          <circle cx={5} cy={25} r={3} fill="#111" />
          <text x={45} y={29} fill="#64748b" fontSize={9} fontWeight="bold" fontFamily="monospace" textAnchor="middle">74HC00</text>
        </g>
      );

    case 'timer_ic_555':
      return (
        <g>
          <rect width={60} height={50} fill="#1e293b" stroke="#334155" strokeWidth={2} rx={3} />
          <circle cx={5} cy={25} r={2.5} fill="#111" />
          <text x={30} y={29} fill="#64748b" fontSize={9} fontWeight="bold" fontFamily="monospace" textAnchor="middle">NE555</text>
        </g>
      );

    case 'opamp_lm741':
      return (
        <g>
          <rect width={60} height={50} fill="#1e293b" stroke="#334155" strokeWidth={2} rx={3} />
          <circle cx={5} cy={25} r={2.5} fill="#111" />
          <text x={30} y={29} fill="#64748b" fontSize={9} fontWeight="bold" fontFamily="monospace" textAnchor="middle">LM741</text>
        </g>
      );

    case 'voltage_reg_7805':
      return (
        <g>
          <rect width={40} height={50} fill="#222" stroke="#333" strokeWidth={1} rx={1} />
          {/* TO-220 tab */}
          <rect x={10} y={-5} width={20} height={10} fill="#94a3b8" rx={1} />
          <circle cx={20} cy={0} r={2.5} fill="#475569" />
          <text x={20} y={28} fill="#aaa" fontSize={8} textAnchor="middle" fontWeight="bold">7805</text>
        </g>
      );

    case 'seven_segment': {
      return (
        <g>
          {/* Display case */}
          <rect width={60} height={80} fill="#111" stroke="#333" strokeWidth={2} rx={4} />
          {/* Segment display drawing area */}
          <rect x={10} y={12} width={40} height={56} fill="#050505" rx={2} />
          {/* Segments a-g drawing */}
          <g opacity={0.15}>
            {/* a */} <rect x={18} y={16} width={24} height={4} fill="#f00" rx={1} />
            {/* b */} <rect x={38} y={18} width={4} height={20} fill="#f00" rx={1} />
            {/* c */} <rect x={38} y={40} width={4} height={20} fill="#f00" rx={1} />
            {/* d */} <rect x={18} y={58} width={24} height={4} fill="#f00" rx={1} />
            {/* e */} <rect x={18} y={40} width={4} height={20} fill="#f00" rx={1} />
            {/* f */} <rect x={18} y={18} width={4} height={20} fill="#f00" rx={1} />
            {/* g */} <rect x={20} y={37} width={20} height={4} fill="#f00" rx={1} />
            {/* dp */} <circle cx={46} cy={60} r={3} fill="#f00" />
          </g>
          {/* Active segments */}
          <g>
            {isPinActive('a') && <rect x={18} y={16} width={24} height={4} fill="#f00" rx={1} style={{ filter: 'drop-shadow(0 0 3px #f00)' }} />}
            {isPinActive('b') && <rect x={38} y={18} width={4} height={20} fill="#f00" rx={1} style={{ filter: 'drop-shadow(0 0 3px #f00)' }} />}
            {isPinActive('c') && <rect x={38} y={40} width={4} height={20} fill="#f00" rx={1} style={{ filter: 'drop-shadow(0 0 3px #f00)' }} />}
            {isPinActive('d') && <rect x={18} y={58} width={24} height={4} fill="#f00" rx={1} style={{ filter: 'drop-shadow(0 0 3px #f00)' }} />}
            {isPinActive('e') && <rect x={18} y={40} width={4} height={20} fill="#f00" rx={1} style={{ filter: 'drop-shadow(0 0 3px #f00)' }} />}
            {isPinActive('f') && <rect x={18} y={18} width={4} height={20} fill="#f00" rx={1} style={{ filter: 'drop-shadow(0 0 3px #f00)' }} />}
            {isPinActive('g') && <rect x={20} y={37} width={20} height={4} fill="#f00" rx={1} style={{ filter: 'drop-shadow(0 0 3px #f00)' }} />}
            {isPinActive('dp') && <circle cx={46} cy={60} r={3} fill="#f00" style={{ filter: 'drop-shadow(0 0 3px #f00)' }} />}
          </g>
        </g>
      );
    }

    case 'oled':
      return (
        <g>
          {/* Blue PCB */}
          <rect width={100} height={80} fill="#1e3a8a" stroke="#172554" strokeWidth={2} rx={4} />
          {/* Glass display */}
          <rect x={10} y={10} width={80} height={50} fill="#000" rx={2} stroke="#172554" strokeWidth={1} />
          <text x={50} y={36} fill="#60a5fa" fontSize={8} fontFamily="monospace" textAnchor="middle" fontWeight="bold">SSD1306</text>
          <text x={50} y={48} fill="#3b82f6" fontSize={6} fontFamily="monospace" textAnchor="middle">128 x 64 I2C</text>
        </g>
      );

    case 'led_matrix':
      return (
        <g>
          <rect width={80} height={80} fill="#1e293b" stroke="#334155" strokeWidth={2} rx={4} />
          {/* Grid of LEDs */}
          {Array.from({ length: 8 }).map((_, r) => 
            Array.from({ length: 8 }).map((_, c) => (
              <circle
                key={`${r}-${c}`}
                cx={13 + c * 8}
                cy={13 + r * 8}
                r={2.5}
                fill={isPinActive(`r${r+1}`) && isPinActive(`c${c+1}`) ? '#f43f5e' : '#444'}
                stroke="#222"
                strokeWidth={0.5}
              />
            ))
          )}
        </g>
      );

    case 'neopixel':
      return (
        <g>
          {/* Strip flex PCB */}
          <rect width={150} height={30} fill="#fff" stroke="#ccc" strokeWidth={1.5} rx={3} />
          <text x={75} y={12} fill="#666" fontSize={6} fontWeight="bold" textAnchor="middle">NeoPixel WS2812B</text>
          {/* Draw 5 NeoPixels on the strip */}
          {[35, 55, 75, 95, 115].map((px, idx) => (
            <g key={idx}>
              {/* White ceramic LED package */}
              <rect x={px - 5} y={15} width={10} height={10} fill="#fafafa" stroke="#ddd" strokeWidth={0.5} />
              {/* LED emitter surface */}
              <circle cx={px} cy={20} r={3.5} fill={isPinActive('din') ? '#38bdf8' : '#777'} />
            </g>
          ))}
        </g>
      );

    default:
      return (
        <g>
          <rect width={60} height={40} fill="#334155" stroke="#1e293b" strokeWidth={2} rx={4} />
          <text x={30} y={24} fill="#ffffff" fontSize={8} textAnchor="middle">{name}</text>
        </g>
      );
  }
};
