import { AUDITOR_NAME, MONITOR_NAME, MONTH_BATCHES, MONTH_TREATED_M3, MONTH_VERIFIED_M3 } from "@/lib/brand";
import {
  CHINO_BATCH_ID,
  CHINO_GARMENT_ID,
  DENIM_BATCH_2_ID,
  DENIM_BATCH_ID,
  DENIM_GARMENT_ID,
  HERO_BATCH_ID,
  HERO_GARMENT_ID,
  HOODIE_BATCH_2_ID,
  HOODIE_BATCH_ID,
  HOODIE_GARMENT_ID,
  OXFORD_BATCH_ID,
  OXFORD_GARMENT_ID,
  POLO_BATCH_ID,
  POLO_GARMENT_ID,
  REVIEW_BATCH_ID,
  REVIEW_GARMENT_ID,
  WITHHELD_BATCH_ID,
  WITHHELD_GARMENT_ID,
} from "@/lib/ids";
import type { Batch, DownstreamTest, Garment, Mill, ScanPoint, Status, TrailStep } from "@/lib/types";

export const mills: Mill[] = [
  {
    id: "sonali",
    name: "Sonali Dyeing",
    line: "Line 1",
    city: "Gazipur",
    country: "Bangladesh",
    unitId: "VX-0142",
    uptime: 99.2,
  },
  {
    id: "meghna",
    name: "Meghna Textiles",
    line: "Line 2",
    city: "Narayanganj",
    country: "Bangladesh",
    unitId: "VX-0188",
    uptime: 98.6,
  },
  {
    id: "rupa",
    name: "Rupa Fabrics",
    line: "Line 3",
    city: "Ashulia",
    country: "Bangladesh",
    unitId: "VX-0207",
    uptime: 97.8,
  },
];

const COD_REASON = "COD out 260 mg/L exceeds the 200 mg/L standard";
const LAB_REASON = "Lab cross-check disagrees with the sensor by 18%";
const AS_OF_MS = Date.parse("2026-11-30T18:00:00.000Z");

type Role = "standard" | "hero" | "withheld-cod" | "withheld-lab" | "review" | "drift";

interface Draft {
  uid: string;
  millId: string;
  role: Role;
  start: string;
  end: string;
  volumeM3: number;
  colourRemoval: number;
  codIn: number;
  codOut: number;
  labCod: number;
  labDiffPct: number;
  status: Status;
  withholdReason?: string;
  auditAt: string | null;
  id?: string;
}

