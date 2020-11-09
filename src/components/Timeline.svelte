<script lang="ts">
  import {onArrows} from "../helpers/domHelpers";

  export let onTrimChange: ({start, end}: { start: number, end: number }) => void;
  const ARROW_INCREMENT = 0.01;

  let start = 0;
  let end = 1;

  $: onTrimChange({start, end})

  let draggingSide: "start" | "end" | null = null;
  let timelineWidth: number;

  const handleTimelinePointerMove = ({offsetX}) => {
    const xFraction = offsetX / timelineWidth;
    if (draggingSide === "start") {
      start = xFraction;
      end = Math.max(start, end);
    } else if (draggingSide === "end") {
      end = xFraction;
      start = Math.min(start, end);
    }
  }


  $: timelineStyles = [
    `--time-start: ${100 * start}%`,
    `--time-end: ${100 * end}%`,
  ].join(";")
</script>

<div class="timeline"
     style={timelineStyles}
     bind:clientWidth={timelineWidth}
     on:pointermove={handleTimelinePointerMove}
     on:pointerup={() => draggingSide = null}>
    <button title="Adjust start time"
            class="drag-handle start"
            on:pointerdown={() => draggingSide = "start"}
            on:keydown={onArrows(direction => {
              if (direction === "left") {
                start -= ARROW_INCREMENT;
              } else if (direction === "right") {
                start += ARROW_INCREMENT;
              }
            })}
    ></button>
    <button title="Adjust end time"
            class="drag-handle end"
            on:pointerdown={() => draggingSide = "end"}
            on:keydown={onArrows(direction => {
              if (direction === "left") {
                end -= ARROW_INCREMENT;
              } else if (direction === "right") {
                end += ARROW_INCREMENT;
              }
            })}></button>
    <div class="playhead"></div>
</div>

<style>
  .timeline {
    flex-shrink: 0;
    min-height: 100px;
    position: relative;
    background-image: repeating-linear-gradient(to right,
    var(--color-lighten) 0,
    var(--color-lighten) .25rem,
    transparent .25rem,
    transparent 10rem);
  }

  .drag-handle {
    cursor: ew-resize;
    border: none;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    width: .5rem;
    padding: 0;
    border-radius: 0;
    background-color: var(--color-accent);
    transform: translateX(-50%);
  }

  .timeline:active * {
    pointer-events: none;
  }

  .drag-handle::before {
    position: absolute;
    top: 50%;
    background-color: var(--color-accent);
    transform: translateY(-50%);
    padding: 0 .25rem .25rem;
    line-height: .75rem;
    font-variant: all-small-caps;
  }

  .drag-handle.start {
    left: var(--time-start);
  }

  .drag-handle.start::before {
    content: "Start";
    left: .125rem;
  }

  .drag-handle.end {
    left: var(--time-end);
  }

  .drag-handle.end::before {
    content: "End";
    right: .125rem;
  }

  .playhead {
    position: absolute;
    top: 0;
    bottom: 0;
    left: calc(100% * var(--current-time));
    transform: translateX(-50%);
    z-index: -1;
    border-left: .25rem dashed var(--color-primary);
  }
</style>