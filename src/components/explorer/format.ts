import Big from "big.js";
import numeral from "numeral";
import dayjs from "@/utils/dayjs";
import { formatNumber } from "@/utils/format_token";

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

/**
 * Base-unit amount rounded for tables: ("2965490000000000") -> "0.002965".
 * Non-zero amounts too small to show read "<0.000001", never "0". Works on
 * strings, so 18-decimal amounts keep every digit until rounded.
 */
export const shortUnits = (amount: string, decimals = 18, places = 6) => {
  const value = Big(amount || "0").div(Big(10).pow(decimals));
  const rounded = value.round(places, Big.roundHalfUp);
  if (rounded.eq(0) && !value.eq(0)) return `<${Big(1).div(Big(10).pow(places)).toFixed(places)}`;
  return formatNumber(rounded.toFixed(places));
};

/**
 * Dollar amount: 1234.5 -> "$1,234.50". Rounds first, because numeral returns
 * "NaN" for tiny values such as 1.3e-8 (a few ario of pending rewards), and
 * shows "<$0.01" for non-zero amounts that round to nothing.
 */
export const formatUsd = (value: number) => {
  const amount = Number.isFinite(value) ? value : 0;
  if (amount > 0 && amount < 0.005) return "<$0.01";
  return `$${numeral(Number(amount.toFixed(2))).format("0,0.00")}`;
};

/** A small number in plain decimals with 6 significant digits: 6.734e-10 -> "0.000000000673428". */
export const formatPrecise = (value: number) => {
  if (!Number.isFinite(value) || value === 0) return "0";
  return Big(value.toPrecision(6)).toFixed().replace(/(\.\d*?)0+$/, "$1").replace(/\.$/, "");
};

/** "2026-07-27 14:30:26 UTC", or "—" for a missing time. */
export const formatUtc = (time?: string) => (time ? dayjs.utc(time).format("YYYY-MM-DD HH:mm:ss [UTC]") : "—");
