export const ParserError = (message: string, cause = {}) => {
  return new Error(message, { cause });
};

export const PrintTable = (
  rows: { [key: string]: string }[],
  head: string[] | undefined = undefined
) => {
  const Table = require("cli-table3");
  const table = new Table({
    head: head,
  });

  table.push(...rows);
  return table.toString();
};
