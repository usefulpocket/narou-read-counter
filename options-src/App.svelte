<script lang="ts">
  import browser from 'webextension-polyfill';
  import { getDailyCounts } from './lib/db';
  import { groupedDailyCounts, formatYearMonth, nextMonths, previousMonths } from './lib/utils';
  import DailyStats from './components/DailyStats.svelte';

  let dailyCounts = $state([]);
  let dailyStats = $derived(groupedDailyCounts(dailyCounts));
  let currentDate = $state(new Date());
  let currentYearMonth = $derived(formatYearMonth(currentDate));

  function nextPage() {
    currentDate = nextMonths(currentDate);
    loadPage(currentDate);
  }

  function previousPage() {
    currentDate = previousMonths(currentDate);
    loadPage(currentDate);
  }

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

  <div class="page-controls">
    <span class="float-left">{currentYearMonth}</span>
    <button class="button button-clear" onclick={previousPage}>＜</button>
    <button class="button button-clear" onclick={nextPage}>＞</button>
  </div>
  {#if dailyStats.length === 0}
    <p>データがありません</p>
  {:else}
    <DailyStats {dailyStats} />
  {/if}
</div>

<style>

</style>
