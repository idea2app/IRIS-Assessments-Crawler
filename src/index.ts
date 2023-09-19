#! /usr/bin/env node

import { $ } from 'zx';

const url = 'https://iris.epa.gov/AtoZ/?list_type=alpha';
const dirPath = './dist';

async function downloadData() {
  await $`wget -c -r -npH -k -P ${dirPath} index.html ${url}`;
}

downloadData();
