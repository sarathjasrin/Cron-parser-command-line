const MAX_LIMIT = 100;

interface CronFields {
  minute: number[];
  hour: number[];
  day: number[];
  month: number[];
  week: number[];
  command: string;
}

export type FieldType = keyof CronFields;

export interface Range {
  min: number;
  max: number;
}

export const Ranges: Record<FieldType, Range> = {
  minute: { min: 0, max: 59 },
  hour: { min: 0, max: 23 },
  day: { min: 1, max: 31 },
  month: { min: 1, max: 12 },
  week: { min: 0, max: 6 },
  command: { min: 1, max: MAX_LIMIT },
};

export interface TableHead {
  
}