function mulberry32(seed: number) {
  let state = seed >>> 0;
  return function random() {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function fnv(input: string): string {
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

function unitInterval(seed: string): number {
  return (Number.parseInt(fnv(seed), 16) % 10000) / 10000;
}

function pad(value: number): string {
  return value.toString().padStart(2, "0");
}

function diffPct(sensor: number, lab: number): number {
  if (sensor === 0) return 0;
  return Math.round((Math.abs(lab - sensor) / sensor) * 1000) / 10;
}

function eachUtcDay(start: string, end: string): string[] {
  const days: string[] = [];
  let cursor = Date.parse(`${start}T00:00:00.000Z`);
  const last = Date.parse(`${end}T00:00:00.000Z`);
  while (cursor <= last) {
    days.push(new Date(cursor).toISOString().slice(0, 10));
    cursor += 86_400_000;
  }
  return days;
}

function shuffle(values: number[], random: () => number): number[] {
  const copy = [...values];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    const current = copy[index] ?? 0;
    copy[index] = copy[swap] ?? 0;
    copy[swap] = current;
  }
  return copy;
}

function roleFor(day: string, slot: number): Role {
  if (slot !== 0) return "standard";
  if (day === "2026-11-24") return "withheld-cod";
  if (day === "2026-11-25") return "review";
  if (day === "2026-11-26") return "withheld-lab";
  if (day === "2026-11-27") return "hero";
  if (day === "2026-11-28") return "drift";
  return "standard";
}

function scaleToSum(values: readonly number[], target: number, min: number, max: number): number[] {
  const total = values.reduce((sum, value) => sum + value, 0);
  if (total <= 0 || values.length === 0) throw new Error("Cannot scale volumes");
  let current = values.map((value) => Math.min(max, Math.max(min, Math.round((value / total) * target))));
  let remainder = target - current.reduce((sum, value) => sum + value, 0);
  let guard = 0;
  while (remainder !== 0 && guard < 20000) {
    guard += 1;
    const order = current
      .map((value, index) => ({ value, index }))
      .sort((a, b) => (remainder > 0 ? a.value - b.value : b.value - a.value));
    let moved = false;
    for (const entry of order) {
      if (remainder === 0) break;
      const value = current[entry.index] ?? 0;
      if (remainder > 0 && value < max) {
        current = current.map((item, index) => (index === entry.index ? item + 1 : item));
        remainder -= 1;
        moved = true;
      } else if (remainder < 0 && value > min) {
        current = current.map((item, index) => (index === entry.index ? item - 1 : item));
        remainder += 1;
        moved = true;
      }
    }
    if (!moved) break;
  }
  if (remainder !== 0) throw new Error(`Volume scale remainder ${remainder}`);
  return current;
}

function passingMetrics(random: () => number) {
  const codIn = 800 + Math.floor(random() * 1401);
  const codOut = 40 + Math.floor(random() * 141);
  const colourRemoval = Math.round((95 + random() * 4.5) * 10) / 10;
  const swing = (random() * 12 - 6) / 100;
  const labCod = Math.round(codOut * (1 + swing) * 10) / 10;
  return { codIn, codOut, colourRemoval, labCod, labDiffPct: diffPct(codOut, labCod) };
}

function fixedMetrics(role: Exclude<Role, "standard">) {
  if (role === "hero") {
    return { codIn: 1640, codOut: 68, colourRemoval: 98.6, labCod: 71, status: "verified" as const };
  }
  if (role === "drift") {
    return { codIn: 1510, codOut: 125, colourRemoval: 97.8, labCod: 135.5, status: "verified" as const };
  }
  if (role === "withheld-cod") {
    return {
      codIn: 1860,
      codOut: 260,
      colourRemoval: 96.4,
      labCod: 268,
      status: "withheld" as const,
      withholdReason: COD_REASON,
    };
  }
  if (role === "withheld-lab") {
    return {
      codIn: 1420,
      codOut: 150,
      colourRemoval: 97.1,
      labCod: 177,
      status: "withheld" as const,
      withholdReason: LAB_REASON,
    };
  }
  return { codIn: 1580, codOut: 96, colourRemoval: 97.4, labCod: 101, status: "review" as const };
}

function buildTrace(codIn: number, codOut: number, seed: string): number[] {
  const random = mulberry32(Math.floor(unitInterval(seed) * 1_000_000_000) + 1);
  const points: number[] = [codIn];
  for (let index = 1; index < 29; index += 1) {
    const t = index / 29;
    const eased = 1 - (1 - t) ** 1.35;
    const base = codIn + (codOut - codIn) * eased;
    const wobble = (random() - 0.5) * Math.max(8, Math.abs(codIn - codOut) * 0.04);
    const previous = points[index - 1] ?? codIn;
    const raw = Math.round(base + wobble);
    points.push(Math.min(previous, Math.max(Math.min(codIn, codOut), raw)));
  }
  points.push(codOut);
  return points;
}

function downstreamFor(millId: string, start: string): DownstreamTest {
  const date = new Date(start);
  const testMonth = date.getUTCDate() >= 15 ? date.getUTCMonth() : date.getUTCMonth() - 1;
  const at = new Date(Date.UTC(date.getUTCFullYear(), testMonth, 15, 9, 0, 0)).toISOString();
  const id = `DW-${at.slice(0, 7)}-${millId}`;
  return {
    id,
    at,
    result: "clean",
    note: `${MONITOR_NAME}: no dye signature detected downstream.`,
    hash: fnv(`${id}:${at}`),
  };
}

function buildTrail(batch: Omit<Batch, "trail">): TrailStep[] {
  const auditState = batch.status === "review" ? "pending" : batch.status === "withheld" ? "failed" : "done";
  const auditDetail =
    batch.status === "review"
      ? "Waiting for the independent auditor."
      : batch.status === "withheld"
        ? (batch.withholdReason ?? "The auditor withheld the seal.")
        : `${AUDITOR_NAME} signed the batch.`;
  return [
    {
      id: "sensor",
      label: "Sensor log",
      at: batch.start,
      hash: batch.sensorHash,
      detail: "Readings captured on the Viridis unit.",
      state: "done",
    },
    {
      id: "hash",
      label: "Data hash",
      at: batch.end,
      hash: batch.dataHash,
      detail: "Batch file sealed when treatment ended.",
      state: "done",
    },
    {
      id: "audit",
      label: "Auditor sign-off",
      at: batch.auditAt,
      hash: batch.auditAt ? fnv(batch.auditRef) : "pending",
      detail: auditDetail,
      state: auditState,
    },
    {
      id: "downstream",
      label: "Downstream test",
      at: batch.downstream.at,
      hash: batch.downstream.hash,
      detail: batch.downstream.note,
      state: "done",
    },
  ];
}

function toBatch(draft: Draft & { id: string }): Batch {
  const trace = buildTrace(draft.codIn, draft.codOut, draft.uid);
  const energyKwh = Math.round(draft.volumeM3 * (0.92 + unitInterval(`${draft.uid}:energy`) * 0.5) * 10) / 10;
  const sensorHash = fnv(`${draft.id}|${draft.start}|sensor`);
  const dataHash = fnv(`${draft.id}|${draft.volumeM3}|${draft.codIn}|${draft.codOut}|${draft.end}`);
  const alerts: Batch["alerts"] = [];
  if (draft.role === "withheld-cod") alerts.push("withheld");
  if (draft.role === "drift") alerts.push("drift");
  if (draft.role === "review" && draft.start.startsWith("2026-11")) alerts.push("overdue");
  const partial = {
    id: draft.id,
    millId: draft.millId,
    start: draft.start,
    end: draft.end,
    volumeM3: draft.volumeM3,
    colourRemoval: draft.colourRemoval,
    codIn: draft.codIn,
    codOut: draft.codOut,
    trace,
    energyKwh,
    labCod: draft.labCod,
    labDiffPct: draft.labDiffPct,
    status: draft.status,
    withholdReason: draft.withholdReason,
    auditAt: draft.auditAt,
    auditRef: `AUD-${draft.id}`,
    sensorHash,
    dataHash,
    downstream: downstreamFor(draft.millId, draft.start),
    alerts,
  };
  return { ...partial, trail: buildTrail(partial) };
}

function pinId(list: Draft[], uid: string, id: string): Draft[] {
  const current = list.find((item) => item.uid === uid);
  const occupant = list.find((item) => item.id === id);
  if (!current?.id) throw new Error(`Missing draft ${uid}`);
  if (!occupant) throw new Error(`Missing id ${id}`);
  if (current.id === id) return list;
  return list.map((item) => {
    if (item.uid === uid) return { ...item, id };
    if (item.uid === occupant.uid) return { ...item, id: current.id };
    return item;
  });
}

function takeVerified(drafts: Draft[], used: Set<string>, millId?: string): string {
  const pool = drafts.filter((draft) => draft.status === "verified" && draft.role === "standard" && !used.has(draft.uid));
  const found = pool.find((draft) => draft.millId === millId) ?? pool[0];
  if (!found) throw new Error("Not enough verified batches for garments");
  used.add(found.uid);
  return found.uid;
}

function buildDataset(): { batches: Batch[]; garments: Garment[]; scans: ScanPoint[] } {
  const random = mulberry32(2026);
  const days = eachUtcDay("2026-09-02", "2026-11-30");
  if (days.length !== 90) throw new Error(`Expected 90 days, received ${days.length}`);
  const novemberCounts = shuffle([...Array(6).fill(2), ...Array(12).fill(3), ...Array(12).fill(4)], random);
  if (novemberCounts.reduce((sum, count) => sum + count, 0) !== 96) throw new Error("November count mismatch");

  const drafts: Draft[] = [];
  let millCursor = 0;
  let novemberIndex = 0;
  for (const day of days) {
    const count = day.startsWith("2026-11")
      ? (novemberCounts[novemberIndex++] ?? 3)
      : 2 + Math.floor(random() * 3);
    for (let slot = 0; slot < count; slot += 1) {
      const role = roleFor(day, slot);
      const mill = role === "hero" ? mills[0] : mills[millCursor % mills.length];
      millCursor += 1;
      if (!mill) throw new Error("Missing mill");
      const minute = [0, 15, 30, 45][Math.floor(random() * 4)] ?? 0;
      const start = `${day}T${pad(6 + slot * 2)}:${pad(minute)}:00.000Z`;
      const duration = 3 + Math.floor(random() * 2);
      const end = new Date(Date.parse(start) + duration * 3_600_000).toISOString();
      const volumeM3 = 20 + Math.floor(random() * 51);
      const metrics = role === "standard" ? { ...passingMetrics(random), status: "verified" as const } : fixedMetrics(role);
      const auditAt =
        metrics.status === "review"
          ? null
          : new Date(Math.max(Date.parse(end), Math.min(Date.parse(end) + (6 + Math.floor(random() * 40)) * 3_600_000, AS_OF_MS))).toISOString();
      drafts.push({
        uid: `d-${drafts.length + 1}`,
        millId: mill.id,
        role,
        start,
        end,
        volumeM3,
        colourRemoval: metrics.colourRemoval,
        codIn: metrics.codIn,
        codOut: metrics.codOut,
        labCod: metrics.labCod,
        labDiffPct: diffPct(metrics.codOut, metrics.labCod),
        status: metrics.status,
        withholdReason: "withholdReason" in metrics ? metrics.withholdReason : undefined,
        auditAt,
      });
    }
  }

  const volumeByRole: Partial<Record<Role, number>> = {
    "withheld-cod": 22,
    "withheld-lab": 24,
    review: 24,
  };
  const withLockedVolumes = drafts.map((draft) => {
    const locked = draft.start.startsWith("2026-11") ? volumeByRole[draft.role] : undefined;
    return locked ? { ...draft, volumeM3: locked } : draft;
  });
  const verifiedNovember = withLockedVolumes.filter((draft) => draft.start.startsWith("2026-11") && draft.status === "verified");
  const scaled = scaleToSum(
    verifiedNovember.map((draft) => draft.volumeM3),
    MONTH_VERIFIED_M3,
    20,
    70,
  );
  const volumeByUid = new Map(verifiedNovember.map((draft, index) => [draft.uid, scaled[index] ?? draft.volumeM3]));
  const volumed = withLockedVolumes.map((draft) =>
    volumeByUid.has(draft.uid) ? { ...draft, volumeM3: volumeByUid.get(draft.uid) ?? draft.volumeM3 } : draft,
  );

  const extras = volumed.filter((draft) => !draft.start.startsWith("2026-11") && draft.role === "standard");
  const withheldExtras = new Set(extras.slice(0, 4).map((draft) => draft.uid));
  const reviewExtras = new Set(extras.slice(4, 20).map((draft) => draft.uid));
  const adjusted = volumed.map((draft) => {
    if (withheldExtras.has(draft.uid)) {
      const labCod = Math.round(draft.codOut * 1.18 * 10) / 10;
      const labDiff = diffPct(draft.codOut, labCod);
      return {
        ...draft,
        status: "withheld" as const,
        labCod,
        labDiffPct: labDiff,
        withholdReason: `Lab cross-check disagrees with the sensor by ${labDiff}%`,
      };
    }
    if (reviewExtras.has(draft.uid)) return { ...draft, status: "review" as const, auditAt: null };
    return draft;
  });

  const lastNumber = 2500;
  const firstNumber = lastNumber - adjusted.length + 1;
  let sequence = firstNumber;
  let identified: Draft[] = adjusted.map((draft) => ({ ...draft, id: `A-${sequence++}` }));
  const byRole = (role: Role) => {
    const found = identified.find((draft) => draft.role === role);
    if (!found) throw new Error(`Missing role ${role}`);
    return found.uid;
  };
  const used = new Set<string>([byRole("hero"), byRole("review"), byRole("withheld-cod"), byRole("drift")]);
  const links = {
    hero: byRole("hero"),
    review: byRole("review"),
    withheld: byRole("withheld-cod"),
    denim: takeVerified(identified, used, "rupa"),
    denim2: takeVerified(identified, used, "rupa"),
    hoodie: takeVerified(identified, used, "meghna"),
    hoodie2: takeVerified(identified, used, "meghna"),
    chino: takeVerified(identified, used, "rupa"),
    polo: takeVerified(identified, used, "sonali"),
    oxford: takeVerified(identified, used, "meghna"),
  };
  const pins: [string, string][] = [
    [links.hero, HERO_BATCH_ID],
    [links.review, REVIEW_BATCH_ID],
    [links.withheld, WITHHELD_BATCH_ID],
    [links.denim, DENIM_BATCH_ID],
    [links.denim2, DENIM_BATCH_2_ID],
    [links.hoodie, HOODIE_BATCH_ID],
    [links.hoodie2, HOODIE_BATCH_2_ID],
    [links.chino, CHINO_BATCH_ID],
    [links.polo, POLO_BATCH_ID],
    [links.oxford, OXFORD_BATCH_ID],
  ];
  for (const [uid, id] of pins) identified = pinId(identified, uid, id);

  const batches = identified.map((draft) => toBatch(draft as Draft & { id: string }));
  const garments: Garment[] = [
    {
      id: HERO_GARMENT_ID,
      name: "Navy cotton T-shirt",
      color: "#1B3A4B",
      colorName: "Navy",
      silhouette: "tee",
      material: "100% cotton",
      waterLitres: 31,
      batchIds: [HERO_BATCH_ID],
      scans: 1486,
      cottonOrigin: "Contract farm cluster, northern growing region (demo)",
      spunAt: "Northline spinning partner (demo)",
      yarnLot: "Y-8841",
    },
    {
      id: DENIM_GARMENT_ID,
      name: "Indigo denim jacket",
      color: "#243E73",
      colorName: "Indigo",
      silhouette: "jacket",
      material: "100% cotton denim",
      waterLitres: 84,
      batchIds: [DENIM_BATCH_ID, DENIM_BATCH_2_ID],
      scans: 966,
      cottonOrigin: "Contract farm cluster, coastal plain (demo)",
      spunAt: "Northline spinning partner (demo)",
      yarnLot: "Y-9012",
    },
    {
      id: REVIEW_GARMENT_ID,
      name: "Sage linen shirt",
      color: "#7E947C",
      colorName: "Sage",
      silhouette: "shirt",
      material: "100% linen",
      waterLitres: 28,
      batchIds: [REVIEW_BATCH_ID],
      scans: 214,
      cottonOrigin: "Flax grower group, river valley (demo)",
      spunAt: "Northline spinning partner (demo)",
      yarnLot: "Y-7740",
    },
    {
      id: WITHHELD_GARMENT_ID,
      name: "Rose jersey dress",
      color: "#C45B78",
      colorName: "Rose",
      silhouette: "dress",
      material: "Cotton jersey",
      waterLitres: 36,
      batchIds: [WITHHELD_BATCH_ID],
      scans: 58,
      cottonOrigin: "Contract farm cluster, northern growing region (demo)",
      spunAt: "Northline spinning partner (demo)",
      yarnLot: "Y-6628",
    },
    {
      id: HOODIE_GARMENT_ID,
      name: "Black cotton hoodie",
      color: "#22262A",
      colorName: "Black",
      silhouette: "hoodie",
      material: "100% cotton fleece",
      waterLitres: 52,
      batchIds: [HOODIE_BATCH_ID, HOODIE_BATCH_2_ID],
      scans: 1104,
      cottonOrigin: "Contract farm cluster, inland plateau (demo)",
      spunAt: "Northline spinning partner (demo)",
      yarnLot: "Y-4419",
    },
    {
      id: CHINO_GARMENT_ID,
      name: "Sand chino trousers",
      color: "#C6B59A",
      colorName: "Sand",
      silhouette: "trousers",
      material: "98% cotton, 2% elastane",
      waterLitres: 44,
      batchIds: [CHINO_BATCH_ID],
      scans: 640,
      cottonOrigin: "Contract farm cluster, coastal plain (demo)",
      spunAt: "Northline spinning partner (demo)",
      yarnLot: "Y-3304",
    },
    {
      id: POLO_GARMENT_ID,
      name: "Coral kids polo",
      color: "#E07A5F",
      colorName: "Coral",
      silhouette: "polo",
      material: "100% cotton",
      waterLitres: 22,
      batchIds: [POLO_BATCH_ID],
      scans: 388,
      cottonOrigin: "Contract farm cluster, northern growing region (demo)",
      spunAt: "Northline spinning partner (demo)",
      yarnLot: "Y-2281",
    },
    {
      id: OXFORD_GARMENT_ID,
      name: "White oxford shirt",
      color: "#E7E0D2",
      colorName: "White",
      silhouette: "shirt",
      material: "100% cotton oxford",
      waterLitres: 27,
      batchIds: [OXFORD_BATCH_ID],
      scans: 812,
      cottonOrigin: "Contract farm cluster, inland plateau (demo)",
      spunAt: "Northline spinning partner (demo)",
      yarnLot: "Y-1188",
    },
  ];

  const scanRandom = mulberry32(20261);
  const scans = eachUtcDay("2026-09-02", "2026-11-30").map((date) => ({
    date,
    scans: 24 + Math.floor(scanRandom() * 96),
  }));

  assertDataset(batches, garments);
  return { batches, garments, scans };
}

function assertDataset(batches: Batch[], garments: Garment[]) {
  const ids = new Set(batches.map((batch) => batch.id));
  if (ids.size !== batches.length) throw new Error("Duplicate batch ids");
  const month = batches.filter((batch) => batch.start.startsWith("2026-11"));
  const treated = month.reduce((sum, batch) => sum + batch.volumeM3, 0);
  const verified = month
    .filter((batch) => batch.status === "verified")
    .reduce((sum, batch) => sum + batch.volumeM3, 0);
  if (month.length !== MONTH_BATCHES || treated !== MONTH_TREATED_M3 || verified !== MONTH_VERIFIED_M3) {
    throw new Error(`Month invariant failed: batches ${month.length}, treated ${treated}, verified ${verified}`);
  }
  const hero = batches.find((batch) => batch.id === HERO_BATCH_ID);
  if (!hero || hero.status !== "verified" || hero.millId !== "sonali" || hero.colourRemoval !== 98.6) {
    throw new Error("Hero batch is not the navy-shirt record");
  }
  const withheld = batches.find((batch) => batch.id === WITHHELD_BATCH_ID);
  if (!withheld || withheld.status !== "withheld" || withheld.withholdReason !== COD_REASON) {
    throw new Error("Withheld showcase batch is wrong");
  }
  const review = batches.find((batch) => batch.id === REVIEW_BATCH_ID);
  if (!review || review.status !== "review" || review.auditAt !== null) {
    throw new Error("Review showcase batch is wrong");
  }
  for (const garment of garments) {
    for (const batchId of garment.batchIds) {
      if (!ids.has(batchId)) throw new Error(`Garment ${garment.id} missing batch ${batchId}`);
    }
  }
  if (garments.find((garment) => garment.id === HERO_GARMENT_ID)?.waterLitres !== 31) {
    throw new Error("Hero water litres must be 31");
  }
}

const dataset = buildDataset();

export const batches: Batch[] = dataset.batches;
export const garments: Garment[] = dataset.garments;
export const scanSeries: ScanPoint[] = dataset.scans;

export function getBatch(id: string): Batch | undefined {
  return batches.find((batch) => batch.id === id);
}

export function getGarment(id: string): Garment | undefined {
  return garments.find((garment) => garment.id === id);
}

export function getMill(id: string): Mill | undefined {
  return mills.find((mill) => mill.id === id);
}

export function millById(id: string): Mill {
  const mill = getMill(id);
  if (!mill) throw new Error(`Unknown mill ${id}`);
  return mill;
}
