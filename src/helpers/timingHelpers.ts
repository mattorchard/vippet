export const SECOND = 1000;
export const MINUTE = 60 * SECOND;
export const HOUR = 60 * MINUTE;
export const DAY = 24 * HOUR;

export const waitForDelay = async (delay: number) =>
  new Promise(resolve => setTimeout(resolve, delay));
