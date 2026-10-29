<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import { splitTicket, type Problem } from '#lib/kb/problems';
  import { tenantOf } from '#lib/kb/locales';
  import type { Report } from '#lib/kb/causes';

  // tickets: where each problem is tracked now, e.g. { parser: 'https://…/issues/1' }.
  let { ticket, tickets = {} }: { ticket: number; tickets?: Partial<Record<Problem, string>> } = $props();

  const split = $derived(splitTicket(reports as Report[], ticket, tenantOf));
  const tags = (t: Record<string, number>) =>
    Object.entries(t)
      .sort((a, b) => b[1] - a[1])
      .map(([tag, n]) => `${tag} ×${n}`)
      .join(' · ');
  const ticketLabel = (href: string) => '#' + href.split('/').pop();
</script>

<p class="sum">
  <strong>{split.merged.length}</strong> reports merged into #{ticket}
  ({split.exportRows - split.merged.length} repeated rows in the export dropped) ·
  <strong>{split.groups.length}</strong>
  {split.groups.length === 1 ? 'problem' : 'problems'}
</p>

<table>
  <thead>
    <tr><th>problem</th><th>reports</th><th>tagged as</th><th>tenants</th><th>seen</th><th>ticket</th></tr>
  </thead>
  <tbody>
    {#each split.groups as g (g.problem)}
      <tr>
        <td><code>{g.problem}</code></td>
        <td>{g.reports.length}</td>
        <td class="tags">{tags(g.taggedAs)}</td>
        <td>{g.tenants.length}</td>
        <td>{g.firstSeen} → {g.lastSeen}</td>
        <td>
          {#if tickets[g.problem]}<a href={tickets[g.problem]}>{ticketLabel(tickets[g.problem]!)}</a>{:else}<span class="none">none yet</span>{/if}
        </td>
      </tr>
    {/each}
  </tbody>
  <tfoot>
    <tr><td>total</td><td>{split.groups.reduce((n, g) => n + g.reports.length, 0)}</td><td colspan="4"></td></tr>
  </tfoot>
</table>

<p class="note">{split.mistagged} reports carry an intake tag that differs from the problem they are filed under.</p>

<style>
  .sum { font-size: 1.1rem; }
  .tags { color: var(--muted); font-size: 0.85em; }
  .note { color: var(--muted); font-size: 0.85em; }
  .none { color: var(--warn); font-weight: 600; }
  tfoot td { font-weight: 600; }
</style>
