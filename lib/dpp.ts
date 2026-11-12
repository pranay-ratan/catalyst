import { BRAND_NAME, DEMO_BANNER } from "@/lib/brand";
import type { Batch, Garment, Status } from "@/lib/types";

export interface LinkedBatch {
  batch: Batch;
  millName: string;
  millLine: string;
  millCity: string;
  country: string;
  unitId: string;
}

export function dppPayload(garment: Garment, linked: LinkedBatch[], status: Status) {
  return {
    schema: "ClearThread DPP demo 1.0",
    disclaimer: DEMO_BANNER,
    productId: garment.id,
    name: garment.name,
    brand: BRAND_NAME,
    materials: [garment.material],
    colour: garment.colorName,
    status,
    waterLitresCleanedForGarment: garment.waterLitres,
    batches: linked.map(({ batch, millName, millLine, millCity, country, unitId }) => ({
      batchId: batch.id,
      facility: millName,
      line: millLine,
      city: millCity,
      country,
      unitId,
      start: batch.start,
      end: batch.end,
      volumeM3: batch.volumeM3,
      colourRemovalPct: batch.colourRemoval,
      codInMgL: batch.codIn,
      codOutMgL: batch.codOut,
      labCodMgL: batch.labCod,
      labDifferencePct: batch.labDiffPct,
      energyKwh: batch.energyKwh,
      status: batch.status,
      withholdReason: batch.withholdReason ?? null,
      auditAt: batch.auditAt,
      auditRef: batch.auditRef,
      downstreamTestId: batch.downstream.id,
      downstreamResult: batch.downstream.result,
    })),
  };
}
