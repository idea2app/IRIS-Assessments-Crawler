#! /usr/bin/env node

import { JSDOM } from 'jsdom';
import { $, cd, fs, path } from 'zx';
import WU from 'web-utility';
import { createCommand, Command } from 'commander-jsx';

const downloadHTML = (url: string, fixName = false) =>
  $`wget -c -r -npH -k -p ${fixName ? '-E' : ''} ${url}`;

async function getExtras(filePath: string, selector: string) {
  const {
    window: { document },
  } = await JSDOM.fromFile(filePath);

  const elementLists = [
    ...document.querySelectorAll<HTMLAnchorElement>(selector),
  ].map((tag) => {
    const { href, origin } = tag;

    tag.setAttribute(
      'href',
      href.slice(origin.length) + (path.parse(href).ext ? '' : '.html')
    );

    return href;
  });
  await fs.outputFile(filePath, document.documentElement.outerHTML);

  return elementLists;
}

async function modifySubPageURLs(filePath: string, selector: string) {
  const {
    window: { document },
  } = await JSDOM.fromFile(filePath);

  for (const tag of document.querySelectorAll<HTMLAnchorElement>(selector)) {
    const { href, origin } = tag;

    tag.setAttribute('href', href.slice(origin.length));
  }

  await fs.outputFile(filePath, document.documentElement.outerHTML);
}

async function retryAsyncFunction(asyncFunction, maxRetries) {
  let retries = 0;
  let lastError = null;

  while (retries < maxRetries) {
    try {
      return await asyncFunction();
    } catch (error) {
      retries++;
      lastError = error;
    }
  }
  throw lastError;
}

async function main(url, folder, concurrencyLimit?) {
  await $`rm -rf ${folder}`;
  await $`mkdir -p ${folder}`;
  cd(folder);
  await downloadHTML(url);

  const root = new URL(url).pathname.slice(1);
  const files = await fs.readdir(root);

  for (const file of files) {
    const [name, useless] = file.split('?');
    const oldName = path.join(root, file),
      newName = path.join(root, name);

    if (useless) await $`mv ${oldName} ${newName}`;

    if (!/\.html?$/.test(name)) continue;

    const linkList = await getExtras(newName, 'tr > td:nth-child(2) > a');

    for (const list of WU.splitArray(linkList, concurrencyLimit))
      await Promise.all(list.map((url) => downloadHTML(url, true)));

    const subPageFiles = await fs.readdir('ChemicalLanding');

    cd('ChemicalLanding');

    for (const file of WU.splitArray(subPageFiles, concurrencyLimit))
      await Promise.all(
        file.map((filePath) => modifySubPageURLs(filePath, 'li > .under'))
      );
  }
}

async function mainWithRetry(
  url: string,
  folder: string,
  concurrencyLimit?: number,
  maxRetries?: number
) {
  await retryAsyncFunction(async () => {
    await main(url, folder, concurrencyLimit);
  }, maxRetries);
}

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
    ) =>
      mainWithRetry(
        url,
        folder,
        concurrencyLimit as number,
        maxRetries as number
      )
    }
  />,
  process.argv.slice(2)
);
