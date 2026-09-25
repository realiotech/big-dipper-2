export type NavItem = {
  label: string;
  href: string;
  /** Pages from the redesign that are not built yet render as "Soon". */
  ready: boolean;
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

// Navigation from the Realio Explorer redesign sitemap, shared by the header,
// the mobile drawer and the footer.
export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Blockchain",
    items: [
      { label: "Overview", href: "/", ready: true },
      { label: "Blocks", href: "/blocks", ready: true },
      { label: "Transactions", href: "/transactions", ready: true },
      { label: "Accounts", href: "/accounts", ready: false },
      { label: "Verified contracts", href: "/contracts", ready: false },
    ],
  },
  {
    label: "Staking",
    items: [
      { label: "Validators", href: "/validators", ready: true },
      { label: "Top accounts", href: "/top-accounts", ready: false },
    ],
  },
  {
    label: "Assets",
    items: [
      { label: "All assets", href: "/assets", ready: false },
      { label: "Governance", href: "/proposals", ready: true },
    ],
  },
  {
    label: "Network",
    items: [
      { label: "Charts & stats", href: "/chart", ready: true },
      { label: "Parameters", href: "/params", ready: true },
    ],
  },
];

// Merged from feat/monitor once it lands on chains/realio.
export const MONITOR_ITEM: NavItem = { label: "Wallet Monitor", href: "/monitor", ready: false };

export const EXTERNAL_LINKS = [
  { label: "realio.network", href: "https://realio.network" },
  { label: "Docs", href: "https://docs.realio.network/" },
  { label: "GitHub", href: "https://github.com/realiotech" },
];

/** Whether a nav item matches the current route, so the header can highlight its group. */
export const isActive = (href: string, pathname: string) =>
  href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
