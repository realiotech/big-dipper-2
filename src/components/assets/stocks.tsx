import { Box, Button, Flex, Link as ChakraLink, Menu, Portal, Skeleton, Table, Text } from "@chakra-ui/react";
import numeral from "numeral";
import { Fragment, useEffect, useMemo, useState } from "react";
import { LuChevronDown, LuChevronRight } from "react-icons/lu";
import { Pager } from "@/components/explorer/pager";
import { ValidatorAvatar } from "@/components/explorer/badges";
import { toolbarButtonProps } from "@/components/explorer/tx_toolbar";
import { formatCompact } from "@/components/explorer/format";
import { sortStocks, STOCK_SORTS, StockGroup, StockSort, StocksResponse, StockToken } from "@/utils/stocks";

// Assets > Stocks: tokenized stocks grouped by company, like Uniswap's
// Explore > Stocks. Figma: Realio Explorer, "15 Assets Stocks Light" (378:14068).

const PAGE_SIZE = 10;
const VERSIONS_PREVIEW = 5;
const REFRESH_MS = 60_000;

export const useStocks = () => {
  const [state, setState] = useState<{ loading: boolean; data: StocksResponse | null }>({ loading: true, data: null });

  useEffect(() => {
    let cancelled = false;
    const load = () =>
      fetch("/api/stocks")
        .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
        .then((data: StocksResponse) => !cancelled && setState({ loading: false, data }))
        .catch(() => !cancelled && setState((prev) => ({ loading: false, data: prev.data })));
    load();
    const timer = setInterval(load, REFRESH_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  return state;
};

const usd = (value: number) => (value ? `$${formatCompact(value)}` : "—");

/** $204.42, with more digits for sub-dollar prices. */
const price = (value: number) => (value ? `$${numeral(value).format(value < 1 ? "0,0.00[0000]" : "0,0.00")}` : "—");

const Trend = ({ up }: { up: boolean }) => (
  <svg width="8" height="5" viewBox="0 0 8 5" aria-hidden>
    <path d={up ? "M4 0L8 5H0Z" : "M4 5L0 0H8Z"} fill="currentColor" />
  </svg>
);

const Change = ({ value }: { value: number | null }) =>
  value === null ? (
    <Text color="explorer.muted">—</Text>
  ) : (
    <Flex align="center" justify="flex-end" gap="1">
      <Box as="span" display="inline-flex" color={value >= 0 ? "explorer.success" : "explorer.danger"} aria-label={value >= 0 ? "up" : "down"}>
        <Trend up={value >= 0} />
      </Box>
      {numeral(Math.abs(Number(value.toFixed(2))) / 100).format("0.[00]%")}
    </Flex>
  );

/** 120×28 line of the last day's hourly prices, green when the day closed up. */
const Sparkline = ({ points }: { points: number[] }) => {
  if (points.length < 2) return null;
  const width = 120;
  const height = 28;
  const min = Math.min(...points);
  const range = Math.max(...points) - min || 1;
  const path = points
    .map((point, index) => `${((index / (points.length - 1)) * width).toFixed(1)},${(1 + (1 - (point - min) / range) * (height - 2)).toFixed(1)}`)
    .join(" ");
  return (
    <Box as="span" display="inline-flex" color={points[points.length - 1] >= points[0] ? "explorer.success" : "explorer.danger"}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden>
        <polyline points={path} fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" strokeLinecap="round" />
      </svg>
    </Box>
  );
};

// Figma widths; the chart column takes whatever is left.
const COLUMNS: Array<{ key: string; header: string; width?: string; align: "start" | "end" }> = [
  { key: "rank", header: "#", width: "48px", align: "end" },
  { key: "stock", header: "Stock", width: "316px", align: "start" },
  { key: "price", header: "Price", width: "150px", align: "end" },
  { key: "1h", header: "1H", width: "110px", align: "end" },
  { key: "1d", header: "1D", width: "110px", align: "end" },
  { key: "cap", header: "Market cap", width: "150px", align: "end" },
  { key: "volume", header: "1D volume", width: "150px", align: "end" },
  { key: "chart", header: "1D chart", align: "end" },
];

const cell = { borderColor: "explorer.border", px: "3", fontSize: "13px", lineHeight: "20px", color: "explorer.text" } as const;

const StockRow = ({ stock, rank, expanded, onToggle }: { stock: StockGroup; rank: number; expanded: boolean; onToggle: () => void }) => (
  <Table.Row
    bg={expanded ? "explorer.inset" : "transparent"}
    cursor="pointer"
    onClick={onToggle}
    _hover={{ bg: "explorer.inset" }}
    h="60px"
  >
    <Table.Cell {...cell} textAlign="end" color="explorer.muted">
      {rank}
    </Table.Cell>
    <Table.Cell {...cell}>
      <Flex align="center" gap="2.5">
        <Box
          as="button"
          aria-label={`${expanded ? "Collapse" : "Expand"} ${stock.name}`}
          aria-expanded={expanded}
          display="inline-flex"
          color="explorer.muted"
          fontSize="10px"
        >
          {expanded ? <LuChevronDown /> : <LuChevronRight />}
        </Box>
        <ValidatorAvatar name={stock.name} src={stock.image ?? undefined} size="32px" />
        <Box minW="0">
          <Text fontWeight="500" truncate>
            {stock.name}
          </Text>
          <Text fontSize="12px" lineHeight="18px" color="explorer.muted" truncate>
            {stock.tokens.length} {stock.tokens.length === 1 ? "token" : "tokens"} · {stock.ticker}
          </Text>
        </Box>
      </Flex>
    </Table.Cell>
    <Table.Cell {...cell} textAlign="end">
      <Text>{price(stock.price)}</Text>
      {stock.tokens.length > 1 && (
        <Text fontSize="12px" lineHeight="18px" color="explorer.muted">
          ± {numeral(Number(stock.spread.toFixed(1)) / 100).format("0.[0]%")}
        </Text>
      )}
    </Table.Cell>
    <Table.Cell {...cell} textAlign="end">
      <Change value={stock.change1h} />
    </Table.Cell>
    <Table.Cell {...cell} textAlign="end">
      <Change value={stock.change24h} />
    </Table.Cell>
    <Table.Cell {...cell} textAlign="end">
      {usd(stock.marketCap)}
    </Table.Cell>
    <Table.Cell {...cell} textAlign="end">
      {usd(stock.volume24h)}
    </Table.Cell>
    <Table.Cell {...cell} textAlign="end" pr="0">
      <Sparkline points={stock.sparkline} />
    </Table.Cell>
  </Table.Row>
);

const VersionRow = ({ token }: { token: StockToken }) => (
  <Table.Row bg="explorer.inset" h="52px">
    <Table.Cell {...cell} />
    <Table.Cell {...cell} pl="38px">
      <Flex align="center" gap="2.5">
        <ValidatorAvatar name={token.issuer ?? token.name} src={token.image ?? undefined} size="24px" />
        <Box minW="0">
          <ChakraLink
            href={`https://www.coingecko.com/en/coins/${token.id}`}
            target="_blank"
            rel="noopener noreferrer"
            color="explorer.text"
            onClick={(e) => e.stopPropagation()}
            display="block"
            truncate
          >
            {token.name}
          </ChakraLink>
          <Text fontSize="12px" lineHeight="18px" color="explorer.muted" truncate>
            {token.symbol}
            {token.issuer ? ` · ${token.issuer}` : ""}
          </Text>
        </Box>
      </Flex>
    </Table.Cell>
    <Table.Cell {...cell} textAlign="end">
      {price(token.price)}
    </Table.Cell>
    <Table.Cell {...cell} textAlign="end">
      <Change value={token.change1h} />
    </Table.Cell>
    <Table.Cell {...cell} textAlign="end">
      <Change value={token.change24h} />
    </Table.Cell>
    <Table.Cell {...cell} textAlign="end" color="explorer.muted">
      {usd(token.marketCap)}
    </Table.Cell>
    <Table.Cell {...cell} textAlign="end" color="explorer.muted">
      {usd(token.volume24h)}
    </Table.Cell>
    <Table.Cell {...cell} />
  </Table.Row>
);

const Versions = ({ stock }: { stock: StockGroup }) => {
  const [all, setAll] = useState(false);
  const shown = all ? stock.tokens : stock.tokens.slice(0, VERSIONS_PREVIEW);
  return (
    <>
      {shown.map((token) => (
        <VersionRow key={token.id} token={token} />
      ))}
      {stock.tokens.length > VERSIONS_PREVIEW && (
        <Table.Row bg="explorer.inset" h="40px">
          <Table.Cell {...cell} colSpan={COLUMNS.length} pl="120px">
            <Button variant="plain" size="xs" h="auto" p="0" fontSize="12px" fontWeight="500" color="explorer.link" onClick={() => setAll(!all)}>
              {all ? "Show fewer" : `Show all ${stock.tokens.length} tokenized versions`}
            </Button>
          </Table.Cell>
        </Table.Row>
      )}
    </>
  );
};

/** "1D volume ⌄" sort menu, shown at the right of the Assets tabs. */
export const StockSortMenu = ({ value, onChange }: { value: StockSort; onChange: (sort: StockSort) => void }) => (
  <Menu.Root positioning={{ placement: "bottom-end" }}>
    <Menu.Trigger asChild>
      <Button {...toolbarButtonProps} fontSize="12.5px" color="explorer.muted" mb="2">
        {STOCK_SORTS.find((sort) => sort.value === value)?.label}
        <LuChevronDown size="10" />
      </Button>
    </Menu.Trigger>
    <Portal>
      <Menu.Positioner>
        <Menu.Content minW="160px" bg="explorer.card" borderWidth="1px" borderColor="explorer.border" boxShadow="lg" p="1">
          <Menu.RadioItemGroup value={value} onValueChange={(e) => onChange(e.value as StockSort)}>
            {STOCK_SORTS.map((sort) => (
              <Menu.RadioItem key={sort.value} value={sort.value} cursor="pointer" color={sort.value === value ? "explorer.link" : "explorer.text"}>
                {sort.label}
                <Menu.ItemIndicator />
              </Menu.RadioItem>
            ))}
          </Menu.RadioItemGroup>
        </Menu.Content>
      </Menu.Positioner>
    </Portal>
  </Menu.Root>
);

export const StocksTable = ({ sort }: { sort: StockSort }) => {
  const { loading, data } = useStocks();
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<string | null>(null);
  const stocks = useMemo(() => sortStocks(data?.stocks ?? [], sort), [data, sort]);
  const visible = stocks.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => setPage(1), [sort]);

  if (!loading && stocks.length === 0) {
    return (
      <Text py="6" textAlign="center" fontSize="sm" color="explorer.muted">
        Stock prices are unavailable right now
      </Text>
    );
  }

  return (
    <>
      <Table.ScrollArea>
        <Table.Root size="sm" variant="line" minW="1220px" tableLayout="fixed">
          <Table.Header>
            <Table.Row bg="transparent">
              {COLUMNS.map((column) => (
                <Table.ColumnHeader
                  key={column.key}
                  {...cell}
                  _last={{ pr: "0" }}
                  py="2.5"
                  w={column.width}
                  textAlign={column.align}
                  color="explorer.muted"
                  fontWeight="400"
                  fontSize="12px"
                  lineHeight="18px"
                >
                  {column.header}
                </Table.ColumnHeader>
              ))}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {loading
              ? Array.from({ length: 6 }).map((_, index) => (
                  <Table.Row key={index} bg="transparent">
                    <Table.Cell colSpan={COLUMNS.length} {...cell} py="4">
                      <Skeleton h="24px" />
                    </Table.Cell>
                  </Table.Row>
                ))
              : visible.map((stock, index) => (
                  <Fragment key={stock.ticker}>
                    <StockRow
                      stock={stock}
                      rank={(page - 1) * PAGE_SIZE + index + 1}
                      expanded={expanded === stock.ticker}
                      onToggle={() => setExpanded(expanded === stock.ticker ? null : stock.ticker)}
                    />
                    {expanded === stock.ticker && <Versions stock={stock} />}
                  </Fragment>
                ))}
          </Table.Body>
        </Table.Root>
      </Table.ScrollArea>
      <Flex justify="space-between" align="center" mt="3" gap="3" wrap="wrap">
        <Text fontSize="12px" color="explorer.muted">
          Prices in USD. ± is the price spread across the tokenized versions of a stock.{" "}
          {data?.source === "sample" ? (
            "Sample data: CoinGecko could not be reached."
          ) : (
            <>
              Data from{" "}
              <ChakraLink href="https://www.coingecko.com/en/categories/tokenized-stock" target="_blank" rel="noopener noreferrer" color="explorer.link">
                CoinGecko
              </ChakraLink>
              .
            </>
          )}
        </Text>
        {stocks.length > PAGE_SIZE && <Pager count={stocks.length} pageSize={PAGE_SIZE} page={page} onPageChange={setPage} />}
      </Flex>
    </>
  );
};
