#!/usr/bin/env bun

import { Command } from "commander";
import { runWakeup } from "./tui/wakeup";
import { settings } from "./tui/settings"

const program = new Command();

program
  .name("sidekick")
  .description("Sidekick cli")
  .version("0.0.1");

program
  .command("launch")
  .description("Show the banner and pick cli or exit mode")
  .action(async () => {
    await runWakeup()
  });

program
  .command("settings")
  .description("Show the settings menu")
  .action(async () => {
    await settings()
  });

await program.parseAsync(process.argv);
