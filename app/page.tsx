'use client';

import { useEffect, useState } from 'react';
import {
  BookOpen, Box, ChevronRight, CircleHelp, FileClock, Heart, Layers3, Map,
  Menu, Play, Settings2, Swords, UserRound
} from 'lucide-react';

type View = 'new-game' | 'game' | 'timeline' | 'generators' | 'options' | 'guide' | 'deck' | 'veil';
type Character = { id: string; name: string; title: string; element: string; symbol: string; detail: string };
type Card = { id: string; rank?: string; suit?: string; type: string; element?: string; value?: number; cardBack?: string };

const characters: Character[] = [
  { id: 'air', name: 'AERIS', title: 'AIR WARRIOR', element: 'AIR', symbol: '◌', detail: 'Initiative +1' },
  { id: 'fire', name: 'BRANN', title: 'FIRE ELF', element: 'FIRE', symbol: '△', detail: 'Attack +1' },
  { id: 'water', name: 'MIRA', title: 'WATER PRIEST', element: 'WATER', symbol: '◈', detail: 'Recovery +1' },
  { id: 'earth', name: 'DORR', title: 'EARTH DWARF', element: 'EARTH', symbol: '□', detail: 'Defense +1' }
];

const nav = [
  { label: 'PLAY', items: [{ id: 'new-game', label: 'New Game', icon: Play }] },
  { label: 'ADMIN', items: [{ id: 'options', label: 'Options', icon: Settings2 }, { id: 'generators', label: 'Generator Tools', icon: Box }, { id: 'timeline', label: 'Timeline', icon: FileClock }] },
  { label: 'GUIDE', items: [{ id: 'guide', label: 'Documentation', icon: BookOpen }, { id: 'guide', label: 'Help / Commands', icon: CircleHelp }] }
] satisfies { label: string; items: { id: View; label: string; icon: typeof Play }[] }[];

function Button({ children, onClick, variant = 'primary', className = '' }: { children: React.ReactNode; onClick?: () => void; variant?: 'primary' | 'secondary' | 'amber' | 'ghost'; className?: string }) {
  const variants = {
    primary: 'border-[#48efa6] bg-[#123a2c] text-[#48efa6] hover:bg-[#48efa6] hover:text-[#06100e]',
    secondary: 'border-[#2a6354] text-[#8fbaa9] hover:border-[#48efa6] hover:text-[#48efa6]',
    amber: 'border-[#ffca5c] bg-[#332b18] text-[#ffca5c] hover:bg-[#ffca5c] hover:text-[#241b08]',
    ghost: 'border-transparent text-[#6e9889] hover:bg-[#143229] hover:text-[#48efa6]'
  };
  return <button onClick={onClick} className={`border px-4 py-2.5 text-[11px] font-bold tracking-[.08em] transition ${variants[variant]} ${className}`}>{children}</button>;
}

function Panel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <section className={`panel p-5 ${className}`}>{children}</section>;
}

