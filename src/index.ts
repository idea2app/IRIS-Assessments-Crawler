#! /usr/bin/env node

import { JSDOM } from 'jsdom';
import { $, argv, cd, fs, path } from 'zx';

const [url, folder] = argv._;

const downloadHTML = (url: string, fixName = false) =>
  $`wget -c -r -npH -k -p ${fixName ? '-E' : ''} ${url}`;

async function getExtras(filePath: string, selector: string, isURLs = true) {
  const {
    window: { document },
  } = await JSDOM.fromFile(filePath);

  const elementLists = [
    ...document.querySelectorAll<HTMLAnchorElement>(selector),
  ].map((tag) => {
    const { href, origin } = tag;

    tag.setAttribute(
      'href',
      isURLs ? href.slice(origin.length) + '.html' : href.slice(origin.length)
    );

    return href;
  });
  await fs.outputFile(filePath, document.documentElement.outerHTML);

  return elementLists;
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

  //Get list of PDFs on the 5th column
  const FirstColumnOfPDFFiles = await getExtras(
    newName,
    'tr > td:nth-child(5) > a',
    false
  );

  for (const pdf of FirstColumnOfPDFFiles) await downloadHTML(pdf, true);

  //Get list of PDFs on the 6th column
  const SecondColumnOfPDFFiles = await getExtras(
    newName,
    'tr > td:nth-child(6) > a',
    false
  );

  for (const pdf of SecondColumnOfPDFFiles) await downloadHTML(pdf, true);

  //Get sub page URLs
  const linkList = await getExtras(newName, 'tr > td:nth-child(2) > a');

  for (const link of linkList) await downloadHTML(link, true);
}
