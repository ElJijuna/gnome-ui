#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { Command } from 'commander';

import { runStatus, runUpdate, runVerify } from './cli.js';

const currentDir = dirname(fileURLToPath(import.meta.url));
const { version: packageVersion } = JSON.parse(
  readFileSync(join(currentDir, '..', 'package.json'), 'utf8'),
) as { version: string };

const program = new Command();

program.name('gnomeui').description('GNOME UI project utilities').version(packageVersion);

program
  .command('status', { isDefault: true })
  .description('Show installed @gnome-ui packages and their status against npm latest')
  .action(runStatus);

program
  .command('verify')
  .description('Compare installed @gnome-ui packages with the latest npm versions')
  .action(runVerify);

program
  .command('update')
  .description('Compare installed @gnome-ui packages with the latest npm versions and update them')
  .action(runUpdate);

try {
  await program.parseAsync(process.argv);
} catch (error: unknown) {
  const message = error instanceof Error ? error.message : String(error);

  console.error(`\n${message}`);
  process.exitCode = 1;
}
