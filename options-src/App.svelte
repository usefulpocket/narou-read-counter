<script lang="ts">
  import browser from 'webextension-polyfill';
  import { getDailyCounts } from './lib/db';
  import { groupedDailyCounts } from './lib/utils';
  import DailyStats from './components/DailyStats.svelte';

  let dailyCounts = $state([]);
  let dailyStats = $derived(groupedDailyCounts(dailyCounts));
  let currentDate = new Date();

  async function loadPage(date: Date) {
    dailyCounts = await getDailyCounts(date);
  }

  document.addEventListener('DOMContentLoaded', function() {
    // 初期ページの読み込み
    loadPage(currentDate);
  });

  browser.runtime.onMessage.addListener((message) => {
    if (message.action === 'dataChanged') {
      loadPage(currentDate);
    }
    return true;
  });
</script>

<div class="container">
  <h1>読書データ</h1>
</div>
<div class="container">
  {#if dailyStats.length === 0}
    <p>データがありません</p>
  {:else}
    <DailyStats {dailyStats} />
  {/if}
</div>

<style>

</style>
