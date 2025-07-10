import inquirer from "inquirer";
import { Parser } from "./lib/parser";
import { PrintTable } from "./lib/utils";
import { ColorCode } from "./lib/constants";
import { nextOccurence } from "./lib/parser/parser";

function parseCronString() {
  inquirer
    .prompt([
      {
        type: "input",
        name: "cron_str",
        message: "Please enter the Unix Cron Expression",
        default() {
          return "5 * * * MON SOME_COMMAND";
        },
      },
    ])
    .then(({ cron_str }) => {
      try {
        if (cron_str && cron_str != "done") {
          const result = Parser(cron_str);
          const table = PrintTable([
            { Minute: JSON.stringify(result.minute) },
            { Hour: JSON.stringify(result.hour) },
            { "Day of the Month": JSON.stringify(result.day) },
            { Month: JSON.stringify(result.month) },
            { "Day of week": JSON.stringify(result.week) },
            { Command: result.command },
          ]);

          console.log(table.toString());
          parseCronString();
        } else {
          console.log(ColorCode.fgBlue, "Thank you!");
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error(
            ColorCode.fgRed,
            `Error: ${error.message} Cause: ${JSON.stringify(error.cause)}`
          );
        } else {
          console.log(ColorCode.fgRed, `Error: ${error}}`);
        }

        parseCronString();
      }
    });
}

function justParsing(cronStr: string) {
  const result = Parser(cronStr);
  const nextRun = nextOccurence(result);
  if (nextRun)
    console.log("Next Instance:", new Date().toString(), nextRun[0].toString());
}

//parseCronString();
justParsing("5 * * * * SOME_COMMAND");
