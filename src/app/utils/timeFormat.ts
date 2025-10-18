/**
 * Helper to format numbers with locale options
 */
function formatNumberWithOptions(
  value: number,
  locale: string,
  options: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat(locale, options).format(value);
}

/**
 * Formats a video duration in seconds into a string representation of the duration in hours, minutes, and seconds.
 *
 * @param {number} durationInSeconds - The duration of the video in seconds.
 * @param {boolean} forceHoursPadding - Whether to always show hours even if 0. Defaults to false.
 * @returns {string} The formatted duration string in the format "HH:MM:SS". If the duration is less than one hour, the format will be "MM:SS" (if minutes is a single digit value it won't be padded with a leading zero).
 */
export function formatVideoTimeStamp(
  durationInSeconds: number,
  forceHoursPadding = false
): string {
  const seconds: number = Math.floor(durationInSeconds) % 60;
  const minutes: number = Math.floor(durationInSeconds / 60) % 60;
  const hours: number = Math.floor(durationInSeconds / 3_600);

  const options: Intl.NumberFormatOptions = {
    minimumIntegerDigits: 2,
  };

  const formattedMinutes: string = formatNumberWithOptions(
    minutes,
    "en-US",
    options
  );

  const formattedSeconds: string = formatNumberWithOptions(
    seconds,
    "en-US",
    options
  );

  if (hours === 0 && !forceHoursPadding) {
    return `${minutes}:${formattedSeconds}`;
  }

  return `${hours}:${formattedMinutes}:${formattedSeconds}`;
}

/**
 * Calculate duration in seconds between two date strings
 * @param startTime - ISO date string or locale date string
 * @param endTime - ISO date string or locale date string
 * @returns Duration in seconds, or null if invalid dates
 */
export function calculateDurationInSeconds(
  startTime: string,
  endTime: string
): number | null {
  try {
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return null;
    }

    return Math.abs(end.getTime() - start.getTime()) / 1_000;
  } catch {
    return null;
  }
}
