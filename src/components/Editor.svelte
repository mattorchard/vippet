<script lang="ts">
  import {onDestroy} from "svelte";
  import type {VideoDetails} from "../helpers/mediaHelpers";
  import Timeline from "./Timeline.svelte";
  import Cropper from "./Cropper.svelte";
  import ExportForm from "./ExportForm.svelte";

  export let videoUrl: string;
  export let videoDetails: VideoDetails;
  export let onDiscard: () => void;

  let video: HTMLVideoElement;


  let trim = {start: 0, end: videoDetails.duration};
  const setTrim = ({start, end}) => {
    const newTrim = {
      start: start * videoDetails.duration,
      end: end * videoDetails.duration,
    };
    if (video && newTrim.start !== trim.start) {
      video.currentTime = newTrim.start;
    } else if (video && newTrim.end !== trim.end) {
      video.currentTime = Math.max(newTrim.start, newTrim.end - .25);
    }
    trim = newTrim;
  };


  let crop = {left: 0, top: 0, width: videoDetails.width, height: videoDetails.height};
  const setCrop = (newCrop) => crop = {
    left: newCrop.left * videoDetails.width,
    top: newCrop.top * videoDetails.height,
    width: newCrop.width * videoDetails.width,
    height: newCrop.height * videoDetails.height
  };

  let currentTime = 0;
  const interval = setInterval(() => {
    currentTime = video.currentTime;
    if (currentTime - trim.start < -0.001 || currentTime > trim.end) {
      video.currentTime = trim.start;
    }
  }, 1000 / 60)
  onDestroy(() => clearInterval(interval));

</script>

<div class="container" style="--current-time: {currentTime / videoDetails.duration};">
    <div class="preview-area">
        <Cropper onCropChange={setCrop}>
            <video src={videoUrl}
                   bind:this={video}
                   autoplay
                   muted
                   loop></video>
        </Cropper>
    </div>

    <header>
        <button class="discard-button" on:click={onDiscard}>Discard Recording</button>
        <ExportForm srcVideoUrl={videoUrl} trim={trim} crop={crop}/>
    </header>

    <Timeline onTrimChange={setTrim}/>
</div>

<style>
  .container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
  }

  header {
    background-color: var(--color-bg-dark);
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    height: 5rem;
  }

  .preview-area {
    display: flex;
    flex-shrink: 2;
    flex-grow: 2;
    overflow: hidden;
    justify-content: center;
    padding: 1rem;
  }

  video {
    height: 100%;
    width: auto;
  }

</style>