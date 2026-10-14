import { useCallback, useEffect, useState } from 'react';

type PageParams = Record<string, string | number | null>;

const url = (path: string, params?: PageParams | null) => {
  const search = new URLSearchParams();
  Object.entries(params ?? {}).forEach(([key, value]) => value !== null && value !== undefined && search.set(key, String(value)));
  return `/api/blockscout/${path}${search.size ? `?${search}` : ''}`;
};

/** One Blockscout resource through the app's proxy; `path` null skips the request. */
export const useBlockscout = <T,>(path: string | null) => {
  const [state, setState] = useState<{ data: T | null; loading: boolean; notFound: boolean }>({ data: null, loading: Boolean(path), notFound: false });

  useEffect(() => {
    if (!path) return;
    let cancelled = false;
    setState({ data: null, loading: true, notFound: false });
    fetch(url(path))
      .then(async (res) => {
        const body = res.ok ? await res.json() : null;
        if (!cancelled) setState({ data: body, loading: false, notFound: res.status === 404 || res.status === 422 });
      })
      .catch(() => !cancelled && setState({ data: null, loading: false, notFound: false }));
    return () => {
      cancelled = true;
    };
  }, [path]);

  return state;
};

/**
 * A Blockscout list. Blockscout pages with a cursor (`next_page_params`), so
 * this keeps the cursors of the pages visited to allow going back.
 */
export const useBlockscoutList = <T,>(path: string | null, filters?: PageParams) => {
  const [cursors, setCursors] = useState<Array<PageParams | null>>([null]);
  const [state, setState] = useState<{ items: T[]; next: PageParams | null; loading: boolean }>({ items: [], next: null, loading: Boolean(path) });
  const filterKey = JSON.stringify(filters ?? {});

  // A new list or filter starts from the first page.
  useEffect(() => setCursors([null]), [path, filterKey]);

  const cursor = cursors[cursors.length - 1];
  useEffect(() => {
    if (!path) return;
    let cancelled = false;
    setState((prev) => ({ ...prev, loading: true }));
    fetch(url(path, { ...(filters ?? {}), ...(cursor ?? {}) }))
      .then((res) => (res.ok ? res.json() : { items: [], next_page_params: null }))
      .then((body) => !cancelled && setState({ items: body.items ?? [], next: body.next_page_params ?? null, loading: false }))
      .catch(() => !cancelled && setState({ items: [], next: null, loading: false }));
    return () => {
      cancelled = true;
    };
    // filters are compared through filterKey
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, cursor, filterKey]);

  const next = useCallback(() => state.next && setCursors((prev) => [...prev, state.next]), [state.next]);
  const previous = useCallback(() => setCursors((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev)), []);

  return { ...state, page: cursors.length, hasNext: Boolean(state.next), hasPrevious: cursors.length > 1, next, previous };
};

/** Wei (18 decimals) string to RIO. */
export const weiToRio = (wei?: string | null) => Number(wei ?? 0) / 1e18;

/** Exact decimal form of a base-unit amount: ("3002048", 18) -> "0.000000000003002048". */
export const formatUnits = (amount?: string | null, decimals = 18) => {
  const digits = (amount ?? '0').replace(/^-/, '').replace(/^0+(?=\d)/, '').padStart(decimals + 1, '0');
  const whole = digits.slice(0, digits.length - decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const fraction = digits.slice(digits.length - decimals).replace(/0+$/, '');
  return `${amount?.startsWith('-') ? '-' : ''}${whole}${fraction ? `.${fraction}` : ''}`;
};

export type BlockscoutAddress = {
  hash: string;
  name?: string | null;
  is_contract?: boolean;
  is_verified?: boolean;
  implementations?: Array<{ address_hash?: string; address?: string; name?: string | null }>;
  proxy_type?: string | null;
};
