import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Anchor, Download, Upload, Plus, Trash2, Save, Ship, Skull, Award, Settings, RotateCcw } from "lucide-react";

const WAR_PERIODS = [
  { key: "1941-Q4", label: "Oct-Dec 1941", vpTarget: 66, lossLimit: 10, months: ["Oct 1941", "Nov 1941", "Dec 1941"] },
  { key: "1942-Q1", label: "Jan-Mar 1942", vpTarget: 70, lossLimit: 10, months: ["Jan 1942", "Feb 1942", "Mar 1942"] },
  { key: "1942-Q2", label: "Apr-Jun 1942", vpTarget: 76, lossLimit: 10, months: ["Apr 1942", "May 1942", "Jun 1942"] },
  { key: "1942-Q3", label: "Jul-Sep 1942", vpTarget: 78, lossLimit: 12, months: ["Jul 1942", "Aug 1942", "Sep 1942"] },
  { key: "1942-Q4", label: "Oct-Dec 1942", vpTarget: 80, lossLimit: 13, months: ["Oct 1942", "Nov 1942", "Dec 1942"] },
  { key: "1943-Q1", label: "Jan-Mar 1943", vpTarget: 82, lossLimit: 14, months: ["Jan 1943", "Feb 1943", "Mar 1943"] },
];

const MONTHS = WAR_PERIODS.flatMap((p, pi) => p.months.map((m, mi) => ({ label: m, periodIndex: pi, monthIndex: pi * 3 + mi })));
const START_XP = [30, 25, 20, 15];
const START_TONS = [30, 25, 20, 15];
const STATUS = ["-", "C", "R", "S", "Sc", "Cp", "P", "N"];
const CREW_ROLES = ["Captain", "1st WO", "2nd WO/Medic", "Chief Engineer", "Bow Crew", "Midship Crew", "Stern Crew"];
const OFFICER_ROLES = ["Captain", "1st WO", "2nd WO/Medic", "Chief Engineer"];
const CREW_SECTION_ROLES = ["Bow Crew", "Midship Crew", "Stern Crew"];
const OFFICER_WOUND_RESULTS = ["None", "Light", "Medium", "Heavy healed 8-10", "Heavy replaced 1-7", "KIA/Captured/Lost"];
const PATROL_SEQUENCE = [
  { step: "Approach", title: "U-boat Movement", scope: "Approach Map", ref: 28 },
  { step: "Approach", title: "ASW Move, Search, Attack", scope: "Approach Map", ref: 39 },
  { step: "Approach", title: "Damage Control", scope: "Approach Map", ref: 61 },
  { step: "Attack", title: "Torpedo Move/Detonation", scope: "Attack Map", ref: 25 },
  { step: "Attack", title: "U-boat Movement", scope: "Approach & Attack Maps", ref: 28 },
  { step: "Attack", title: "U-boat Observation", scope: "Attack Map; surfaced or periscope depth only", ref: 37 },
  { step: "Attack", title: "TDC Calculation", scope: "Attack Map; max 1 per targeted convoy ship unless enhanced", ref: 38 },
  { step: "Attack", title: "ASW Move, Search, Attack", scope: "Approach & Attack Maps", ref: 39 },
  { step: "Attack", title: "Convoy Movement", scope: "Attack Map, and Approach Map once Attack is active", ref: 55 },
  { step: "Attack", title: "Torpedo Reload", scope: "Attack Map; not if Silent Running", ref: 58 },
  { step: "Attack", title: "U-boat Attack", scope: "Attack Map; surfaced or periscope depth only", ref: 59 },
  { step: "Attack", title: "Damage Control", scope: "Approach & Attack Maps; TP if Silent Running", ref: 61 },
];

const CAMPAIGN_TYPES = {
  full: { label: "Full Campaign", description: "18 Patrols · Oct 1941 to Mar 1943", length: 18, initialFP: 24 },
  early: { label: "Early War Campaign", description: "9 Patrols · Oct 1941 to Jun 1942", length: 9, initialFP: 24 },
  warperiod: { label: "Single War Period Campaign", description: "3 Patrols · choose one War Period", length: 3, initialFP: 24 },
  patrol: { label: "Single Patrol", description: "1 Patrol · choose one month", length: 1, initialFP: 0 },
};

const FLOTILLAS = [
  { id: "1st", boats: [["U-81", "Type VII", "Kptlt. Friedrich Guggenberger"], ["U-201", "Type VII", "Kptlt. Adalbert Schnee"], ["U-202", "Type VII", "Kptlt. Hans-Heinz Linder"], ["U-563", "Type VII", "Oblt. Klaus Heinrich Bargsten"]] },
  { id: "3rd", boats: [["U-205", "Type VII", "Kptlt. Franz-Georg Reschke"], ["U-332", "Type VII", "Kptlt. Johannes Liebe"], ["U-333", "Type VII", "Kptlt. Peter Erich Cremer", [0, 1, 2]], ["U-569", "Type VII", "Kptlt. Hans-Peter Hinsch"]] },
  { id: "6th", boats: [["U-87", "Type VII", "Kptlt. Joachim Berger", [0, 1]], ["U-404", "Type VII", "Kptlt. Otto von Bülow", [0, 1, 2]], ["U-456", "Type VII", "Kptlt. Max-Martin Teichert", [0, 1, 2]], ["U-586", "Type VII", "Kptlt. Dietrich von der Esch", [0, 1, 2]]] },
  { id: "7th", boats: [["U-69", "Type VII", "Oblt. Hans-Jürgen Auffermann"], ["U-71", "Type VII", "Kptlt. Walter Flachsenberg"], ["U-96", "Type VII", "Kptlt. Heinrich Lehmann-Willenbrock"], ["U-135", "Type VII", "Kptlt. Friedrich-Hermann Praetorius", [0, 1]]] },
  { id: "2nd", boats: [["U-103", "Type IX", "Kptlt. Werner Winter"], ["U-106", "Type IX", "Kptlt. Hermann Rasch"], ["U-107", "Type IX", "Kptlt. Harald Gelhaus", [0, 1]], ["U-108", "Type IX", "Kptlt. Klaus Scholtz"]] },
];

