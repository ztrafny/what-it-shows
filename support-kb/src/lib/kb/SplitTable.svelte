<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import { type Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';
  import { PROBLEMS, splitTicket } from '#lib/kb/split';

  type Ticket = { href: string; state: string };
  // tickets: problem → its own ticket and where it stands.
  let { ticket, tickets = {} }: { ticket: number; tickets?: Record<string, Ticket> } = $props();

  const groups = $derived(splitTicket(reports as Report[], ticket, tenantOf, notes.oneDayMove));
  const total = $derived(new Set(groups.flatMap((g) => g.reports.map((r) => r.id))).size);
</script>

<p class="sum"><strong>{total}</strong> reports in #{ticket} · <strong>{groups.length}</strong> problems</p>

<table>
  <thead><tr><th>problem</th><th>reports</th><th>tenants</th><th>seen</th><th>ticket</th></tr></thead>
  <tbody>
    {#each groups as g (g.problem)}
      {@const t = tickets[g.problem]}
      <tr>
        <td><code>{g.problem}</code> {PROBLEMS[g.problem]}</td>
        <td>{g.reports.length}{#if g.alsoIn.length}<span class="note"> (also in {g.alsoIn.join(', ')})</span>{/if}</td>
        <td>{g.tenants}</td>
        <td>{g.firstSeen} → {g.lastSeen}</td>
        <td>{#if t}<a href={t.href}>#{t.href.split('/').pop()}</a> {t.state}{:else}none yet{/if}</td>
      </tr>
    {/each}
  </tbody>
</table>

<style>
  .sum { font-size: 1.1rem; }
  .note { color: var(--muted); font-size: 0.85em; }
</style>
