import { JSDOM } from 'jsdom';
import { $, cd, fs, path } from 'zx';
import WU from 'web-utility';

import { downloadHTML, retry } from './Tool.js';

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

export async function main(
  url: string,
  folder: string,
  concurrencyLimit?: number,
  maxRetries?: number
) {
  await $`rm -rf ${folder}`;
  await $`mkdir -p ${folder}`;
  cd(folder);
  await retry(() => downloadHTML(url), maxRetries);

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
      await Promise.all(
        list.map((url) => retry(() => downloadHTML(url, true), maxRetries))
      );

    const subPageFiles = await fs.readdir('ChemicalLanding');

    cd('ChemicalLanding');

    for (const file of WU.splitArray(subPageFiles, concurrencyLimit))
      await Promise.all(
        file.map((filePath) => modifySubPageURLs(filePath, 'li > .under'))
      );
  }
}
