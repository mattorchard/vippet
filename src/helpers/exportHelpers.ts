import * as workerTimers from "worker-timers"
import GIF from "gif.js"
import {waitForEvent} from "./domHelpers";
import {createCanvas} from "./canvasHelpers";
import {downloadBlob} from "./downloadHelpers";
import {getRecorderMimeType} from "./mediaHelpers";
import type {Rect, Range, Quality} from "./utilityTypes";

const MEGABYTE = 1000 * 1000;

const bitRateForQuality = {
  high: 5 * MEGABYTE,
  medium: 2.5 * MEGABYTE,
  low: MEGABYTE
};

const gifQualityForQuality = {
  high: 5,
  medium: 10,
  low: 15,
}

type ExportSettings = {
  srcVideoUrl: string;
  crop: Rect;
  trim: Range,
  frameRate: number;
  quality: Quality
  scale: number,
}

type ProgressCallback = (progress: number) => void


const setupVideo = async (srcVideoUrl: string, start: number): Promise<HTMLVideoElement> => new Promise(async (resolve, reject) => {
  const video = document.createElement("video");

  video.onerror = () => reject(new Error(`Failed to load video`));
  video.src = srcVideoUrl;

  video.currentTime = start;
  if (start) await waitForEvent(video, "seeked", 1000);

  return resolve(video);
})

export const exportGif = async ({srcVideoUrl, crop, trim, frameRate, quality}: ExportSettings, progressCallback?: ProgressCallback): Promise<Blob> => new Promise(async (resolve) => {
  const video = await setupVideo(srcVideoUrl, trim.start);
  const {context} = createCanvas(crop);

  const gif = new GIF({
    workers: 1,
    quality: gifQualityForQuality[quality],
    width: crop.width,
    height: crop.height
  });

  gif.on("finished", (blob, ) => {
    downloadBlob(blob, "vippet-recording.gif");
    resolve(blob);
  });

  if (progressCallback) {
    gif.on("progress", renderProcess =>
      progressCallback(renderProcess / 2 + 0.5)
    )
  }

  const interval = workerTimers.setInterval(() => {
    if (video.currentTime <= trim.end) {
      context.drawImage(video, -crop.left, -crop.top);
      gif.addFrame(context, {copy: true, delay: 1000 / frameRate})

      const captureProgress = (video.currentTime - trim.start) / (trim.end - trim.start);
      progressCallback?.(captureProgress / 2);
    }
    if (video.currentTime >= trim.end) {
      workerTimers.clearInterval(interval);
      gif.render()
    }
  }, 1000 / frameRate);

  video.onpause = () => video.play();
  await video.play();
});

export const exportVideo = ({srcVideoUrl, crop, trim, frameRate, quality}: ExportSettings, progressCallback: ProgressCallback): Promise<Blob> =>
  new Promise(async (resolve, reject) => {
    const video = await setupVideo(srcVideoUrl, trim.start);
    const {canvas, context} = createCanvas(crop);
    // @ts-ignore
    const stream = canvas.captureStream() as MediaStream;

    // @ts-ignore
    const recorder = new MediaRecorder(stream, {
      mimeType: getRecorderMimeType(),
      videoBitsPerSecond: bitRateForQuality[quality],
    });

    recorder.ondataavailable = ({data}: { data: BlobPart }) => {
      const blob = new Blob([data], {type: "video/webm"});
      downloadBlob(blob, "vippet-recording.webm");
      resolve(blob);
    };

    const interval = workerTimers.setInterval(() => {
      console.log("Wow its now", new Date())
      if (video.currentTime <= trim.end) {
        context.drawImage(video, -crop.left, -crop.top);
        const progress = (video.currentTime - trim.start)/(trim.end - trim.start);
        progressCallback?.(progress);
      }
      if (video.currentTime >= trim.end) {
        workerTimers.clearInterval(interval);
        recorder.stop();
      }
    }, 1000 / frameRate);

    recorder.onerror = () => {
      workerTimers.clearInterval(interval);
      reject(new Error(`Failed to record video`));
    };
    video.addEventListener("play", () => recorder.start(), {once: true});
    video.onpause = () => video.play();
    await video.play();
  });
