import { ErrorMessages } from "src/lib/constants";
import { Parser } from "src/lib/parser";

describe("Parser tests", () => {
  test('Parses "0 0 * * * ls"', () => {
    expect(Parser("0 0 * * * ls")).toEqual({
      minute: [0],
      hour: [0],
      day: Array.from({ length: 31 }, (_, i) => i + 1),
      month: Array.from({ length: 12 }, (_, i) => i + 1),
      week: Array.from({ length: 7 }, (_, i) => i),
      command: "ls",
    });
  });

  test('Parses "*/15 9-12 * * 1-5 ls"', () => {
    expect(Parser("*/15 9-12 * * 1-5 ls")).toEqual({
      minute: [0, 15, 30, 45],
      hour: [9, 10, 11, 12],
      day: Array.from({ length: 31 }, (_, i) => i + 1),
      month: Array.from({ length: 12 }, (_, i) => i + 1),
      week: [1, 2, 3, 4, 5],
      command: "ls",
    });
  });

  test('Parses list "5,10,20 14 * * MON ls"', () => {
    expect(Parser("5,10,20 14 * * MON ls")).toEqual({
      minute: [5, 10, 20],
      hour: [14],
      day: Array.from({ length: 31 }, (_, i) => i + 1),
      month: Array.from({ length: 12 }, (_, i) => i + 1),
      week: [1],
      command: "ls",
    });
  });

  test('Parses range + step "0-30/5 8-18/2 * * * ls"', () => {
    expect(Parser("0-30/5 8-18/2 * * * ls")).toEqual({
      minute: [0, 5, 10, 15, 20, 25, 30],
      hour: [8, 10, 12, 14, 16, 18],
      day: Array.from({ length: 31 }, (_, i) => i + 1),
      month: Array.from({ length: 12 }, (_, i) => i + 1),
      week: Array.from({ length: 7 }, (_, i) => i),
      command: "ls",
    });
  });
});

describe("Invalid Cron Expressions", () => {
  test("Throws on INVALID_CRON_STRING (4 parts)", () => {
    expect(() => Parser("* * * *")).toThrow(ErrorMessages.INVALID_CRON_STRING);
  });

  test("Throws on Invalid Number month (13)", () => {
    expect(() => Parser("0 0 1 13 * ls")).toThrow(ErrorMessages.INVALID_NUMBER);
  });

  test("Throws on Invalid List (61)", () => {
    expect(() => Parser("0,61 * * * * ls")).toThrow(ErrorMessages.INVALID_LIST);
  });

  test("Throws on Invalid Range = 0", () => {
    expect(() => Parser("0-61 0 0 1 * ls")).toThrow(
      ErrorMessages.INVALID_RANGE
    );
  });
});
