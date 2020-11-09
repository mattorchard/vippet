import { waitForEvent } from "./domHelpers";
import { createCanvas } from "./canvasHelpers";
import { downloadBlob } from "./downloadHelpers";
import { recorderMimeType } from "./mediaHelpers";
import type {Rect, Range} from "./utilityTypes";


const MEGA = 1000 * 1000;

export const exportVideo = ({
  videoUrl,
  crop,
  trim,
  frameRate = 15,
  bitRate=2.5
}: {
  videoUrl: string;
  crop: Rect;
  trim: Range,
  frameRate?: number;
  bitRate?: number;
}): Promise<Blob> =>
  new Promise(async (resolve, reject) => {
    const video = document.createElement("video");

    video.onerror = () => reject(new Error(`Failed to load video`));
    video.src = videoUrl;

    video.currentTime = trim.start;
    if (trim.start) await waitForEvent(video, "seeked", 1000);

    const { canvas, context } = createCanvas(crop);
    // @ts-ignore
    const stream = canvas.captureStream();
    // @ts-ignore
    const recorder = new MediaRecorder(stream, {
      mimeType: recorderMimeType,
      videoBitsPerSecond : MEGA * bitRate,
    });

    recorder.ondataavailable = ({ data }: { data: BlobPart }) => {
      const blob = new Blob([data], { type: "video/webm" });
      downloadBlob(blob, "vippet-recording.webm");
      resolve(blob);
    };

    const interval = setInterval(() => {
      if (video.currentTime >= trim.end) {
        clearInterval(interval);
        recorder.stop();
      }
      if (video.currentTime <= trim.end) {
        console.debug("Capturing frame", video.currentTime, trim.end);
        context.drawImage(video, -crop.left, -crop.top);
      }
    }, 1000 / frameRate);

    recorder.onerror = () => {
      clearInterval(interval);
      reject(new Error(`Failed to record video`));
    };
    video.onplay = () => recorder.start();
    await video.play();
  });
