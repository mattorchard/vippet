<script lang="ts">
  import type {Rect} from "../helpers/utilityTypes";

  export let onCropChange: (crop: Rect) => void;

  let clientWidth;
  let clientHeight;

  let startingPoint = {x: 0, y: 0};
  let crop = {
    top: 0,
    left: 0,
    width: 1,
    height: 1
  };

  $: onCropChange(crop);

  const onResetCrop = () => crop = {
    left: 0,
    top: 0,
    width: 1,
    height: 1,
  };
  const onCropPointerDown = ({offsetX, offsetY}) => {
    const x = offsetX / clientWidth;
    const y = offsetY / clientHeight
    startingPoint = {x, y};
    crop = {
      left: x,
      top: y,
      width: 0,
      height: 0
    };
  };
  const onCropPointerMove = ({pressure, offsetX, offsetY}) => {
    if (!pressure) return;
    const x = offsetX / clientWidth;
    const y = offsetY / clientHeight
    const left = Math.min(x, startingPoint.x);
    const top = Math.min(y, startingPoint.y);
    crop = {
      left,
      top,
      width: Math.max(x, startingPoint.x) - left,
      height: Math.max(y, startingPoint.y) - top,
    }
  };

  $: containerStyles = [
    `--crop-left: ${100 * crop.left}%`,
    `--crop-top: ${100 * crop.top}%`,
    `--crop-width: ${100 * crop.width}%`,
    `--crop-height: ${100 * crop.height}%`,
  ].join(";");

</script>


<div class="cropper"
     style={containerStyles}
     bind:clientWidth={clientWidth}
     bind:clientHeight={clientHeight}
     on:dblclick={onResetCrop}
     on:pointerdown|preventDefault={onCropPointerDown}
     on:pointermove={onCropPointerMove}>

    <slot/>

    <div class="crop-bounds">
    </div>
</div>

<style>
  .cropper {
    position: relative;
    overflow: hidden;
    height: 100%;
  }
  .cropper > * {
    pointer-events: none;
    user-select: none;
  }
  .crop-bounds {
    position: absolute;
    top: var(--crop-top);
    left: var(--crop-left);
    width: var(--crop-width);
    height: var(--crop-height);
    outline: .25rem solid var(--color-accent);
  }
</style>