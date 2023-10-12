#! /usr/bin/env node

import { JSDOM } from 'jsdom';
import { $, argv, cd, fs, path } from 'zx';

const [url, folder] = argv._;

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

const downloadWithConcurrency = async (urls, concurrencyLimit, downloadFn) => {
  const downloadBatch = async (batch) => {
    const promises = batch.map(async (url) => {
      await downloadFn(url, true);
    });
    await Promise.all(promises);
  };

  for (let i = 0; i < urls.length; i += concurrencyLimit) {
    const batch = urls.slice(i, i + concurrencyLimit);
    await downloadBatch(batch);
  }
};

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

  await downloadWithConcurrency(linkList, 5, downloadHTML);
}