function SectionTitle({ eyebrow, title, copy, stamp }: { eyebrow: string; title: string; copy: string; stamp: string }) {
  return <div className="mb-8 flex items-end justify-between gap-6"><div><p className="mb-2 text-[10px] tracking-[.2em] text-[#ffca5c]">{eyebrow}</p><h1 className="glow text-3xl font-bold tracking-[.05em] text-[#48efa6]">{title}</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-[#6e9889]">{copy}</p></div><span className="whitespace-nowrap text-[10px] text-[#6e9889]">{stamp}</span></div>;
}

function Timeline({ compact = false }: { compact?: boolean }) {
  const rows = [
    ['T+00:00', 'Engine handshake', 'Admin layer listening for deterministic test commands.', true],
    ['T+00:01', 'Character selection', 'Starting boon and opening hand are staged next.', false],
    ['T+02:00', 'Maze entry', 'Enter the top-left room and begin the adventure loop.', false]
  ];
  return <div className="space-y-0">{rows.map(([time, title, copy, done]) => <div className="grid min-h-[66px] grid-cols-[72px_20px_1fr] items-center gap-4 border-b border-[#285f5233] last:border-0" key={String(title)}><span className="text-[10px] text-[#6e9889]">{time}</span><span className={`relative h-3.5 w-3.5 rounded-full border ${done ? 'border-[#48efa6] bg-[#48efa6] shadow-[0_0_8px_#48efa6]' : 'border-[#2a6354] bg-[#06100e]'}`} /><div><strong className="text-xs">{title}</strong>{!compact && <p className="mt-1 text-[11px] text-[#6e9889]">{copy}</p>}</div></div>)}</div>;
}

function Dashboard({ seed, setSeed, begin }: { seed: number; setSeed: (value: number) => void; begin: () => void }) {
  return <><SectionTitle eyebrow="PLAY // INITIALIZE" title="NEW ADVENTURE" copy="Seed a deterministic run, choose your first hero, and enter the maze. Every action in this console is recorded to the run timeline." stamp="SESSION READY" /><div className="grid grid-cols-12 gap-4"><Panel className="col-span-7"><h2 className="text-sm font-bold text-[#48efa6]">RUN INITIALIZATION</h2><p className="mt-2 text-xs text-[#6e9889]">Choose a debug seed or enter your own deterministic value.</p><div className="mt-5 flex flex-wrap gap-3"><input value={seed} onChange={(e) => setSeed(Number(e.target.value))} type="number" className="w-36 border border-[#2a6354] bg-[#06100e] px-3 py-2.5 text-sm outline-none focus:border-[#48efa6]" /><Button onClick={begin}>INITIALIZE RUN <ChevronRight className="inline" size={13} /></Button><Button variant="secondary" onClick={() => setSeed(Math.floor(1000 + Math.random() * 8999))}>RANDOMIZE</Button></div><div className="mt-7"><p className="text-[10px] tracking-[.13em] text-[#6e9889]">PRECOMPILED DEBUG RUNS</p><div className="mt-3 flex flex-wrap gap-2">{[1001, 2002, 3003].map((value) => <Button key={value} variant="secondary" className="px-2.5 py-1.5 text-[10px]" onClick={() => setSeed(value)}>{value === 1001 ? 'AIR' : value === 2002 ? 'FIRE' : 'WATER'} / {value}</Button>)}</div></div></Panel><Panel className="col-span-5"><h2 className="text-sm font-bold text-[#48efa6]">PHASE 01 STATUS</h2><div className="my-3 text-3xl text-[#48efa6]">SOLO</div><p className="text-[10px] text-[#6e9889]">PLAYER MODE // ACTIVE</p>{['Deterministic deck', '3 × 3 map grid', 'Mixed lineages', 'Multiplayer'].map((item, index) => <div className="flex justify-between border-b border-[#285f5233] py-3 text-xs text-[#6e9889]" key={item}><span>{item}</span><span className={`h-4 w-8 border ${index < 2 ? 'border-[#48efa6] bg-[#1d694f]' : 'border-[#2a6354] bg-[#19352c]'}`}><i className={`block h-2.5 w-2.5 m-[2px] ${index < 2 ? 'ml-[18px] bg-[#48efa6]' : 'bg-[#6e9889]'}`} /></span></div>)}</Panel><Panel className="col-span-12"><h2 className="mb-3 text-sm font-bold text-[#48efa6]">OPERATOR BRIEF</h2><Timeline /></Panel></div></>;
}

function NewGame({ seed, characterId, boon, setCharacterId, setBoon, confirm }: { seed: number; characterId: string; boon: string; setCharacterId: (value: string) => void; setBoon: (value: string) => void; confirm: () => void }) {
  return <><SectionTitle eyebrow="NEW GAME // STAGE 01" title="SELECT YOUR HERO" copy="Choose a starting Ace. Secondary alignment is reserved for a later phase and remains locked in this build." stamp={`SEED ${seed}`} /><div className="grid grid-cols-12 gap-4"><div className="col-span-8 grid grid-cols-2 gap-4">{characters.map((character) => <button key={character.id} onClick={() => setCharacterId(character.id)} className={`panel relative p-5 text-left transition hover:border-[#48efa6] ${characterId === character.id ? 'border-[#48efa6] shadow-[0_0_20px_#48efa622]' : ''}`}><span className="text-2xl text-[#48efa6]">{character.symbol}</span><h2 className="mt-4 text-sm text-[#48efa6]">{character.name}</h2><p className="mt-2 text-xs">{character.title}</p><div className="mt-6 flex justify-between text-[10px] text-[#6e9889]"><span>{character.detail}</span><span>{character.element}</span></div>{characterId === character.id && <span className="absolute right-4 top-4 text-[9px] text-[#48efa6]">SELECTED</span>}</button>)}</div><Panel className="col-span-4"><h2 className="text-sm font-bold text-[#48efa6]">STARTING BOON</h2><p className="my-3 text-xs leading-5 text-[#6e9889]">One auxiliary card enters your hand before the first room.</p>{[['water', '2 OF WATER', 'INITIATIVE'], ['earth', '3 OF EARTH', 'RESISTANCE']].map(([id, name, note]) => <button key={id} onClick={() => setBoon(id)} className={`mb-2 w-full border p-3 text-left text-xs ${boon === id ? 'border-[#ffca5c] text-[#ffca5c]' : 'border-[#285f5288] text-[#b6f7d5]'}`}>{name} <span className="text-[#6e9889]">// {note}</span></button>)}<div className="mb-1 mt-1 w-full border border-[#285f5244] p-3 text-xs text-[#50776a]">SECONDARY ALIGNMENT <span>// LOCKED</span></div><Button onClick={confirm} className="mt-4 w-full">CONFIRM LOADOUT <ChevronRight className="inline" size={13} /></Button></Panel></div></>;
}

function RunReady({ seed, characterId, boon, enter }: { seed: number; characterId: string; boon: string; enter: () => void }) {
  const character = characters.find((item) => item.id === characterId) ?? characters[0];
  return <><SectionTitle eyebrow="NEW GAME // STAGE 02" title="RUN READY" copy="Loadout confirmed. The first card is waiting at the entrance to the 3 × 3 maze." stamp={`RUN-${seed}`} /><div className="grid grid-cols-12 gap-4"><Panel className="col-span-5"><h2 className="text-sm font-bold text-[#48efa6]">CHARACTER LOADOUT</h2><div className="my-3 text-3xl text-[#48efa6]">ACE</div><p className="text-xs">{character.title} // {character.element}</p>{[['Health tokens', '♥ ♥ ♥'], ['Opening boon', boon.toUpperCase()], ['Hand limit', '07']].map(([label, value]) => <div className="flex justify-between border-b border-[#285f5233] py-3 text-xs text-[#6e9889]" key={label}><span>{label}</span><strong className="text-[#b6f7d5]">{value}</strong></div>)}<Button onClick={enter} className="mt-5 w-full">ENTER THE MAZE <ChevronRight className="inline" size={13} /></Button></Panel><Panel className="col-span-7"><h2 className="mb-3 text-sm font-bold text-[#48efa6]">ADVENTURE TIMELINE</h2><Timeline /></Panel></div></>;
}

function TimelineView() { return <><SectionTitle eyebrow="ADMIN // OBSERVER" title="ADVENTURE TIMELINE" copy="A living sequence of the current session. Use the controls to inspect the state machine without leaving the console." stamp="LIVE LOG" /><div className="grid grid-cols-12 gap-4"><Panel className="col-span-8"><Timeline /></Panel><Panel className="col-span-4"><h2 className="text-sm font-bold text-[#48efa6]">STEP CONTROLS</h2><Button className="mt-5 w-full">ADVANCE ONE STEP</Button><Button variant="secondary" className="mt-2 w-full">RESET TIMELINE</Button></Panel></div></>; }

function Generators() {
  const [tab, setTab] = useState('MONSTERS');
  const [element, setElement] = useState('fire');
  const [category, setCategory] = useState('beasts-birds');
  const [rank, setRank] = useState('3');
  const [result, setResult] = useState<any | null>(null);
  const generate = async () => {
    const endpoint = tab === 'MONSTERS' ? '/api/generate-monster' : tab === 'ITEMS' ? '/api/generate-item' : '/api/generate-trap';
    const generatorRank = tab === 'MONSTERS' ? rank : ['J', 'Q', 'K'].includes(rank) ? '9' : rank;
    const response = await fetch(endpoint, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ seed: 1001, element, category: tab === 'MONSTERS' ? category : undefined, rank: generatorRank }) });
    if (response.ok) setResult(await response.json());
  };
  if (tab === 'ITEMS' || tab === 'TRAPS') {
    return <><SectionTitle eyebrow="ADMIN // FACTORY" title={`${tab} GENERATOR`} copy="The card supplies the rank, power, and element. This JSON-backed table supplies the cosmetic name and thematic function." stamp="CORE EXPANSION" /><Panel><div className="grid grid-cols-1 gap-4 md:grid-cols-2"><label className="text-[10px] text-[#6e9889]">ELEMENT<select value={element} onChange={(event) => setElement(event.target.value)} className="mt-2 w-full border border-[#2a6354] bg-[#06100e] p-2.5 text-xs text-[#b6f7d5]"><option value="air">AIR</option><option value="fire">FIRE</option><option value="water">WATER</option><option value="earth">EARTH</option></select></label><label className="text-[10px] text-[#6e9889]">SOURCE CARD RANK<select value={rank} onChange={(event) => setRank(event.target.value)} className="mt-2 w-full border border-[#2a6354] bg-[#06100e] p-2.5 text-xs text-[#b6f7d5]">{['A', '2', '3', '4', '5', '6', '7', '8', '9'].map((item) => <option key={item}>{item}</option>)}</select></label></div>{result && <div className="mt-5 border border-[#48efa6] bg-[#102d22] p-4"><p className="text-[10px] tracking-[.15em] text-[#ffca5c]">GENERATED {tab.slice(0, -1)}</p><div className="mt-2 flex flex-wrap items-baseline gap-x-5 gap-y-2"><strong className="text-xl text-[#48efa6]">{result.name}</strong><span className="text-xs text-[#b6f7d5]">{result.element.toUpperCase()}</span><span className="text-xs text-[#6e9889]">{result.categoryLabel}</span></div><p className="mt-3 text-xs text-[#6e9889]">RANK {result.rank} // POWER {result.power} // PV {result.pv}{result.resistance ? ` // RESISTANCE ${result.resistance}` : ''}</p></div>}<Button onClick={generate} className="mt-5">GENERATE {tab}</Button></Panel></>;
  }
  const content = tab === 'DICE' ? <pre className="mt-5 min-h-44 whitespace-pre-wrap border border-[#285f5244] bg-[#050b0a] p-4 text-xs leading-7 text-[#81c5a9]">{'EVENT_DIE  1d6\n\n1 — ambush by monster\n2 — enemy detected\n3 — surprise trap\n4 — detected trap\n5 — treasure\n6 — treasure'}</pre> : tab === 'MONSTERS' ? <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3"><label className="text-[10px] text-[#6e9889]">ELEMENT<select value={element} onChange={(event) => setElement(event.target.value)} className="mt-2 w-full border border-[#2a6354] bg-[#06100e] p-2.5 text-xs text-[#b6f7d5]"><option value="air">AIR</option><option value="fire">FIRE</option><option value="water">WATER</option><option value="earth">EARTH</option></select></label><label className="text-[10px] text-[#6e9889]">FAMILY<select value={category} onChange={(event) => setCategory(event.target.value)} className="mt-2 w-full border border-[#2a6354] bg-[#06100e] p-2.5 text-xs text-[#b6f7d5]"><option value="beasts-birds">BEASTS / BIRDS</option><option value="insects">INSECTS</option><option value="constructs-golems">CONSTRUCTS / GOLEMS</option><option value="aquatic-creatures">AQUATIC CREATURES</option><option value="crystalline-minerals">CRYSTALLINE / MINERALS</option><option value="oozes-mud">OOZES / MUD</option></select></label><label className="text-[10px] text-[#6e9889]">SOURCE CARD<select value={rank} onChange={(event) => setRank(event.target.value)} className="mt-2 w-full border border-[#2a6354] bg-[#06100e] p-2.5 text-xs text-[#b6f7d5]">{['A', '2', '3', '4', '5', '6', '7', '8', '9', 'J', 'Q', 'K'].map((item) => <option key={item}>{item}</option>)}</select></label></div> : <pre className="mt-5 min-h-44 whitespace-pre-wrap border border-[#285f5244] bg-[#050b0a] p-4 text-xs leading-7 text-[#81c5a9]">{`GENERATOR  ${tab}\nSEED       LINKED\nSTATUS     READY\nOUTPUT     ${tab === 'CHARACTERS' ? 'AERIS // AIR WARRIOR // ACE' : '3 OF EARTH // PV 03'}`}</pre>;
  return <><SectionTitle eyebrow="ADMIN // FACTORY" title="GENERATOR TOOLS" copy="Cards provide the mechanics. JSON expansion data provides the cosmetic vocabulary and content definitions for monsters, items, and traps." stamp="SEED LINKED" /><Panel><div className="flex flex-wrap gap-5 border-b border-[#2a6354]">{['MONSTERS', 'ITEMS', 'TRAPS', 'CHARACTERS', 'DICE'].map((item) => <button key={item} onClick={() => { setTab(item); setResult(null); }} className={`pb-3 text-[11px] ${tab === item ? 'border-b-2 border-[#48efa6] text-[#48efa6]' : 'text-[#6e9889]'}`}>{item}</button>)}</div>{content}{result && ['MONSTERS', 'ITEMS', 'TRAPS'].includes(tab) && <div className="mt-5 border border-[#48efa6] bg-[#102d22] p-4"><p className="text-[10px] tracking-[.15em] text-[#ffca5c]">GENERATED {tab.slice(0, -1)}</p><div className="mt-2 flex flex-wrap items-baseline gap-x-5 gap-y-2"><strong className="text-xl text-[#48efa6]">{result.name}</strong><span className="text-xs text-[#b6f7d5]">{result.element.toUpperCase()}</span><span className="text-xs text-[#6e9889]">{result.categoryLabel || result.category}</span></div><p className="mt-3 text-xs text-[#6e9889]">SOURCE RANK {result.rank} // POWER {result.power} // PV {result.pv}{result.resistance ? ` // RESISTANCE ${result.resistance}` : result.size ? ` // SIZE ${result.size} // HEALTH ${result.health}` : ''}</p></div>}<div className="mt-4 flex gap-2"><Button onClick={generate}>GENERATE {tab}</Button><Button variant="secondary">COPY SEED</Button></div></Panel></>;
}

function Options() { return <><SectionTitle eyebrow="ADMIN // TDS" title="OPTIONS" copy="Toggle default settings for the Phase 1 test harness. These values are the first revision surface and are safe to replace." stamp="TDS CONFIG" /><div className="grid grid-cols-12 gap-4"><Panel className="col-span-7"><h2 className="text-sm font-bold text-[#48efa6]">TOGGLE DEFAULT SETTINGS</h2>{['Solo player mode', 'Strictly surpass resistance', 'Mixed elemental lineages', 'Extra health pools', 'Multiplayer'].map((item, i) => <div className="flex justify-between border-b border-[#285f5233] py-3 text-xs text-[#6e9889]" key={item}><span>{item}</span><span className={`h-4 w-8 border ${i < 2 ? 'border-[#48efa6] bg-[#1d694f]' : 'border-[#2a6354] bg-[#19352c]'}`} /></div>)}<Button variant="amber" className="mt-5">COMMIT TDS CHANGES</Button></Panel><Panel className="col-span-5"><h2 className="text-sm font-bold text-[#48efa6]">RUNTIME LIMITS</h2><div className="mt-5 grid grid-cols-2 gap-4 text-xs"><label className="text-[#6e9889]">HAND LIMIT<input className="mt-2 w-full border border-[#2a6354] bg-[#06100e] p-2.5 text-[#b6f7d5]" value="7" readOnly /></label><label className="text-[#6e9889]">START HEALTH<input className="mt-2 w-full border border-[#2a6354] bg-[#06100e] p-2.5 text-[#b6f7d5]" value="3" readOnly /></label><label className="col-span-2 text-[#6e9889]">MAP LAYOUT<select className="mt-2 w-full border border-[#2a6354] bg-[#06100e] p-2.5 text-[#b6f7d5]"><option>3 × 3 // MVP</option><option>3 × 9 // DEFERRED</option><option>4 × 6 // DEFERRED</option></select></label></div></Panel></div></>; }

function Guide() { return <><SectionTitle eyebrow="GUIDE // QUICK REFERENCE" title="DOCUMENTATION" copy="A compact operator guide for the first playable loop. Keep this panel close while testing and replace it freely in the next revision." stamp="HELP INDEX" /><div className="grid grid-cols-12 gap-4"><Panel className="col-span-7"><h2 className="text-sm font-bold text-[#48efa6]">CORE LOOP</h2><pre className="mt-4 whitespace-pre-wrap border border-[#285f5244] bg-[#050b0a] p-4 text-xs leading-7 text-[#81c5a9]">{'01  SELECT ACE CHARACTER\n02  RECEIVE TWO OPENING CARDS\n03  ENTER THE NORTHWEST ROOM\n04  ROLL THE 1d6 EVENT DIE\n05  RESOLVE / COMMIT CARDS\n06  COLLECT TREASURE OR LOSE HEALTH'}</pre></Panel><Panel className="col-span-5"><h2 className="text-sm font-bold text-[#48efa6]">ELEMENTAL CYCLE</h2><p className="mt-4 text-sm leading-8 text-[#6e9889]">WATER <b className="text-[#ffca5c]">&gt;</b> FIRE<br />FIRE <b className="text-[#ffca5c]">&gt;</b> EARTH<br />EARTH <b className="text-[#ffca5c]">&gt;</b> AIR<br />AIR <b className="text-[#ffca5c]">&gt;</b> WATER</p></Panel></div></>; }

function DeckView() {
  const suits = ['spades', 'hearts', 'diamonds', 'clubs'];
  const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', 'J', 'Q', 'K'];
  const colors: Record<string, string> = { spades: '♠', hearts: '♥', diamonds: '♦', clubs: '♣' };
  const cards = suits.flatMap((suit) => ranks.map((rank) => ({ suit, rank })));
  return <><SectionTitle eyebrow="ADMIN // CARDS" title="DECK VIEW" copy="The Phase 1 poker deck is the content system: 48 numbered and royal cards, 10s removed, plus four elemental Jokers." stamp="52 CARDS" /><div className="grid grid-cols-12 gap-4"><Panel className="col-span-8"><div className="mb-4 flex items-center justify-between"><h2 className="text-sm font-bold text-[#48efa6]">STANDARD DECK // 48</h2><span className="text-[10px] text-[#6e9889]">10s REMOVED</span></div><div className="grid grid-cols-6 gap-2 sm:grid-cols-8 md:grid-cols-12">{cards.map((card) => <div key={`${card.rank}-${card.suit}`} className={`flex aspect-[.72] flex-col justify-between border border-[#2a6354] bg-[#0a1714] p-1.5 text-[10px] ${card.suit === 'hearts' || card.suit === 'diamonds' ? 'text-[#ff9b81]' : 'text-[#b6f7d5]'}`}><span>{card.rank}</span><span className="self-center text-base">{colors[card.suit]}</span><span className="self-end text-[9px]">{card.rank === 'J' || card.rank === 'Q' || card.rank === 'K' ? 'ROYAL' : card.suit.slice(0, 1).toUpperCase()}</span></div>)}</div></Panel><Panel className="col-span-4"><h2 className="text-sm font-bold text-[#48efa6]">ELEMENTAL JOKERS</h2><div className="mt-4 space-y-2">{['AIR', 'FIRE', 'WATER', 'EARTH'].map((element) => <div key={element} className="flex items-center justify-between border border-[#285f5288] p-3 text-xs"><span className="text-[#ffca5c]">JOKER</span><strong>{element}</strong><span className="text-[10px] text-[#6e9889]">ULTIMATE</span></div>)}</div><div className="mt-6 border-t border-[#285f5244] pt-4 text-xs leading-6 text-[#6e9889]">Royal cards use the distinct royal back. Jokers are reserved for the altar system and do not enter the Level 01 run.</div></Panel></div></>;
}

function GameLoop({ run, onRun, onTerminal }: { run: any; onRun: (next: any) => void; onTerminal: (message: string) => void }) {
  const [room, setRoom] = useState<any | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const reveal = async (row: number, column: number) => {
    setBusy(true);
    try {
      const response = await fetch('/api/game', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ action: 'reveal', runId: run.id, row, column }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setRoom(data.room); onRun(data.run); onTerminal(`room ${row}-${column} revealed // ${data.room.event.type.toUpperCase()}`);
    } catch (error) { onTerminal(error instanceof Error ? error.message : 'room reveal failed'); } finally { setBusy(false); }
  };
  const resolve = async () => {
    if (!room) return;
    setBusy(true);
    try {
      const response = await fetch('/api/game', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ action: 'resolve', runId: run.id, row: room.row, column: room.column, cardIds: selected }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setRoom(data.room); onRun(data.run); setSelected([]); onTerminal(`room resolved // ${data.room.event.status.toUpperCase()}`);
    } catch (error) { onTerminal(error instanceof Error ? error.message : 'room resolution failed'); } finally { setBusy(false); }
  };
  const activeEvent = room?.event;
  return <><SectionTitle eyebrow="PLAY // LIVE RUN" title="THE MAZE" copy="Reveal a room, read the event, and commit cards from your hand to cross its resistance. The backend owns the deterministic result." stamp={`RUN ${run.seed}`} /><div className="grid grid-cols-12 gap-4"><Panel className="col-span-5"><div className="mb-4 flex items-center justify-between"><h2 className="text-sm font-bold text-[#48efa6]">3 × 3 MAZE</h2><span className="text-xs text-[#ffca5c]">HP {run.character.health} / {run.character.maxHealth}</span></div><div className="grid grid-cols-3 gap-2">{run.rooms.map((tile: any) => <button key={tile.id} onClick={() => reveal(tile.row, tile.column)} disabled={busy || tile.revealed} className={`aspect-square border text-xs transition ${tile.revealed ? 'border-[#48efa6] bg-[#143229] text-[#48efa6]' : 'border-[#2a6354] bg-[#081411] text-[#6e9889] hover:border-[#48efa6]'} ${tile.row === run.position.row && tile.column === run.position.column ? 'ring-1 ring-[#ffca5c]' : ''}`}><Map className="mx-auto mb-1" size={16} />{tile.revealed ? tile.event?.type?.toUpperCase() : `${tile.row}-${tile.column}`}</button>)}</div><p className="mt-4 text-[10px] leading-5 text-[#6e9889]">Top-left is the entry point. Choose an unrevealed room to move and flip its card.</p></Panel><Panel className="col-span-7"><div className="mb-4 flex items-center justify-between"><h2 className="text-sm font-bold text-[#48efa6]">ENCOUNTER RESOLUTION</h2><span className="text-[10px] text-[#6e9889]">{activeEvent ? `DIE ${activeEvent.roll} // ${activeEvent.detection}` : 'NO ACTIVE ROOM'}</span></div>{activeEvent ? <div className="border border-[#285f5244] bg-[#07110f] p-4"><div className="flex items-center gap-3"><Swords className="text-[#ffca5c]" size={20} /><div><p className="text-lg font-bold text-[#48efa6]">{activeEvent.type.toUpperCase()}</p><p className="text-xs text-[#6e9889]">{activeEvent.monster ? `${activeEvent.monster.name} // ${activeEvent.monster.element}` : activeEvent.trap ? `${activeEvent.trap.name} // ${activeEvent.trap.element}` : 'TREASURE ACQUIRED'}</p></div></div>{activeEvent.type !== 'treasure' && activeEvent.status !== 'cleared' && <><p className="mt-5 text-xs text-[#b6f7d5]">Select hand cards to commit to the attack / defense bowl.</p><div className="mt-3 flex gap-2">{run.hand.length ? run.hand.map((card: Card) => <button key={card.id} onClick={() => setSelected((ids) => ids.includes(card.id) ? ids.filter((id) => id !== card.id) : [...ids, card.id])} className={`border p-2 text-xs ${selected.includes(card.id) ? 'border-[#ffca5c] bg-[#332b18] text-[#ffca5c]' : 'border-[#2a6354] text-[#b6f7d5]'}`}>{card.rank || card.value} <span className="text-[10px] text-[#6e9889]">{card.suit || card.type}</span></button>) : <span className="text-xs text-[#6e9889]">HAND EMPTY</span>}</div><Button onClick={resolve} className="mt-4">COMMIT {selected.length} CARD{selected.length === 1 ? '' : 'S'} <ChevronRight className="inline" size={13} /></Button></>}{activeEvent.status === 'cleared' && <p className="mt-5 text-xs text-[#48efa6]">EVENT CLEARED // ROOM SECURED</p>}</div> : <div className="grid-bg flex min-h-48 items-center justify-center border border-dashed border-[#2a6354] text-center text-xs text-[#6e9889]">SELECT A ROOM TO BEGIN</div>}<div className="mt-5"><h3 className="text-[10px] tracking-[.14em] text-[#6e9889]">HAND // {run.hand.length} OF {run.handLimit}</h3><div className="mt-2 flex flex-wrap gap-2">{run.hand.map((card: Card) => <span className="border border-[#285f5288] px-2 py-1 text-[10px] text-[#b6f7d5]" key={card.id}>{card.rank || card.value} {card.suit || 'TREASURE'}</span>)}</div></div></Panel></div></>;
}

function Placeholder({ title, copy }: { title: string; copy: string }) { return <><SectionTitle eyebrow="ADMIN // INSPECTOR" title={title} copy={copy} stamp="NEXT REVISION" /><div className="panel grid-bg flex min-h-72 items-center justify-center border-dashed"><div className="text-center text-xs text-[#6e9889]"><Layers3 className="mx-auto mb-4 text-[#48efa6]" size={28} /><p>INSPECTOR READY</p><p className="mt-2 text-[10px]">NO CARDS IN THIS VIEW YET</p></div></div></>; }

export default function Home() {
  const [view, setView] = useState<View>('new-game');
  const [stage, setStage] = useState<'dashboard' | 'character' | 'run'>('dashboard');
  const [seed, setSeed] = useState(1001);
  const [characterId, setCharacterId] = useState('air');
  const [boon, setBoon] = useState('water');
  const [terminal, setTerminal] = useState('Awaiting operator input...');
  const [run, setRun] = useState<any | null>(null);
  const [clock, setClock] = useState('00:00:00');

  useEffect(() => {
    const updateClock = () => setClock(new Date().toLocaleTimeString([], { hour12: false }));
    updateClock();
    const interval = window.setInterval(updateClock, 1000);
    return () => window.clearInterval(interval);
  }, []);

  const begin = async () => {
    setTerminal(`seed ${seed} accepted // character selection open`);
    setStage('character');
  };

  const confirmCharacter = async () => {
    const character = characters.find((item) => item.id === characterId) ?? characters[0];
    try {
      const response = await fetch('/api/runs', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ seed, character: { name: character.name, class: character.id === 'air' ? 'warrior' : character.id === 'fire' ? 'elf' : character.id === 'water' ? 'priest' : 'dwarf', element: character.id } }) });
      if (!response.ok) throw new Error('API unavailable');
      setRun(await response.json());
      setStage('run');
      setTerminal('loadout confirmed // opening hand staged');
    } catch { setTerminal('run initialization failed // check the Next API'); }
  };

  const selectView = (next: View) => { setView(next); setTerminal(`view switched // ${next}`); };
  const content = view === 'new-game' ? (stage === 'dashboard' ? <Dashboard seed={seed} setSeed={setSeed} begin={begin} /> : stage === 'character' ? <NewGame seed={seed} characterId={characterId} boon={boon} setCharacterId={setCharacterId} setBoon={setBoon} confirm={confirmCharacter} /> : <RunReady seed={seed} characterId={characterId} boon={boon} enter={() => { if (run) setView('game'); else setTerminal('run missing // initialize a new seed'); }} />) : view === 'game' ? (run ? <GameLoop run={run} onRun={setRun} onTerminal={setTerminal} /> : <Placeholder title="NO ACTIVE RUN" copy="Initialize a deterministic run before entering the maze." />) : view === 'timeline' ? <TimelineView /> : view === 'generators' ? <Generators /> : view === 'options' ? <Options /> : view === 'guide' ? <Guide /> : view === 'deck' ? <DeckView /> : <Placeholder title="VEIL VIEW" copy="The discard pile is empty in this fresh session." />;

  return <main className="crt min-h-screen"><header className="flex h-[72px] items-center justify-between border-b border-[#2a6354] bg-[#081411e8] px-7 shadow-lg"><button onClick={() => selectView('new-game')} className="text-left"><span className="glow block text-2xl font-bold tracking-[.12em] text-[#48efa6]">NCE</span><span className="text-[9px] tracking-[.14em] text-[#6e9889]">NEXUS CENTRAL ENGINE</span></button><div className="flex items-center gap-4"><span className="mobile-hide text-[10px] text-[#48efa6]"><i className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-[#48efa6] shadow-[0_0_9px_#48efa6]" /> SYSTEM ONLINE</span><button onClick={() => selectView('options')} className="text-[#6e9889]"><Menu size={19} /></button><div className="mobile-hide flex items-center gap-2 text-[10px] text-[#6e9889]">HP <span className="flex gap-1"><Heart fill="currentColor" size={15} className="text-[#48efa6]" /><Heart fill="currentColor" size={15} className="text-[#48efa6]" /><Heart fill="currentColor" size={15} className="text-[#48efa6]" /></span></div><button className="rounded-full border border-[#48efa6] p-1.5 text-[#48efa6]"><UserRound size={15} /></button><button onClick={() => selectView('deck')} className="mobile-hide text-[10px] text-[#6e9889]">DECK <b className="text-[#48efa6]">52</b></button><button onClick={() => selectView('veil')} className="mobile-hide text-[10px] text-[#6e9889]">VEIL <b className="text-[#48efa6]">00</b></button></div></header><div className="flex min-h-[calc(100vh-112px)]"><aside className="hidden w-56 shrink-0 flex-col border-r border-[#2a6354] p-4 md:flex"><p className="px-3 pb-6 pt-3 text-[10px] tracking-[.17em] text-[#6e9889]">NCE // CONTROL</p><nav className="flex-1">{nav.map((group) => <div className="mb-6" key={group.label}><p className="px-3 pb-2 text-[10px] tracking-[.17em] text-[#6e9889]">{group.label}</p>{group.items.map(({ id, label, icon: Icon }) => <button key={`${id}-${label}`} onClick={() => selectView(id)} className={`flex w-full items-center gap-3 border-l-2 px-3 py-2.5 text-left text-xs transition ${view === id ? 'border-[#48efa6] bg-[#143229] text-[#48efa6]' : 'border-transparent text-[#8db9a8] hover:border-[#48efa6] hover:bg-[#143229]'}`}><Icon size={14} />{label}</button>)}</div>)}</nav><div className="border-t border-[#285f5244] px-3 pt-3 text-[9px] leading-5 text-[#50776a]">BUILD 0.2.0-NEXT<br />SEED LINK: ACTIVE</div></aside><section className="mx-auto w-full max-w-[1260px] flex-1 p-6 md:p-10">{content}</section></div><footer className="flex h-10 items-center gap-2 border-t border-[#2a6354] bg-[#06100ee8] px-7 text-[11px] text-[#6e9889]"><span className="text-[#48efa6]">NCE@ADMIN:~$</span><span>{terminal}</span><span className="blink text-[#48efa6]">█</span><span className="ml-auto">{clock}</span></footer></main>;
}
