#! /usr/bin/env node

import { JSDOM } from 'jsdom';
import { $, cd, fs, path } from 'zx';
import { splitArray } from 'web-utility';
import { createCommand, Command } from 'commander-jsx';

const downloadHTML = (url: string, fixName = false) =>
  $`wget -c -r -npH -k -p ${fixName ? '-E' : ''} ${url}`;

async function getSubPageURLs(filePath: string, selector: string) {
  const {
    window: { document },
  } = await JSDOM.fromFile(filePath);

  const urls = [...document.querySelectorAll<HTMLAnchorElement>(selector)].map(
    (tag) => {
      const { href, origin } = tag;

      tag.setAttribute('href', href.slice(origin.length) + '.html');

      return href;
    }
  );
  await fs.outputFile(filePath, document.documentElement.outerHTML);

  return urls;
}

const downloadWithConcurrency = async (urls, concurrencyLimit) => {
  for (const list of splitArray<string>(urls, concurrencyLimit)) {
    await Promise.all(
      list.map(async (url) => {
        await downloadHTML(url, true);
      })
    );
  }
};

const main = async (url: string, folder: string, concurrencyLimit?: number) => {
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

    const linkList = await getSubPageURLs(newName, 'tr > td:nth-child(2) > a');

    await downloadWithConcurrency(linkList, concurrencyLimit);
  }
};

Command.execute(
  <Command
    parameters="[url] [folder] [concurrencyLimits]"
    executor={(_, url: string, folder: string, concurrencyLimit = 5) =>
      main(url, folder, concurrencyLimit as number)
    }
  />,
  process.argv.slice(2)
);