const ENHANCEMENTS = {
  Captain: [
    { id: "cap-2tdc", name: "2 TDCs", cost: 10, level: 1, prereq: null, effect: "Make two separate TDC calculations." },
    { id: "cap-3tdc", name: "3 TDCs", cost: 15, level: 2, prereq: "cap-2tdc", effect: "Make three separate TDC calculations." },
    { id: "cap-tdc-drm", name: "+1 DRM to TDC", cost: 20, level: 3, prereq: "cap-3tdc", effect: "Add +1 DRM to each TDC roll." },
    { id: "cap-pull2tdc", name: "Pull 2 TDC cards", cost: 0, level: 4, prereq: "cap-tdc-drm", auto100k: true, effect: "Auto at 100k tons; use either card." },
    { id: "cap-1tp", name: "+1 TP @ start", cost: 15, level: 2, prereq: "cap-2tdc", effect: "Gain 1 extra TP at Patrol start." },
    { id: "cap-2tp", name: "+2 TP @ start", cost: 20, level: 3, prereq: "cap-1tp", effect: "Gain 2 extra TP at Patrol start." },
    { id: "cap-pull2evade", name: "Pull 2 Evades", cost: 0, level: 4, prereq: "cap-2tp", auto100k: true, effect: "Auto at 100k tons; use either Evade result." },
  ],
  "1st WO": [
    { id: "wo1-2tdc", name: "2 TDCs", cost: 10, level: 1, prereq: null, effect: "Make two separate TDC calculations." },
    { id: "wo1-3tdc", name: "3 TDCs", cost: 15, level: 2, prereq: "wo1-2tdc", effect: "Make three separate TDC calculations." },
    { id: "wo1-tdc-drm", name: "+1 DRM to TDC", cost: 20, level: 3, prereq: "wo1-3tdc", effect: "Add +1 DRM to each TDC roll." },
  ],
  "2nd WO/Medic": [
    { id: "med-heal8", name: "Heal Wound 8+", cost: 10, level: 1, prereq: null, effect: "Reduce one wound level on d10 8+." },
    { id: "med-heal6", name: "Heal Wound 6+", cost: 15, level: 2, prereq: "med-heal8", effect: "Reduce one wound level on d10 6+." },
    { id: "med-heal5", name: "Heal Wound 5+", cost: 20, level: 3, prereq: "med-heal6", effect: "Reduce one wound level on d10 5+." },
    { id: "med-heal4", name: "Heal Wound 4+", cost: 25, level: 4, prereq: "med-heal5", effect: "Reduce one wound level on d10 4+." },
    { id: "med-heal2loc", name: "Heal 2 locations", cost: 20, level: 3, prereq: "med-heal6", effect: "Heal at two locations using best ability." },
    { id: "med-healdrm", name: "Heal +1 DRM", cost: 25, level: 4, prereq: "med-heal2loc", effect: "Add +1 DRM to each heal roll." },
  ],
  "Chief Engineer": [
    { id: "eng-1loc", name: "Assist 1 location", cost: 10, level: 1, prereq: null, effect: "Assist one upgraded Crew Section repair location." },
    { id: "eng-2loc", name: "Assist 2 locations", cost: 15, level: 2, prereq: "eng-1loc", effect: "Assist two upgraded Crew Sections." },
    { id: "eng-minus-refit", name: "-1 Month Repair", cost: 20, level: 3, prereq: "eng-2loc", effect: "Reduce refit time by one month." },
    { id: "eng-fire", name: "+1 DRM Fire", cost: 25, level: 4, prereq: "eng-minus-refit", effect: "Add +1 DRM to Fire repair rolls." },
    { id: "eng-3loc", name: "Assist 3 locations", cost: 20, level: 3, prereq: "eng-2loc", effect: "Assist all three upgraded Crew Sections." },
    { id: "eng-flood", name: "+1 DRM Flood", cost: 25, level: 4, prereq: "eng-3loc", effect: "Add +1 DRM to Flood repair rolls." },
  ],
  "Crew Section": [
    { id: "crew-1repair", name: "+1 Repair with Engineer", cost: 15, level: 1, prereq: null, effect: "Add +1 repair DRM; not Fire." },
    { id: "crew-2repair", name: "+2 Repair with Engineer", cost: 15, level: 2, prereq: "crew-1repair", effect: "Add +2 repair DRM; not Fire." },
    { id: "crew-reload", name: "-1 Reload time", cost: 20, level: 3, prereq: "crew-2repair", effect: "Reduce reload time by one turn." },
    { id: "crew-fire25", name: "+1 DRM Fire", cost: 25, level: 4, prereq: "crew-reload", effect: "Add +1 DRM against Fire." },
    { id: "crew-fire20", name: "+1 DRM Fire", cost: 20, level: 3, prereq: "crew-2repair", effect: "Add +1 DRM against Fire." },
    { id: "crew-heal8", name: "Heal Wound 8+", cost: 25, level: 4, prereq: "crew-fire20", effect: "Reduce one wound level on d10 8+." },
  ],
};

function makeBoats() {
  return FLOTILLAS.flatMap(f => f.boats.map((b, i) => {
    const log = Array(18).fill("-");
    (b[3] || []).forEach(mi => { log[mi] = "N"; });
    return {
      id: `${f.id}-${i + 1}`,
      flotilla: f.id,
      slot: i + 1,
      name: b[0],
      type: b[1],
      captainName: b[2],
      log,
      xp: 0,
      tonsK: 0,
      initialized: false,
      lost: false,
      enhancements: Object.fromEntries(CREW_ROLES.map(r => [r, []])),
      notes: "",
    };
  }));
}

