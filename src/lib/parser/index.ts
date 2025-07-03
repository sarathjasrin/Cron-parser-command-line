import { ErrorMessages } from "../constants";
import { ParserError } from "../utils";
import { parseField } from "./parser";

export const Parser = (cronStr: string) => {
  const cronFields = cronStr.trim().split(/\s+/);
  if (cronFields.length < 6) {
    throw ParserError(ErrorMessages.INVALID_CRON_STRING, {
      values: cronFields,
    });
  }
  parseField;

  return {
    minute: parseField(cronFields[0], "minute"),
    hour: parseField(cronFields[1], "hour"),
    day: parseField(cronFields[2], "day"),
    month: parseField(cronFields[3], "month"),
    week: parseField(cronFields[4], "week"),
    command: cronFields[5],
  };
};
