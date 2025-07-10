import { FieldType, ParsedCron, Range, Ranges } from "../../model/common";
import { ParserError, validateDate } from "../utils";
import { ErrorMessages, MINS_PER_YEAR } from "../constants";
import { Months, WeekDay } from "../../enums";

export const parseField = (field: string, type: FieldType): number[] => {
  const { max, min } = Ranges[type];
  const values: number[] = [];

  if (type === "month" || type === "week") {
    field = field.toUpperCase();
    const monthOrWeekMap = getMonthWeekMapping(field, type);
    if (monthOrWeekMap) field = monthOrWeekMap.toString();
  }

  if (field === "*") {
    for (let i = min; i <= max; i++) values.push(i);
  } else if (field.includes("/")) {
    const [range, step] = field.split("/");
    const stepNum = Number(step);
    const rangeObj = getRange(range, { max, min });

    if (rangeObj instanceof Error) {
      rangeObj.cause = {
        name: type,
        values: step,
      };
      throw rangeObj;
    }

    for (let i = rangeObj.min; i <= rangeObj.max; i += stepNum) {
      values.push(i);
    }
  } else if (field.includes("-")) {
    const rangeObj = getRange(field, { max, min });

    if (rangeObj instanceof Error) {
      rangeObj.cause = {
        name: type,
        values: field,
      };
      throw rangeObj;
    }

    for (let i = rangeObj.min; i <= rangeObj.max; i++) values.push(i);
  } else if (field.includes(",")) {
    const list = getList(field, { max, min });
    if (list instanceof Error) {
      list.cause = {
        name: type,
        values: field,
      };
      throw list;
    }
    values.push(...list);
  } else {
    const value = Number(field);
    if (isNaN(value) || value < min || value > max) {
      throw ParserError(ErrorMessages.INVALID_NUMBER, {
        name: type,
        values: field,
      });
    }
    values.push(value);
  }

  return values;
};

export const nextOccurence = (
  parsedCron: ParsedCron,
  n = 1,
  startDate = new Date()
): Date[] | null => {
  const occurrences: Date[] = [];

  if (!validateDate(startDate)) {
    throw ParserError(ErrorMessages.INVALID_START_DATE);
  }

  let current = new Date(startDate.getTime());

  current.setSeconds(0, 0);

  while (occurrences.length < n) {
    const next = findNextValidDate(current, parsedCron);
    if (!next) return null;
    occurrences.push(next);
    current.setMinutes(current.getMinutes() + 1);
  }

  return occurrences;
};

const getRange = (range: string, limit: Range): Range | Error => {
  if (range === "*") {
    return limit;
  } else if (range.includes("-")) {
    const [start, end] = range.split("-").map(Number);
    if (
      isNaN(start) ||
      isNaN(end) ||
      start < limit.min ||
      end > limit.max ||
      start > end
    ) {
      return ParserError(ErrorMessages.INVALID_RANGE);
    }
    return { min: start, max: end };
  } else {
    const num = Number(range);
    if (isNaN(num)) return ParserError(ErrorMessages.INVALID_RANGE);
    return { min: num, max: limit.max };
  }
};

const getList = (listString: string, limit: Range): number[] | Error => {
  const lists = listString.split(",").map(Number);
  if (lists.some((v) => isNaN(v) || v < limit.min || v > limit.max)) {
    return ParserError(ErrorMessages.INVALID_LIST);
  }
  return lists;
};

const getMonthWeekMapping = (name: string, type = "month"): string | null => {
  let values = [];
  const mapping = [];

  if (name.includes(",")) {
    values = name.split(",");
  } else {
    values = [name];
  }

  for (let v of values) {
    v = v.trim();
    const num = Number(v);
    if (!isNaN(num)) {
      mapping.push(num);
      continue;
    }

    const value =
      type === "month"
        ? Months[v as keyof typeof Months]
        : WeekDay[v as keyof typeof WeekDay];
    if (typeof value === "number") {
      mapping.push(value);
    }
  }
  return mapping.length > 0 ? mapping.join(",") : null;
};

const findNextValidDate = (
  currentDate: Date,
  parsedCron: ParsedCron
): Date | null => {
  let attempts = 0;

  while (attempts < MINS_PER_YEAR) {
    const matches =
      parsedCron.minute.includes(currentDate.getMinutes()) &&
      parsedCron.hour.includes(currentDate.getHours()) &&
      parsedCron.day.includes(currentDate.getDate()) &&
      parsedCron.month.includes(currentDate.getMonth() + 1) &&
      parsedCron.week.includes(currentDate.getDay());

    if (matches) {
      return new Date(currentDate);
    }

    attempts++;
  }

  return null;
};
