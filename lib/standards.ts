export interface StandardRule {
  id: string;
  title: string;
  rule: string;
  detail: string;
}

export const STANDARD_RULES: StandardRule[] = [
  {
    id: "cod",
    title: "COD out",
    rule: "≤ 200 mg/L",
    detail: "Chemical oxygen demand in the water leaving the unit must be 200 mg/L or lower.",
  },
  {
    id: "colour",
    title: "Colour removal",
    rule: "≥ 95%",
    detail: "At least 95% of the dye colour measured at the start of the batch must be gone.",
  },
  {
    id: "lab",
    title: "Sensor and laboratory",
    rule: "Within ±10%",
    detail: "The laboratory cross-check must agree with the unit sensor within 10 percent.",
  },
  {
    id: "audit",
    title: "Independent audit",
    rule: "Within 72 hours",
    detail: "An auditor who does not work for the mill or the brand signs the file within 72 hours.",
  },
  {
    id: "downstream",
    title: "Downstream water",
    rule: "At least monthly",
    detail: "Community monitors test the water downstream of the mill at least once a month.",
  },
];
