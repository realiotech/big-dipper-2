import numeral from "numeral";
import dayjs from "@/utils/dayjs";

/** 135461234 -> "135.46M" */
export const formatCompact = (value: number) =>
  numeral(value || 0).format("0.[00]a").toUpperCase();

/** Relative time in the design's short form: "39 secs ago", "3 hrs ago". */
export const timeAgo = (timestamp: string) => {
  const seconds = Math.max(dayjs().diff(dayjs.utc(timestamp), "second"), 0);
  const unit = (count: number, name: string) =>
    `${count} ${name}${count === 1 ? "" : "s"} ago`;
  if (seconds < 60) return unit(seconds, "sec");
  if (seconds < 3600) return unit(Math.floor(seconds / 60), "min");
  if (seconds < 86400) return unit(Math.floor(seconds / 3600), "hr");
  return unit(Math.floor(seconds / 86400), "day");
};

/**
 * 5.56 -> "5.56%". Rounds first: numeral returns "NaN" for tiny values such
 * as 1e-7, which happen for validators with almost no voting power.
 */
export const formatPercent = (percent: number, decimals = 2) =>
  numeral(Number((percent || 0).toFixed(decimals)) / 100).format(`0.[${"0".repeat(decimals)}]%`);