function campaignStartMonth(campaign) {
  if (campaign?.campaignType === "warperiod") return Number(campaign.startPeriodIndex || 0) * 3;
  if (campaign?.campaignType === "patrol") return Number(campaign.singlePatrolMonth || 0);
  return 0;
}
function campaignMonths(campaign) {
  const type = CAMPAIGN_TYPES[campaign?.campaignType || "full"] || CAMPAIGN_TYPES.full;
  const start = campaignStartMonth(campaign);
  return MONTHS.slice(start, Math.min(18, start + type.length));
}
function startingValues(slot) { return { xp: START_XP[slot - 1], tonsK: START_TONS[slot - 1] }; }
function newCampaign(name = "New Wolfpack Campaign") {
  return {
    id: crypto.randomUUID(),
    name,
    createdAt: new Date().toISOString(),
    campaignType: "full",
    startPeriodIndex: 0,
    singlePatrolMonth: 0,
    currentMonth: 0,
    flotillaPoints: 24,
    fpRefitCost: 8,
    initializedAtStart: false,
    boats: makeBoats(),
    patrols: [],
    survivors: [],
    notes: "",
  };
}
function migrateCampaign(c) {
  const n = { ...newCampaign(c?.name || "Wolfpack Campaign"), ...c };
  n.campaignType ||= "full";
  n.fpRefitCost ??= 8;
  n.initializedAtStart ??= false;
  n.survivors ||= [];
  n.boats = (n.boats || []).map(b => ({ ...b, enhancements: { ...Object.fromEntries(CREW_ROLES.map(r => [r, []])), ...(b.enhancements || {}) } }));
  return n;
}
function xpFromPatrol({ tonsK = 0, returned = true, scuttled = false, escortCount = 0 }) {
  return Math.max(0, Number(tonsK || 0)) + (returned ? 20 : 0) + (scuttled ? 15 : 0) + Math.max(0, Number(escortCount || 0)) * 20;
}
function baseRefitMonths({ flooding = "none", heavyEngine = false, chiefEngineerMinusOne = false }) {
  let months = 0;
  if (flooding === "L-O") months = 1;
  if (flooding === "2ndO+") months = 2;
  if (heavyEngine) months += 1;
  if (chiefEngineerMinusOne) months = Math.max(0, months - 1);
  return months;
}
function enhancementById(id) {
  for (const list of Object.values(ENHANCEMENTS)) {
    const found = list.find(e => e.id === id);
    if (found) return found;
  }
  return null;
}
function removeHighestCrewEnhancement(boat) {
  const owned = CREW_SECTION_ROLES.flatMap(role => (boat.enhancements[role] || []).map(id => ({ role, id, level: enhancementById(id)?.level || 0 })));
  if (!owned.length) return null;
  owned.sort((a, b) => b.level - a.level);
  const loss = owned[0];
  boat.enhancements[loss.role] = boat.enhancements[loss.role].filter(id => id !== loss.id);
  return loss;
}
function canAddEnhancement(boat, role, enh, { free = false } = {}) {
  const list = boat.enhancements[role] || [];
  return !list.includes(enh.id) && (!enh.prereq || list.includes(enh.prereq)) && (!enh.auto100k || boat.tonsK >= 100) && (free || enh.auto100k || boat.xp >= enh.cost);
}
function defaultOfficerWounds() {
  return Object.fromEntries(OFFICER_ROLES.map(role => [role, "None"]));
}
function resolveOfficerCasualties(boat, entry) {
  const officerLosses = [];
  const officerWounds = { ...defaultOfficerWounds(), ...(entry.officerWounds || {}) };
  OFFICER_ROLES.forEach(role => {
    const result = officerWounds[role];
    if (result === "KIA/Captured/Lost" || result === "Heavy replaced 1-7") {
      officerLosses.push({ role, result, lostEnhancements: [...(boat.enhancements[role] || [])] });
    }
  });
  const captainLost = officerLosses.some(x => x.role === "Captain");
  if (captainLost && entry.actingCaptainRole === "1st WO") {
    boat.enhancements.Captain = [...(boat.enhancements["1st WO"] || [])];
    boat.enhancements["1st WO"] = [];
    return { officerLosses, captainPromotion: "1st WO promoted to Captain" };
  }
  officerLosses.forEach(loss => { boat.enhancements[loss.role] = []; });
  return { officerLosses, captainPromotion: captainLost ? "Captain replaced; Captain enhancements erased" : null };
}
function statusBadge(s) {
  const map = { C: "bg-emerald-100 text-emerald-700", R: "bg-amber-100 text-amber-700", S: "bg-red-100 text-red-700", Sc: "bg-orange-100 text-orange-700", Cp: "bg-purple-100 text-purple-700", P: "bg-sky-100 text-sky-700", N: "bg-slate-200 text-slate-500", "-": "bg-slate-100 text-slate-500" };
  return map[s] || "bg-slate-100 text-slate-500";
}
function periodStats(campaign) {
  const monthSet = new Set(campaignMonths(campaign).map(m => m.monthIndex));
  return WAR_PERIODS.map((p, pi) => {
    const periodMonths = p.months.map((_, mi) => pi * 3 + mi);
    const isInCampaign = periodMonths.some(m => monthSet.has(m));
    const patrols = campaign.patrols.filter(x => x.periodIndex === pi);
    const vp = patrols.reduce((a, p) => a + Number(p.vp || 0), 0);
    const losses = campaign.boats.reduce((a, b) => a + b.log.slice(0, (pi + 1) * 3).filter(s => ["S", "Sc", "Cp"].includes(s)).length, 0);
    return { ...p, vp, losses, isInCampaign, success: isInCampaign && patrols.length >= periodMonths.filter(m => monthSet.has(m)).length ? vp >= p.vpTarget : null };
  }).filter(p => p.isInCampaign || (campaign.campaignType || "full") === "full");
}
function safeNumber(v) { return Number.isFinite(Number(v)) ? Number(v) : 0; }

