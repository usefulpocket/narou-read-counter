<script lang="ts">
  import { type DailyStat } from '../types';
  type Props = {
    dailyStats: DailyStat[];
  };

  const { dailyStats }: Props = $props();
</script>

<div class="row">
  <div class="column"><strong>日付</strong></div>
  <div class="column column-20"><strong>文字数</strong></div>
  <div class="column column-20"><strong>作品数</strong></div>
  <div class="column column-20"><strong>エピソード数</strong></div>
</div>
{#each dailyStats as data}
  <div class="row">
    <div class="column">{data.date}</div>
    <div class="column column-20">{data.totalCount}</div>
    <div class="column column-20">{data.novelCount}</div>
    <div class="column column-20">{data.episodeCount}</div>
  </div>
{/each}
