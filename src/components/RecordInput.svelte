<script lang="ts">
  import {recordScreen} from "../helpers/mediaHelpers";

  export let onComplete: (video: Blob) => void;
  export let onIsIdleChange: (isIdle: boolean) => void;

  type Stage = "idle" | "starting" | "recording" | "processing" | "complete";
  let stage: Stage = "idle";

  $: onIsIdleChange(stage === "idle")

  let stream: MediaStream | undefined;
  let stopStream: (() => void) | undefined;

  let videoPreview: HTMLVideoElement | undefined;

  $: if (videoPreview && videoPreview.srcObject !== stream) {
    videoPreview.srcObject = stream;
  }

  const startRecording = async () => {
    try {
      stage = "starting";
      const streamDetails = await recordScreen()
      stage = "recording";

      stream = streamDetails.stream;
      stopStream = streamDetails.stop;
      streamDetails.videoPromise.then(video => {
        stage = "complete";
        onComplete(video)
      });
    } catch (error) {
      console.warn("Failed to start recording", error);
      stage = "idle";
    }
  };
  const stopRecording = async () => {
    stage = "processing"
    stopStream();
  };
</script>
<div>

    {#if stage === "idle"}
        <button class="start-button"
                on:click={startRecording}>
            Start Recording
        </button>
    {:else if stage === "starting"}
        <p>Starting screen recording...</p>
    {:else if stage === "recording"}
        <div class="video-container">
            <div class="video-banner">Recording</div>
            <button class="stop-button" on:click={stopRecording}>Stop Recording</button>
            <video bind:this={videoPreview} autoplay muted></video>
        </div>
    {:else if stage === "processing"}
        <p>Processing video</p>
    {:else if stage === "complete"}
        <p>Recording complete</p>
    {/if}

</div>
<style>
  video {
    max-width: 50vw;
    width: 100%;
    height: auto;
    transition: filter var(--tns);
    z-index: -1;
  }

  .start-button {
    transform: scale(2);
  }

  .stop-button:hover + video {
    filter: blur(2px);
  }

  .video-container {
    position: relative;
    display: inline-block;
  }

  .video-banner {
    position: absolute;
    top: 2rem;
    left: -1rem;
    background-color: var(--color-accent);
    padding: .25rem 0.5rem;
    font-weight: 500;
    z-index: 1;
  }

  .video-banner::after {
    content: "";
    position: absolute;
    top: 100%;
    left: 0;
    border: 0.5rem solid var(--color-accent-dark);
    border-bottom-color: transparent;
    border-left-color: transparent;
  }

  .stop-button {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(1.5);
    z-index: 1;
  }

</style>