export default function WolfpackCampaignApp() {
  const [campaigns, setCampaigns] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("wolfpack-campaigns-v2") || localStorage.getItem("wolfpack-campaigns-v1"));
      return Array.isArray(saved) && saved.length ? saved.map(migrateCampaign) : [newCampaign("Kriegsmarine 1941 Campaign")];
    } catch { return [newCampaign("Kriegsmarine 1941 Campaign")]; }
  });
  const [activeId, setActiveId] = useState(() => localStorage.getItem("wolfpack-active-campaign") || campaigns[0]?.id);
  const [tab, setTab] = useState("setup");
  const [selectedBoat, setSelectedBoat] = useState(null);
  const [patrolForm, setPatrolForm] = useState({ monthIndex: 0, vp: 0, notes: "", boats: [] });

  const campaign = campaigns.find(c => c.id === activeId) || campaigns[0];
  const months = useMemo(() => campaignMonths(campaign), [campaign]);
  const stats = useMemo(() => periodStats(campaign), [campaign]);
  const boat = campaign.boats.find(b => b.id === selectedBoat) || campaign.boats[0];

  useEffect(() => {
    localStorage.setItem("wolfpack-campaigns-v2", JSON.stringify(campaigns));
    if (activeId) localStorage.setItem("wolfpack-active-campaign", activeId);
  }, [campaigns, activeId]);

  function updateCampaign(mutator) {
    setCampaigns(prev => prev.map(c => c.id === campaign.id ? mutator(structuredClone(c)) : c));
  }
  function addCampaign() {
    const c = newCampaign(`Campaign ${campaigns.length + 1}`);
    setCampaigns([...campaigns, c]);
    setActiveId(c.id);
    setTab("setup");
  }
  function deleteCampaign() {
    if (campaigns.length <= 1) return;
    const rest = campaigns.filter(c => c.id !== campaign.id);
    setCampaigns(rest);
    setActiveId(rest[0].id);
  }
  function configureCampaign(patch) {
    updateCampaign(c => {
      Object.assign(c, patch);
      const type = CAMPAIGN_TYPES[c.campaignType || "full"] || CAMPAIGN_TYPES.full;
      const start = campaignStartMonth(c);
      c.currentMonth = start;
      if (!c.initializedAtStart) c.flotillaPoints = type.initialFP;
      return c;
    });
    setPatrolForm(f => ({ ...f, monthIndex: campaignStartMonth({ ...campaign, ...patch }) }));
  }
  function initBoat(c, b) {
    if (!b.initialized) {
      const defaults = startingValues(b.slot);
      b.xp = defaults.xp;
      b.tonsK = defaults.tonsK;
      b.initialized = true;
    }
    return b;
  }
  function initializeStartingBoats() {
    updateCampaign(c => {
      const start = campaignStartMonth(c);
      c.boats.forEach(b => {
        if (["N", "S", "Sc", "Cp"].includes(b.log[start])) return;
        if (!b.initialized) {
          const s = startingValues(b.slot);
          b.xp = s.xp;
          b.tonsK = s.tonsK;
          b.initialized = true;
        }
      });
      c.initializedAtStart = true;
      return c;
    });
  }
  function updateBoatStartingValues(boatId, patch) {
    updateCampaign(c => {
      const b = c.boats.find(x => x.id === boatId);
      if (!b) return c;
      Object.assign(b, patch, { initialized: true });
      return c;
    });
  }
  function addBoatToPatrol(boatId) {
    if (!boatId) return;
    setPatrolForm(f => f.boats.some(x => x.boatId === boatId) ? f : ({
      ...f,
      boats: [...f.boats, { boatId, designation: ["W", "X", "Y", "Z"][f.boats.length] || "P", status: "C", tonsK: 0, escorts: 0, returned: true, scuttled: false, tpPurchased: 0, xpToFp: 0, flooding: "none", heavyEngine: false, fpRefitReduction: 0, crewWounds: { Bow: 0, Midship: 0, Stern: 0 }, officerWounds: defaultOfficerWounds(), actingCaptainRole: "", allCrewSectionsLost: false, replacementUboat: false, replacementVpPenalty: 0, freeCrewRole: "", freeCrewEnhancement: "", notes: "" }]
    }));
  }
  function updatePatrolBoat(boatId, patch) {
    setPatrolForm(f => ({ ...f, boats: f.boats.map(b => b.boatId === boatId ? { ...b, ...patch } : b) }));
  }
  function commitPatrol() {
    updateCampaign(c => {
      const monthIndex = safeNumber(patrolForm.monthIndex);
      const periodIndex = MONTHS[monthIndex].periodIndex;
      const patrolRecord = { id: crypto.randomUUID(), date: MONTHS[monthIndex].label, monthIndex, periodIndex, vp: safeNumber(patrolForm.vp), notes: patrolForm.notes, boats: [] };
      patrolForm.boats.forEach(entry => {
        const b = initBoat(c, c.boats.find(x => x.id === entry.boatId));
        const xpSpentOnTP = Math.min(b.xp, Math.max(0, safeNumber(entry.tpPurchased)) * 5);
        const xpConvertedToFP = Math.min(Math.max(0, b.xp - xpSpentOnTP), Math.max(0, safeNumber(entry.xpToFp)));
        b.xp -= xpSpentOnTP + xpConvertedToFP;
        c.flotillaPoints += xpConvertedToFP;
        const gainedXp = ["S", "Cp"].includes(entry.status) ? 0 : xpFromPatrol({ tonsK: entry.tonsK, returned: entry.returned && entry.status !== "Sc", scuttled: entry.status === "Sc" || entry.scuttled, escortCount: entry.escorts });
        const gainedTons = entry.status === "Cp" ? 0 : safeNumber(entry.tonsK);
        const ceMinusOne = b.enhancements["Chief Engineer"].includes("eng-minus-refit");
        let refit = baseRefitMonths({ flooding: entry.flooding, heavyEngine: entry.heavyEngine, chiefEngineerMinusOne: ceMinusOne });
        const fpReduction = Math.min(refit, safeNumber(entry.fpRefitReduction));
        refit -= fpReduction;
        c.flotillaPoints = Math.max(0, c.flotillaPoints - fpReduction * safeNumber(c.fpRefitCost || 8));
        b.xp += gainedXp;
        b.tonsK += gainedTons;
        b.log[monthIndex] = entry.status;
        for (let r = 1; r <= refit; r++) if (monthIndex + r < 18 && b.log[monthIndex + r] === "-") b.log[monthIndex + r] = "R";
        const { officerLosses, captainPromotion } = ["S", "Cp"].includes(entry.status) ? { officerLosses: [], captainPromotion: null } : resolveOfficerCasualties(b, entry);
        let crewSectionsLost = false;
        if (entry.allCrewSectionsLost) {
          CREW_SECTION_ROLES.forEach(role => { b.enhancements[role] = []; });
          crewSectionsLost = true;
        }
        if (["S", "Sc", "Cp"].includes(entry.status)) {
          b.lost = true;
          if (["S", "Cp"].includes(entry.status)) {
            b.xp = 0;
            Object.keys(b.enhancements).forEach(k => { b.enhancements[k] = []; });
          }
          if (entry.status === "Sc") {
            c.survivors ||= [];
            c.survivors.push({
              id: crypto.randomUUID(),
              date: MONTHS[monthIndex].label,
              fromBoatId: b.id,
              fromBoat: b.name,
              captainName: b.captainName,
              xp: b.xp,
              tonsK: b.tonsK,
              enhancements: structuredClone(b.enhancements),
              notes: entry.notes || "",
            });
          }
        }
        const woundLevel = Object.values(entry.crewWounds || {}).reduce((a, v) => a + safeNumber(v), 0);
        let woundLoss = woundLevel >= 9 ? 2 : woundLevel >= 5 ? 1 : 0;
        const lostEnhancements = [];
        while (woundLoss > 0) {
          const removed = removeHighestCrewEnhancement(b);
          if (!removed) break;
          lostEnhancements.push(removed);
          woundLoss--;
        }
        let freeCrewEnhancement = null;
        if (!lostEnhancements.length && entry.freeCrewRole && entry.freeCrewEnhancement) {
          const enh = ENHANCEMENTS["Crew Section"].find(e => e.id === entry.freeCrewEnhancement);
          if (enh && canAddEnhancement(b, entry.freeCrewRole, enh, { free: true })) {
            b.enhancements[entry.freeCrewRole].push(enh.id);
            freeCrewEnhancement = { role: entry.freeCrewRole, id: enh.id, name: enh.name };
          }
        }
        patrolRecord.boats.push({ ...entry, gainedXp, gainedTons, xpSpentOnTP, xpConvertedToFP, refit, woundLevel, lostEnhancements, freeCrewEnhancement, officerLosses, captainPromotion, crewSectionsLost });
      });
      c.patrols.push(patrolRecord);
      const nextAllowed = campaignMonths(c).find(m => m.monthIndex > monthIndex)?.monthIndex ?? monthIndex;
      c.currentMonth = nextAllowed;
      return c;
    });
    const nextMonth = months.find(m => m.monthIndex > safeNumber(patrolForm.monthIndex))?.monthIndex ?? safeNumber(patrolForm.monthIndex);
    setPatrolForm({ monthIndex: nextMonth, vp: 0, notes: "", boats: [] });
    setTab("log");
  }
  function buyEnhancement(boatId, role, enh) {
    updateCampaign(c => {
      const b = initBoat(c, c.boats.find(x => x.id === boatId));
      const list = b.enhancements[role];
      if (!list || !canAddEnhancement(b, role, enh)) return c;
      if (!enh.auto100k) b.xp -= enh.cost;
      list.push(enh.id);
      return c;
    });
  }
  function convertXpToFp(boatId, amount) {
    updateCampaign(c => {
      const b = c.boats.find(x => x.id === boatId);
      const amt = Math.max(0, Math.min(safeNumber(amount), b.xp));
      b.xp -= amt;
      c.flotillaPoints += amt;
      return c;
    });
  }
  function exportData() {
    const blob = new Blob([JSON.stringify(campaigns, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "wolfpack-campaigns.json";
    a.click();
    URL.revokeObjectURL(url);
  }
  function importData(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try { const data = JSON.parse(String(reader.result)); setCampaigns(data.map(migrateCampaign)); setActiveId(data[0]?.id); } catch { alert("Invalid JSON file"); }
    };
    reader.readAsText(file);
  }

  return <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6">
    <div className="max-w-7xl mx-auto space-y-4">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div><h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3"><Anchor className="w-8 h-8" /> Wolfpack Campaign Command</h1><p className="text-slate-400">Campaign log, starting XP, flotilla progress, crew enhancements and post-patrol automation.</p></div>
        <div className="flex flex-wrap gap-2"><select className="input" value={activeId} onChange={e => setActiveId(e.target.value)}>{campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select><button className="btn" onClick={addCampaign}><Plus className="w-4 h-4" /> Campaign</button><button className="btn danger" onClick={deleteCampaign}><Trash2 className="w-4 h-4" /></button><button className="btn" onClick={exportData}><Download className="w-4 h-4" /></button><label className="btn cursor-pointer"><Upload className="w-4 h-4" /><input type="file" accept="application/json" className="hidden" onChange={importData}/></label></div>
      </header>
      <nav className="flex gap-2 overflow-auto pb-1">{["setup", "log", "patrol", "crew", "history", "rules"].map(t => <button key={t} onClick={() => setTab(t)} className={`tab ${tab === t ? "tab-active" : ""}`}>{t === "setup" ? "Campaign Setup" : t === "log" ? "Campaign Log" : t === "patrol" ? "End Patrol" : t === "crew" ? "Crew" : t === "history" ? "History" : "Rules Helper"}</button>)}</nav>
      <section className="grid grid-cols-1 md:grid-cols-4 gap-3"><Stat icon={<Settings />} label="Campaign Type" value={CAMPAIGN_TYPES[campaign.campaignType || "full"].label} /><Stat icon={<Award />} label="Flotilla Points" value={campaign.flotillaPoints} /><Stat icon={<Ship />} label="Patrols Logged" value={`${campaign.patrols.length}/${months.length}`} /><Stat icon={<Skull />} label="Cumulative Losses" value={stats.at(-1)?.losses || 0} /></section>
      {tab === "setup" && <SetupPanel campaign={campaign} configureCampaign={configureCampaign} initializeStartingBoats={initializeStartingBoats} updateBoatStartingValues={updateBoatStartingValues} />}
      {tab === "log" && <CampaignLog campaign={campaign} updateCampaign={updateCampaign} stats={stats} months={months} />}
      {tab === "patrol" && <EndPatrol campaign={campaign} months={months} form={patrolForm} setForm={setPatrolForm} addBoatToPatrol={addBoatToPatrol} updatePatrolBoat={updatePatrolBoat} commitPatrol={commitPatrol} />}
      {tab === "crew" && <CrewPanel campaign={campaign} boat={boat} setSelectedBoat={setSelectedBoat} buyEnhancement={buyEnhancement} convertXpToFp={convertXpToFp} />}
      {tab === "history" && <History campaign={campaign} />}
      {tab === "rules" && <RulesHelper />}
    </div>
    <style>{`.card{background:rgba(15,23,42,.9);border:1px solid rgba(148,163,184,.18);border-radius:1rem;box-shadow:0 20px 50px rgba(0,0,0,.25)}.btn{display:inline-flex;align-items:center;gap:.4rem;background:#1e293b;border:1px solid rgba(148,163,184,.25);border-radius:.75rem;padding:.55rem .8rem;color:#e2e8f0;font-weight:600}.btn:hover{background:#334155}.btn:disabled{opacity:.4}.danger{background:#451a1a}.danger:hover{background:#7f1d1d}.tab{background:#0f172a;border:1px solid rgba(148,163,184,.2);border-radius:999px;padding:.6rem 1rem;color:#94a3b8;font-weight:700;white-space:nowrap}.tab-active{background:#e2e8f0;color:#0f172a}.input{background:#020617;border:1px solid rgba(148,163,184,.3);border-radius:.75rem;padding:.55rem .7rem;color:#e2e8f0}.input option{background:#020617}.small{font-size:.78rem;color:#94a3b8}.gridcell{min-width:52px;text-align:center;border-radius:.55rem;padding:.3rem .4rem;font-weight:800;display:inline-block}`}</style>
  </div>;
}

function Stat({ icon, label, value }) { return <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card p-4"><div className="flex items-center justify-between gap-2"><div><div className="small">{label}</div><div className="text-xl md:text-2xl font-black">{value}</div></div>{React.cloneElement(icon, { className: "w-8 h-8 text-slate-400 shrink-0" })}</div></motion.div>; }
function Field({ label, children }) { return <label className="block"><span className="small block mb-1">{label}</span>{children}</label>; }

function SetupPanel({ campaign, configureCampaign, initializeStartingBoats, updateBoatStartingValues }) {
  const start = campaignStartMonth(campaign);
  const months = campaignMonths(campaign);
  const startBoats = campaign.boats.filter(b => !["N", "S", "Sc", "Cp"].includes(b.log[start]));
  return <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
    <div className="card p-4 space-y-3"><h2 className="text-xl font-black">Campaign Setup</h2><Field label="Campaign name"><input className="input w-full" value={campaign.name} onChange={e => configureCampaign({ name: e.target.value })}/></Field><Field label="Campaign type"><select className="input w-full" value={campaign.campaignType || "full"} onChange={e => configureCampaign({ campaignType: e.target.value })}>{Object.entries(CAMPAIGN_TYPES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select></Field><div className="small">{CAMPAIGN_TYPES[campaign.campaignType || "full"].description}</div>{campaign.campaignType === "warperiod" && <Field label="War Period"><select className="input w-full" value={campaign.startPeriodIndex || 0} onChange={e => configureCampaign({ startPeriodIndex: safeNumber(e.target.value) })}>{WAR_PERIODS.map((p, i) => <option key={p.key} value={i}>{p.label}</option>)}</select></Field>}{campaign.campaignType === "patrol" && <Field label="Patrol month"><select className="input w-full" value={campaign.singlePatrolMonth || 0} onChange={e => configureCampaign({ singlePatrolMonth: safeNumber(e.target.value) })}>{MONTHS.map(m => <option key={m.monthIndex} value={m.monthIndex}>{m.label}</option>)}</select></Field>}<Field label="Initial / current Flotilla Points"><input className="input w-full" type="number" value={campaign.flotillaPoints} onChange={e => configureCampaign({ flotillaPoints: safeNumber(e.target.value), initializedAtStart: true })}/></Field><Field label="FP cost to reduce refit by 1 month"><input className="input w-full" type="number" value={campaign.fpRefitCost || 8} onChange={e => configureCampaign({ fpRefitCost: safeNumber(e.target.value) })}/></Field><button className="btn w-full justify-center" onClick={initializeStartingBoats}><Save className="w-4 h-4" /> Initialize Starting U-boats</button><div className="small">Available U-boats at the campaign start receive initial service values by flotilla slot: #1 30 XP/30k tons, #2 25 XP/25k tons, #3 20 XP/20k tons, #4 15 XP/15k tons. You can edit these before buying enhancements.</div></div>
    <div className="card p-4 lg:col-span-2 overflow-auto"><h2 className="text-xl font-black mb-3">Starting U-boats and Initial Experience</h2><div className="small mb-3">Campaign months: {months.map(m => m.label).join(", ")}</div><table className="w-full text-sm border-separate border-spacing-1"><thead><tr><th className="text-left p-2">Flotilla</th><th className="text-left p-2">U-boat</th><th>Slot</th><th>Start XP</th><th>Start k Tons</th><th>Initialized</th></tr></thead><tbody>{startBoats.map(b => <tr key={b.id}><td className="p-2 text-slate-400">{b.flotilla}</td><td className="p-2 font-bold whitespace-nowrap">{b.name} <span className="small">{b.type}</span></td><td className="text-center">#{b.slot}</td><td><input className="input w-24" type="number" value={b.xp} onChange={e => updateBoatStartingValues(b.id, { xp: safeNumber(e.target.value) })}/></td><td><input className="input w-24" type="number" value={b.tonsK} onChange={e => updateBoatStartingValues(b.id, { tonsK: safeNumber(e.target.value) })}/></td><td className="text-center">{b.initialized ? "Yes" : "No"}</td></tr>)}</tbody></table></div>
  </div>;
}

function CampaignLog({ campaign, updateCampaign, stats, months }) {
  return <div className="card p-4 overflow-auto"><div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4"><input className="input text-xl font-bold" value={campaign.name} onChange={e => updateCampaign(c => { c.name = e.target.value; return c; })}/><div className="small">Status codes: C completed, R refit, S sunk, Sc scuttled, Cp captured, P extra patrol, N unavailable.</div></div><table className="w-full text-sm border-separate border-spacing-1"><thead><tr><th className="text-left p-2">Flotilla</th><th className="text-left p-2">U-boat</th>{months.map(m => <th key={m.monthIndex} className="p-2 text-slate-400">{m.label.split(" ")[0]}<br/>{m.label.split(" ")[1]}</th>)}<th>XP</th><th>k Tons</th></tr></thead><tbody>{campaign.boats.map(b => <tr key={b.id}><td className="p-2 text-slate-400">{b.flotilla}</td><td className="p-2 font-bold whitespace-nowrap">{b.name} <span className="small">{b.type}</span></td>{months.map(m => <td key={m.monthIndex}><span className={`gridcell ${statusBadge(b.log[m.monthIndex])}`}>{b.log[m.monthIndex]}</span></td>)}<td className="p-2 font-bold">{b.xp}</td><td className="p-2 font-bold">{b.tonsK}</td></tr>)}</tbody></table><div className="grid grid-cols-1 md:grid-cols-6 gap-3 mt-5">{stats.map(p => <div key={p.key} className="bg-slate-900 rounded-xl p-3 border border-slate-700"><div className="font-bold">{p.label}</div><div className="small">VP target {p.vpTarget} · Loss limit {p.lossLimit}</div><div className="mt-2">VP: <b>{p.vp}</b></div><div>Losses: <b className={p.losses >= p.lossLimit ? "text-red-400" : ""}>{p.losses}</b></div><div className="mt-2 font-bold">{p.success === null ? "In progress" : p.success ? "Success" : "Failure"}</div></div>)}</div></div>;
}

function EndPatrol({ campaign, months, form, setForm, addBoatToPatrol, updatePatrolBoat, commitPatrol }) {
  const currentMonthIndex = months.some(m => m.monthIndex === safeNumber(form.monthIndex)) ? safeNumber(form.monthIndex) : months[0]?.monthIndex || 0;
  const available = campaign.boats.filter(b => !b.lost && !["R", "N", "S", "Sc", "Cp"].includes(b.log[currentMonthIndex]));
  return <div className="grid grid-cols-1 lg:grid-cols-3 gap-4"><div className="card p-4 lg:col-span-1 space-y-3"><h2 className="text-xl font-black">Log End of Patrol</h2><Field label="Patrol month"><select className="input w-full" value={currentMonthIndex} onChange={e => setForm({ ...form, monthIndex: e.target.value })}>{months.map(m => <option key={m.monthIndex} value={m.monthIndex}>{m.label}</option>)}</select></Field><Field label="Total Patrol VP"><input className="input w-full" type="number" value={form.vp} onChange={e => setForm({ ...form, vp: e.target.value })}/></Field><Field label="Add U-boat"><select className="input w-full" onChange={e => { addBoatToPatrol(e.target.value); e.target.value = ""; }}><option value="">Select available U-boat…</option>{available.map(b => <option key={b.id} value={b.id}>{b.name} · {b.flotilla}</option>)}</select></Field><textarea className="input w-full min-h-28" placeholder="Patrol notes" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}/><button className="btn w-full justify-center" disabled={!form.boats.length} onClick={commitPatrol}><Save className="w-4 h-4" /> Save Patrol</button></div><div className="lg:col-span-2 space-y-3">{form.boats.map(entry => <PatrolBoatCard key={entry.boatId} campaign={campaign} entry={entry} updatePatrolBoat={updatePatrolBoat} />)}</div></div>;
}
function PatrolBoatCard({ campaign, entry, updatePatrolBoat }) {
  const b = campaign.boats.find(x => x.id === entry.boatId);
  const ceMinusOne = b.enhancements["Chief Engineer"].includes("eng-minus-refit");
  const refit = baseRefitMonths({ flooding: entry.flooding, heavyEngine: entry.heavyEngine, chiefEngineerMinusOne: ceMinusOne });
  const xp = ["S", "Cp"].includes(entry.status) ? 0 : xpFromPatrol({ tonsK: entry.tonsK, returned: entry.returned && entry.status !== "Sc", scuttled: entry.status === "Sc", escortCount: entry.escorts });
  const woundLevel = Object.values(entry.crewWounds).reduce((a, v) => a + safeNumber(v), 0);
  const officerWounds = { ...defaultOfficerWounds(), ...(entry.officerWounds || {}) };
  const freeOptions = entry.freeCrewRole ? ENHANCEMENTS["Crew Section"].filter(e => canAddEnhancement(b, entry.freeCrewRole, e, { free: true })) : [];
  return <div className="card p-4">
    <div className="flex justify-between gap-2">
      <div><h3 className="text-lg font-black">{entry.designation} · {b.name}</h3><div className="small">{b.type} · XP now {b.xp} · {b.tonsK}k tons</div></div>
      <div className="text-right"><div className="font-black text-2xl">+{xp} XP</div><div className="small">Refit: {Math.max(0, refit - safeNumber(entry.fpRefitReduction))} months</div></div>
    </div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
      <Field label="Designation"><select className="input w-full" value={entry.designation} onChange={e => updatePatrolBoat(entry.boatId, { designation: e.target.value })}>{["W", "X", "Y", "Z", "P"].map(x => <option key={x}>{x}</option>)}</select></Field>
      <Field label="Final status"><select className="input w-full" value={entry.status} onChange={e => updatePatrolBoat(entry.boatId, { status: e.target.value, scuttled: e.target.value === "Sc" })}>{STATUS.filter(x => x !== "N" && x !== "R").map(x => <option key={x}>{x}</option>)}</select></Field>
      <Field label="k Tons sunk"><input className="input w-full" type="number" value={entry.tonsK} onChange={e => updatePatrolBoat(entry.boatId, { tonsK: e.target.value })}/></Field>
      <Field label="Damaged/sunk escorts"><input className="input w-full" type="number" value={entry.escorts} onChange={e => updatePatrolBoat(entry.boatId, { escorts: e.target.value })}/></Field>
      <Field label="Replacement U-boat"><select className="input w-full" value={entry.replacementUboat ? "yes" : "no"} onChange={e => updatePatrolBoat(entry.boatId, { replacementUboat: e.target.value === "yes" })}><option value="no">No</option><option value="yes">Yes, Approach loss replacement</option></select></Field>
      <Field label="Replacement VP penalty"><input className="input w-full" type="number" min="0" value={entry.replacementVpPenalty || 0} onChange={e => updatePatrolBoat(entry.boatId, { replacementVpPenalty: e.target.value })}/></Field>
      <Field label="TP purchased"><input className="input w-full" type="number" min="0" max="6" value={entry.tpPurchased} onChange={e => updatePatrolBoat(entry.boatId, { tpPurchased: e.target.value })}/></Field>
      <Field label="XP converted to FP"><input className="input w-full" type="number" min="0" value={entry.xpToFp} onChange={e => updatePatrolBoat(entry.boatId, { xpToFp: e.target.value })}/></Field>
      <Field label="Flooding damage"><select className="input w-full" value={entry.flooding} onChange={e => updatePatrolBoat(entry.boatId, { flooding: e.target.value })}><option value="none">None</option><option value="L-O">L/O track area</option><option value="2ndO+">2nd O or worse</option></select></Field>
      <Field label="Heavy diesel/electric"><select className="input w-full" value={entry.heavyEngine ? "yes" : "no"} onChange={e => updatePatrolBoat(entry.boatId, { heavyEngine: e.target.value === "yes" })}><option value="no">No</option><option value="yes">Yes</option></select></Field>
      <Field label={`FP refit reduction (${campaign.fpRefitCost || 8}/month)`}><input className="input w-full" type="number" min="0" max={refit} value={entry.fpRefitReduction} onChange={e => updatePatrolBoat(entry.boatId, { fpRefitReduction: e.target.value })}/></Field>
      <Field label="Crew wounds total"><div className="font-bold pt-2">{woundLevel} ({woundLevel >= 9 ? "lose 2" : woundLevel >= 5 ? "lose 1" : "no loss"})</div></Field>
    </div>
    <div className="grid grid-cols-3 gap-2 mt-3">
      {["Bow", "Midship", "Stern"].map(sec => <Field key={sec} label={`${sec} wound value`}><select className="input w-full" value={entry.crewWounds[sec]} onChange={e => updatePatrolBoat(entry.boatId, { crewWounds: { ...entry.crewWounds, [sec]: e.target.value } })}><option value="0">None 0</option><option value="1">Light 1</option><option value="2">Medium 2</option><option value="3">Heavy 3</option><option value="4">KIA 4</option></select></Field>)}
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
      {OFFICER_ROLES.map(role => <Field key={role} label={`${role} post-patrol result`}><select className="input w-full" value={officerWounds[role]} onChange={e => updatePatrolBoat(entry.boatId, { officerWounds: { ...officerWounds, [role]: e.target.value } })}>{OFFICER_WOUND_RESULTS.map(result => <option key={result}>{result}</option>)}</select></Field>)}
      <Field label="Acting Captain promoted"><select className="input w-full" value={entry.actingCaptainRole || ""} onChange={e => updatePatrolBoat(entry.boatId, { actingCaptainRole: e.target.value })}><option value="">No Captain promotion</option><option value="1st WO">1st WO becomes Captain</option><option value="2nd WO/Medic">Lower officer acted; Captain replaced</option><option value="Chief Engineer">Chief Engineer acted; Captain replaced</option></select></Field>
      <Field label="All Crew Sections captured/lost/KIA"><select className="input w-full" value={entry.allCrewSectionsLost ? "yes" : "no"} onChange={e => updatePatrolBoat(entry.boatId, { allCrewSectionsLost: e.target.value === "yes" })}><option value="no">No</option><option value="yes">Yes, erase Crew Section enhancements</option></select></Field>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
      <Field label="Free crew enhancement section"><select className="input w-full" value={entry.freeCrewRole || ""} onChange={e => updatePatrolBoat(entry.boatId, { freeCrewRole: e.target.value, freeCrewEnhancement: "" })}><option value="">None</option>{CREW_SECTION_ROLES.map(role => <option key={role} value={role}>{role}</option>)}</select></Field>
      <Field label="Free crew enhancement"><select className="input w-full" value={entry.freeCrewEnhancement || ""} disabled={!entry.freeCrewRole || woundLevel >= 5} onChange={e => updatePatrolBoat(entry.boatId, { freeCrewEnhancement: e.target.value })}><option value="">{woundLevel >= 5 ? "Not available after wound loss" : "Select enhancement"}</option>{freeOptions.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}</select></Field>
    </div>
    <textarea className="input w-full min-h-20 mt-3" placeholder="U-boat notes, officer wounds, return event details" value={entry.notes || ""} onChange={e => updatePatrolBoat(entry.boatId, { notes: e.target.value })}/>
  </div>;
}

function CrewPanel({ campaign, boat, setSelectedBoat, buyEnhancement, convertXpToFp }) {
  const [convert, setConvert] = useState(0);
  return <div className="grid grid-cols-1 lg:grid-cols-4 gap-4"><div className="card p-4 space-y-3"><h2 className="text-xl font-black">U-boat Crew</h2><select className="input w-full" value={boat.id} onChange={e => setSelectedBoat(e.target.value)}>{campaign.boats.map(b => <option key={b.id} value={b.id}>{b.name} · {b.flotilla}</option>)}</select><div className="bg-slate-900 rounded-xl p-3"><div className="font-black text-2xl">{boat.name}</div><div className="small">{boat.type} · {boat.captainName}</div><div className="mt-3 grid grid-cols-2 gap-2"><div><div className="small">XP</div><b>{boat.xp}</b></div><div><div className="small">k Tons</div><b>{boat.tonsK}</b></div></div></div><div className="flex gap-2"><input className="input w-full" type="number" value={convert} onChange={e => setConvert(e.target.value)} /><button className="btn" onClick={() => { convertXpToFp(boat.id, convert); setConvert(0); }}>XP → FP</button></div><div className="small">XP conversion is 1:1 into the campaign Flotilla Points pool.</div><div className="bg-slate-900 rounded-xl p-3 border border-slate-700"><h3 className="font-black">Scuttled survivors</h3><div className="small mt-1">Surviving Officers and Crew Sections retain enhancements and can be assigned as replacements during setup.</div><div className="space-y-2 mt-3">{(campaign.survivors || []).length === 0 && <div className="small">No survivor crews recorded.</div>}{(campaign.survivors || []).map(s => <div key={s.id} className="bg-slate-950 rounded-lg p-2 small"><b>{s.fromBoat}</b> · {s.date}<br/>{s.xp} XP · {s.tonsK}k tons · Captain {s.captainName}</div>)}</div></div></div><div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-3">{CREW_ROLES.map(role => <EnhancementRole key={role} boat={boat} role={role} buyEnhancement={buyEnhancement} />)}</div></div>;
}
function EnhancementRole({ boat, role, buyEnhancement }) {
  const tableKey = role.includes("Crew") ? "Crew Section" : role;
  const purchased = boat.enhancements[role] || [];
  return <div className="card p-4"><h3 className="font-black mb-2">{role}</h3><div className="space-y-2">{ENHANCEMENTS[tableKey].map(e => { const ok = !purchased.includes(e.id) && (!e.prereq || purchased.includes(e.prereq)) && (!e.auto100k || boat.tonsK >= 100) && (e.auto100k || boat.xp >= e.cost); return <div key={e.id} className={`p-3 rounded-xl border ${purchased.includes(e.id) ? "bg-emerald-950 border-emerald-700" : "bg-slate-900 border-slate-700"}`}><div className="flex justify-between gap-2"><div><b>{e.name}</b><div className="small">Level {e.level} · {e.auto100k ? "Auto at 100k tons" : `${e.cost} XP`} · {e.effect}</div></div><button disabled={!ok} className="btn" onClick={() => buyEnhancement(boat.id, role, e)}>{purchased.includes(e.id) ? "Owned" : "Buy"}</button></div></div>; })}</div></div>;
}
function History({ campaign }) { return <div className="card p-4"><h2 className="text-xl font-black mb-3">Patrol History</h2><div className="space-y-3">{campaign.patrols.length === 0 && <div className="small">No patrols logged yet.</div>}{campaign.patrols.map(p => <div key={p.id} className="bg-slate-900 rounded-xl p-3 border border-slate-700"><div className="flex justify-between"><b>{p.date}</b><b>{p.vp} VP</b></div><div className="small mt-1">{p.notes}</div><div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">{p.boats.map(b => <div key={b.boatId} className="small bg-slate-950 rounded-lg p-2">{b.designation}: {b.status} · +{b.gainedXp} XP · +{b.gainedTons}k tons · TP XP {b.xpSpentOnTP || 0} · FP +{b.xpConvertedToFP || 0} · refit {b.refit}{b.replacementUboat ? ` · replacement penalty ${b.replacementVpPenalty || 0} VP` : ""}{b.officerLosses?.length ? ` · officer losses: ${b.officerLosses.map(x => x.role).join(", ")}` : ""}{b.captainPromotion ? ` · ${b.captainPromotion}` : ""}{b.crewSectionsLost ? " · all Crew Section enhancements erased" : ""}{b.lostEnhancements?.length ? ` · lost ${b.lostEnhancements.length} crew enh.` : ""}{b.freeCrewEnhancement ? ` · free ${b.freeCrewEnhancement.role}: ${b.freeCrewEnhancement.name}` : ""}</div>)}</div></div>)}</div></div>; }
function RulesHelper() {
  return <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
    <div className="card p-4 lg:col-span-2">
      <h2 className="text-xl font-black">Patrol Sequence</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
        {["Approach", "Attack"].map(group => <div key={group} className="bg-slate-900 rounded-xl p-3 border border-slate-700">
          <h3 className="font-black mb-2">{group}</h3>
          <div className="space-y-2">{PATROL_SEQUENCE.filter(s => s.step === group).map((s, i) => <div key={`${group}-${s.title}`} className="flex gap-3 rounded-lg bg-slate-950 p-2">
            <div className="gridcell bg-slate-800 text-slate-100">{i + 1}</div>
            <div><div className="font-bold">{s.title} <span className="small">[{s.ref}]</span></div><div className="small">{s.scope}</div></div>
          </div>)}</div>
        </div>)}
      </div>
    </div>
    <div className="card p-4">
      <h2 className="text-xl font-black">Automated formulas</h2>
      <ul className="list-disc pl-5 space-y-2 text-slate-300 mt-3">
        <li>Status codes match the Campaign Log: C, N, S, Sc, P, R, Cp, W/X/Y/Z.</li>
        <li>Initial U-boat values by flotilla slot: #1 30 XP/30k tons, #2 25 XP/25k tons, #3 20 XP/20k tons, #4 15 XP/15k tons.</li>
        <li>Each U-boat starts a Patrol with 2 free TP. Additional TP cost 5 XP each, up to 8 TP total.</li>
        <li>Returning crew XP: 1 XP per 1,000 tons sunk, +20 XP for return to base, +15 XP if scuttled crew returns, +20 XP per damaged or sunk Escort.</li>
        <li>Wound level 5-8 removes one highest Crew Section enhancement; 9+ removes two. No loss can award one free Crew Section enhancement.</li>
        <li>Officer KIA/captured/lost, or Heavy Wounds with a 1-7 post-patrol result, erases that Officer enhancement track.</li>
        <li>If the Captain is lost and the 1st WO is promoted, the 1st WO enhancements move to Captain and the 1st WO track is cleared.</li>
        <li>Sunk or captured U-boats lose all XP and enhancements. Scuttled U-boats are lost, but surviving crew records are retained in the Crew tab.</li>
        <li>All Crew Sections captured/lost/KIA erases all Crew Section enhancements.</li>
        <li>Refit: 1 month for Flooding L/O area, 2 months for 2nd O or worse, +1 month for heavy diesel/electric engine damage.</li>
        <li>FP refit reduction cost is configurable: the rulebook Set-up section uses 8 FP/month; the Crew Enhancement reference sheet shows 15 FP/month.</li>
      </ul>
      <p className="text-slate-300 mt-4">The app does not draw Battle, Patrol, Combat or Damage cards. Enter final Patrol VP, tonnage, return events, wounds, TP purchases, XP-to-FP conversion, and refit damage after resolving the tabletop game.</p>
      <button className="btn mt-4" onClick={() => { localStorage.removeItem("wolfpack-campaigns-v1"); localStorage.removeItem("wolfpack-campaigns-v2"); }}><RotateCcw className="w-4 h-4" /> Clear saved browser data on reload</button>
    </div>
  </div>;
}
