#! /usr/bin/env node

import { JSDOM } from 'jsdom';
import { $, argv, cd, fs, path } from 'zx';

const [url, folder] = argv._;

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
  [...document.querySelectorAll<HTMLAnchorElement>(selector)].map((tag) => {
    const { href, origin } = tag;

    tag.setAttribute('href', href.slice(origin.length));
  });
  await fs.outputFile(filePath, document.documentElement.outerHTML);
}

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

  const linkList = await getExtras(newName, 'tr > td > a');

  for (const link of linkList) await downloadHTML(link, true);
}

const subPageFiles = await fs.readdir('ChemicalLanding');

cd('ChemicalLanding');

for (const file of subPageFiles) await modifySubPageURLs(file, 'li > .under');
