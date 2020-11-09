<script lang="ts">
  import {onMount} from "svelte";
  import {fly} from "svelte/transition";

  let mounted = false;
  onMount(() => mounted = true)
</script>


<section>
    <ol class="tutorial">
        {#if mounted}
            <li class="tutorial-step" in:fly="{{y: 100, duration: 2000, delay: 0}}">
                <video src="/videos/record.webm" class="tutorial-video" autoplay muted loop></video>
                <div class="step-header">
                    <span class="step-number">1</span>
                    <strong class="step-title">Record</strong>
                </div>
                <p>Record an app, or your whole screen</p>
            </li>
            <li class="tutorial-step" in:fly={{y: 100, duration: 2000, delay: 500}}>
                <video src="/videos/edit.webm" class="tutorial-video" autoplay muted loop></video>
                <div class="step-header">
                    <span class="step-number">2</span>
                    <strong class="step-title">Edit</strong>
                </div>
                <p>Crop the video, and trim the start and end</p>
            </li>
            <li class="tutorial-step" in:fly={{y: 100, duration: 2000, delay: 1000}}>
                <video src="/videos/export.webm" class="tutorial-video" autoplay muted loop></video>
                <div class="step-header">
                    <span class="step-number">3</span>
                    <strong class="step-title">Export</strong>
                </div>
                <p>Choose your settings, and save your snippet</p>
            </li>
        {/if}
    </ol>
</section>

<style>
  .tutorial {
    max-width: 1100px;
    margin: 0 auto 2rem;
  }

  .tutorial {
    padding: 0;
    display: flex;
    gap: 2rem;
    list-style: none;
    justify-content: space-between;
  }

  .tutorial-step {
    display: flex;
    flex-direction: column;
    margin: auto;
  }

  .tutorial-video {
    max-width: 100%;
    height: auto;
    margin-bottom: .5rem;
    border: .125rem solid var(--color-bg-dark);
  }

  .step-header {
    display: flex;
    align-items: center;
  }

  .step-number {
    font-size: 1.5rem;
    background-color: var(--color-primary);
    height: 2rem;
    width: 2rem;
    border-radius: 1000px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .step-title {
    margin-left: .5rem;
    font-size: 2rem;
  }
</style>