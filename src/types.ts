/** Verification status shown on a batch passport and the brand dashboard. */
export type BatchStatus = 'verified' | 'review' | 'withheld';

/**
 * One dye batch. All values are demo data.
 * `afterLimit` is the demo reference limit the post-treatment value is compared against.
 */
export interface Batch {
  id: string;
  brand: string;
  garment: string;
  mill: string;
  country: string;
  treatedOn: string; // ISO date, YYYY-MM-DD
  method: string;
  litersTreated: number;
  pollutant: string;
  beforeValue: number;
  afterValue: number;
  afterLimit: number;
  unit: string;
  lab: string;
  reportDate: string; // ISO date, YYYY-MM-DD
  litersReused: number;
  status: BatchStatus;
}
