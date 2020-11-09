export const waitForEvent = (
  eventTarget: EventTarget,
  eventName: string,
  timeout?: number
) =>
  new Promise((resolve, reject) => {
    if (timeout) {
      setTimeout(
        () =>
          reject(
            new Error(
              `Timed out after ${timeout} while waiting for event ${eventName}`
            )
          ),
        timeout
      );
    }
    eventTarget.addEventListener(eventName, resolve);
  });

export const onArrows = callback => event => {
  const key = event.key.toLowerCase();
  if (!key.startsWith("arrow")) return;
  callback(key.replace("arrow", ""));
};
