<script lang="ts">
  import RecordInput from "./components/RecordInput.svelte";
  import {getVideoDetails} from "./helpers/mediaHelpers";
  import Editor from "./components/Editor.svelte";
  import WelcomeArea from "./components/WelcomeArea.svelte";
  import {fade} from 'svelte/transition';

  let videoUrl: string | undefined;
  let isShowingTutorial = false;
  let detailsPromise;

  const handleNewVideo = video => {
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
    }
    videoUrl = URL.createObjectURL(video);
    detailsPromise = getVideoDetails(videoUrl)
  };

  const discardVideo = () => {
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
      videoUrl = null;
    }
  }

</script>


{#if videoUrl}

    {#await detailsPromise}
        <p>Loading video details</p>
    {:then details}
        <Editor videoUrl={videoUrl}
                videoDetails={details}
                onDiscard={discardVideo}/>
    {:catch error}
        <p>Something went wrong {error.message}</p>
    {/await}

{:else}
    <div class="page-column">
        <header>
            <h1>Vippet</h1>
            <h2>Video snippets, made easy.</h2>
        </header>
        <form>
            <RecordInput onComplete={handleNewVideo} onIsIdleChange={isIdle => isShowingTutorial = isIdle}/>
        </form>
        {#if isShowingTutorial}
            <WelcomeArea/>
        {/if}

        <footer in:fade={{duration: 2000, delay: 1500}}>
            <a href="https://github.com/mattorchard/vippet">
                Built with Svelte and TypeScript, by Matthew Orchard.
            </a>
        </footer>
    </div>
{/if}

<style>
  .page-column {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }
  h1 {
    color: var(--color-accent);
    font-size: 4rem;
  }

  h2 {
    font-weight: normal;
  }

  header {
    max-width: 1100px;
    margin: 0 auto;
  }

  form {
    padding: 3rem;
    text-align: center;
  }

  footer {
    margin-top: auto;
    padding: 1rem;
    text-align: end;
  }
  footer > a {
    color: var(--color-text-light);
    text-decoration: underline;
  }
</style>