import { FieldType, Range, Ranges } from "../../model/common";
import { ParserError } from "../utils";
import { ErrorMessages } from "../constants";
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
