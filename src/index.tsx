#! /usr/bin/env node

import { createCommand, Command } from 'commander-jsx';

import { main } from './Business.js';

Command.execute(
  <Command
    parameters="[options] <url> <folder>"
    options={{
      concurrencyLimit: {
        shortcut: 'c',
        parameters: '<number>',
        pattern: /^\d+$/,
        description: 'set the number of concurrency limit',
      },
      maxRetries: {
        shortcut: 'm',
        parameters: '<number>',
        pattern: /^\d+$/,
        description: 'set the number of maximum times of retries',
      },
    }}
    executor={(
      { concurrencyLimit = 5, maxRetries = 3 },
      url: string,
      folder: string
    ) => main(url, folder, concurrencyLimit as number, maxRetries as number)}
  />,
  process.argv.slice(2)
);
