<script lang="ts">
  import { type DailyStat } from '../types';
  type Props = {
    dailyStats: DailyStat[];
  };

  const { dailyStats }: Props = $props();
</script>

<table class="table">
  <thead>
    <tr>
      <th class="w-1/4 text-left">日付</th>
      <th class="w-1/4 pr-24 text-right">文字数</th>
      <th class="w-1/4 text-right">作品数</th>
      <th class="w-1/4 text-right">エピソード数</th>
    </tr>
  </thead>
  {#each dailyStats as data}
    <tbody>
      <tr>
        <td>{data.date}</td>
        <td class="pr-24 text-right font-bold">
          {data.totalCount.toLocaleString()}
        </td>
        <td class="text-right font-bold">
          {data.novelCount.toLocaleString()}
        </td>
        <td class="text-right font-bold">
          {data.episodeCount.toLocaleString()}
        </td>
      </tr>
    </tbody>
  {/each}
</table>
