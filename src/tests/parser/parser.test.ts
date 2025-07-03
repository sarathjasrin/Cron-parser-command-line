import { ErrorMessages } from "src/lib/constants";
import { parseField } from "src/lib/parser/parser";
import { FieldType } from "src/model/common";

describe("parseField: Parse Field Tests", () => {
  const fieldType: { [key: string]: FieldType } = {
    minute: "minute",
    hour: "hour",
    day: "day",
    month: "month",
    week: "week",
  };

  test("[T1] [Minute] Run every 5 minitues", () => {
    const result = parseField("*/5", fieldType.minute);
    expect(result).toEqual([0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]);
  });

  test("[T2] [Minute] Run every 10,15,20 minitues", () => {
    const result = parseField("10,15,20", fieldType.minute);
    expect(result).toEqual([10, 15, 20]);
  });

  test("[T3] [Minute] Run every 5 minitues after 30 mintues", () => {
    const result = parseField("30/5", fieldType.minute);
    expect(result).toEqual([30, 35, 40, 45, 50, 55]);
  });

  test("[T4] [Minute] Run at 10AM", () => {
    const result = parseField("10", fieldType.minute);
    expect(result).toEqual([10]);
  });

  test("[T5] [Month] Should parse Month mix of number and text", () => {
    const result = parseField("2,Dec", fieldType.month);
    expect(result).toEqual([2, 12]);
  });

  describe("Wildcard (*)", () => {
    const expectedRanges: Record<string, number[]> = {
      minute: Array.from({ length: 60 }, (_, i) => i),
      hour: Array.from({ length: 24 }, (_, i) => i),
      day: Array.from({ length: 31 }, (_, i) => i + 1),
      month: Array.from({ length: 12 }, (_, i) => i + 1),
      week: Array.from({ length: 7 }, (_, i) => i),
    };

    (["minute", "hour", "day", "month", "week"] as const).forEach((field) => {
      test(`parses * correctly for ${field}`, () => {
        const result = parseField("*", field);
        expect(result).toEqual(expectedRanges[field]);
      });
    });
  });

  describe("Range (1-2)", () => {
    const expectedRanges: Record<string, number[]> = {
      minute: [1, 2],
      hour: [1, 2],
      day: [1, 2],
      month: [1, 2],
      week: [1, 2],
    };

    (["minute", "hour", "day", "month", "week"] as const).forEach((field) => {
      test(`parses * correctly for ${field}`, () => {
        const result = parseField("1-2", field);
        console.log(result, expectedRanges[field]);

        expect(result).toEqual(expectedRanges[field]);
      });
    });
  });

  describe("List", () => {
    const expectedRanges: Record<string, any> = {
      minute: ["10,20,50", [10, 20, 50]],
      hour: ["1, 2", [1, 2]],
      day: ["20,21,22", [20, 21, 22]],
      month: ["JAN,DEC", [1, 12]],
      week: ["SUN, MON", [0, 1]],
    };

    (["minute", "hour", "day", "month", "week"] as const).forEach((field) => {
      test(`parses * correctly for ${field}`, () => {
        const [input, output] = expectedRanges[field];
        const result = parseField(input, field);
        expect(result).toEqual(output);
      });
    });
  });

  describe("Errors", () => {
    const expectedRanges: Record<string, any> = {
      list: ["1,231", ErrorMessages.INVALID_LIST],
      range: ["1,242/5", ErrorMessages.INVALID_RANGE],
      number: ["test", ErrorMessages.INVALID_NUMBER],
      step: ["1-te", ErrorMessages.INVALID_RANGE],
    };

    (["list", "range", "number", "step"] as const).forEach((field) => {
      test(`parses * correctly for Minute`, () => {
        const [input, output] = expectedRanges[field];
        expect(() => parseField(input, fieldType.minute)).toThrow(output);
      });
    });
  });
});
