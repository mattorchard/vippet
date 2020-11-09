import { DAY } from "./timingHelpers";

export const recordScreen = async () => {
  // @ts-ignore
  const stream: MediaStream = await navigator.mediaDevices.getDisplayMedia({
    video: {
      cursor: "always",
      width: 1920,
      height: 1080
    },
    audio: false
  });

  const videoPromise = recordStream(stream).then(
    videoData => new Blob([videoData], { type: "video/webm" })
  );

  const stop = async () => stream.getTracks().forEach(track => track.stop());

  return { stream, stop, videoPromise };
};

const isStreamOver = (stream: MediaStream) =>
  [...stream.getTracks()].every(track => track.readyState === "ended");

const recordStream = async (stream: MediaStream): Promise<BlobPart> =>
  new Promise((resolve, reject) => {
    // @ts-ignore
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: recorderMimeType
    });

    const handleTrackEnded = () => {
      if (isStreamOver(stream)) mediaRecorder.stop();
    };

    stream
      .getTracks()
      .forEach(track => track.addEventListener("ended", handleTrackEnded));

    mediaRecorder.ondataavailable = ({ data }: { data: BlobPart }) =>
      resolve(data);

    mediaRecorder.onerror = () => reject(new Error(`Error recording stream`));

    mediaRecorder.start();
  });

export type VideoDetails = {
  width: number;
  height: number;
  duration: number; // In seconds
};

export const getVideoDetails = async (
  videoUrl: string
): Promise<VideoDetails> =>
  new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.onerror = () => reject(new Error(`Unable to load video`));
    video.onseeked = () => {
      const details = {
        width: video.videoWidth,
        height: video.videoHeight,
        duration: video.duration
      };
      if (details.width && details.height && details.duration) {
        resolve(details);
      } else {
        reject(new Error(`Failed to load video details`));
      }
    };
    video.setAttribute("src", videoUrl);
    video.currentTime = DAY;
  });

export const recorderMimeType = "video/webm; codecs=vp9";
