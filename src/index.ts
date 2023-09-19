#! /usr/bin/env node

import { $, cd } from 'zx';
import { promises } from 'fs';
import { JSDOM } from 'jsdom';

const url = 'https://iris.epa.gov/AtoZ/?list_type=alpha';

await $`rm -rf public`;
await $`mkdir -p public`;
cd('public');
await $`wget -c -r -npH -k -p ${url}`;
await $`mv AtoZ/index.html\?list_type=alpha AtoZ/index.html`;

const linkLists = await (async () => {
  const {
    window: { document },
  } = await JSDOM.fromFile('AtoZ/index.html');
  const urls = [
    ...document.querySelectorAll<HTMLAnchorElement>('tr > td:nth-child(2) > a'),
  ].map((tag) => {
    const url = tag.href;
    tag.setAttribute(
      'href',
      url.replace('https://iris.epa.gov/', '/') + '.html'
    );

    return url;
  });
  await promises.writeFile(
    'AtoZ/index.html',
    document.documentElement.outerHTML
  );
  return urls;
})();

for (const link of linkLists) {
  await $`wget -c -r -npH -k -p ${link}`;
  const path = link.replace('https://iris.epa.gov/', '');
  await $`mv ${path} ${path}.html`;
}
