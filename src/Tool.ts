import { $, sleep } from 'zx';

export const downloadHTML = (url: string, fixName = false) =>
  $`wget -c -r -npH -k -p ${fixName ? '-E' : ''} ${url}`;

export async function retry<F extends (...data: any[]) => any>(
  executor: F,
  maxRetries,
  interval = 0.5
) {
  let lastError: Error | undefined;

  do {
    try {
      const data = executor();

      return data instanceof Promise ? await data : data;
    } catch (error) {
      lastError = error;
    }
    await sleep(interval);
  } while (--maxRetries);

  if (lastError) throw lastError;
}
