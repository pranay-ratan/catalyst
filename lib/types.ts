export type Status = "verified" | "review" | "withheld";

export type Silhouette = "tee" | "jacket" | "shirt" | "dress" | "hoodie" | "trousers" | "polo";

export interface Mill {
  id: string;
  name: string;
  line: string;
  city: string;
  country: string;
  unitId: string;
  uptime: number;
}

export interface DownstreamTest {
  id: string;
  at: string;
  result: "clean";
  note: string;
  hash: string;
}

export interface TrailStep {
  id: string;
  label: string;
  at: string | null;
  hash: string;
  detail: string;
  state: "done" | "pending" | "failed";
}

export interface Batch {
  id: string;
  millId: string;
  start: string;
  end: string;
  volumeM3: number;
  colourRemoval: number;
  codIn: number;
  codOut: number;
  trace: number[];
  energyKwh: number;
  labCod: number;
  labDiffPct: number;
  status: Status;
  withholdReason?: string;
  auditAt: string | null;
  auditRef: string;
  sensorHash: string;
  dataHash: string;
  downstream: DownstreamTest;
  alerts: Array<"withheld" | "drift" | "overdue">;
  trail: TrailStep[];
}

export interface Garment {
  id: string;
  name: string;
  color: string;
  colorName: string;
  silhouette: Silhouette;
  material: string;
  waterLitres: number;
  batchIds: string[];
  scans: number;
  cottonOrigin: string;
  spunAt: string;
  yarnLot: string;
}

export interface ScanPoint {
  date: string;
  scans: number;
}

export type RangeKey = "7d" | "30d" | "90d" | "month";
export type ViewAs = "brand" | "mill" | "viridis";
