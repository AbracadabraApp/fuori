// Saving a turn after the reply goes out (lib/recording.ts → saveLater,
// 2026-10-22). No database: checks the queue that readers wait on, so the next
// turn, the reply buttons and ending a conversation never read it before the
// last exchange is saved.
import { saveLater, savesDone } from '@/lib/recording';

const problems: string[] = [];
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const order: string[] = [];

  // A reader waits for a save that's still running
  void saveLater('a', async () => { await wait(50); order.push('save 1'); });
  await savesDone('a');
  order.push('read');
  if (order.join(',') !== 'save 1,read') problems.push(`reader didn't wait for the save: ${order.join(',')}`);

  // Saves for one conversation run in order, even when the first is slower
  order.length = 0;
  void saveLater('b', async () => { await wait(60); order.push('first'); });
  void saveLater('b', async () => { order.push('second'); });
  await savesDone('b');
  if (order.join(',') !== 'first,second') problems.push(`saves out of order: ${order.join(',')}`);

  // A failed save doesn't block the next one or the reader (it reports its own error)
  order.length = 0;
  void saveLater('c', async () => { throw new Error('database down'); });
  void saveLater('c', async () => { order.push('after failure'); });
  await savesDone('c');
  if (order.join(',') !== 'after failure') problems.push(`a failed save blocked the next: ${order.join(',')}`);

  // Another conversation's save doesn't hold up this one
  let slowDone = false;
  void saveLater('d', async () => { await wait(200); slowDone = true; });
  await savesDone('e');
  if (slowDone) problems.push("a reader waited for another conversation's save");
  await savesDone('d');

  // Nothing pending: resolves at once
  const t0 = Date.now();
  await savesDone('never-saved');
  if (Date.now() - t0 > 20) problems.push('savesDone waited with nothing pending');
}

main()
  .catch((e) => problems.push(String(e)))
  .finally(() => {
    if (problems.length) {
      console.error(problems.join('\n'));
      process.exit(1);
    }
    console.log('OK: turns saved after the reply; readers wait for the save, in order, per conversation');
  });
