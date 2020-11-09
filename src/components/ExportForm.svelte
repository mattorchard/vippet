<script lang="ts">
  import {fade} from 'svelte/transition';
  import {onDestroy} from "svelte";

  import {exportVideo} from "../helpers/exportHelpers";
  import type {Rect, Range} from "../helpers/utilityTypes";
  import {SECOND} from "../helpers/timingHelpers";

  export let videoUrl: string;
  export let trim: Range;
  export let crop: Rect;

  let frameRate = 15;
  let bitRate = 2.5;
  let exportPromise = null;

  let exportInterval;
  let exportTimingDetails = null;
  let isExporting = false;


  const handleSubmit = async () => {
    exportPromise = exportVideo({
      videoUrl, crop, trim, bitRate, frameRate
    });
    exportTimingDetails = {
      start: Date.now(),
      expectedDuration: (trim.end - trim.start) * SECOND,
      elapsed: 0,
    }

    exportInterval = setInterval(() => exportTimingDetails = {
      ...exportTimingDetails,
      elapsed: Date.now() - exportTimingDetails.start,
    }, 0.1 * SECOND)

    try {
      isExporting = true;
      await exportPromise;
    } finally {
      isExporting = false;
      if (exportInterval)
        clearInterval(exportInterval)
    }
  };
  onDestroy(() => {
    if (exportInterval)
      clearInterval(exportInterval)
  })

  $: exportProgress = exportTimingDetails
    ? `${Math.round(exportTimingDetails.elapsed / SECOND)}/${Math.round(exportTimingDetails.expectedDuration / SECOND)}s`
    : ""

</script>

<div class="export-row">

    {#if exportPromise}
        <div transition:fade>
            {#await exportPromise}
                <label>
                    Exporting: {exportProgress}
                    <progress value={exportTimingDetails.elapsed}
                              max={exportTimingDetails.expectedDuration}>{exportProgress}</progress>

                </label>
            {:catch error}
                Error while exporting {error.message}
            {/await}
        </div>
    {/if}

    <form on:submit|preventDefault={handleSubmit}>
        <fieldset>
            <legend><abbr title="Frames per Second">FPS</abbr></legend>
            <div class="checkbox-button-group">
                <input type=radio aria-label="15" value={15} bind:group={frameRate}>
                <input type=radio aria-label="30" value={30} bind:group={frameRate}>
            </div>
        </fieldset>
        <label>
            Quality
            <select bind:value={bitRate}>
                <option value={5}>High (5 Mbit/s)</option>
                <option value={2.5}>Medium (2.5 Mbit/s)</option>
                <option value={1}>Low (1 Mbit/s)</option>
            </select>
        </label>

        <button type="submit" class="export-button" disabled={isExporting}>
            Export
        </button>
    </form>


</div>

<style>
  .export-row, form {
    display: flex;
    gap: .5rem;
  }

  progress {
    display: block;
  }

  select {
    display: block;
  }

  .export-button {
    z-index: 2;
    align-self: flex-end;
  }

  abbr {
    text-decoration: none;
  }
</style>