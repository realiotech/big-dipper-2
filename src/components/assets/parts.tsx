import { Box, Button, Flex, Stack, Text } from "@chakra-ui/react";
import numeral from "numeral";
import { ReactNode } from "react";
import { Panel } from "@/components/explorer/panel";
import { Pager } from "@/components/explorer/pager";
import { AddressLink } from "@/components/explorer/address_link";
import { Tag } from "@/components/explorer/badges";
import { Column } from "@/components/explorer/data_table";
import { ValidatorName } from "@/components/explorer/validator_name";
import { formatPercent } from "@/components/explorer/format";

// Layout pieces shared by the native asset page (/assets/rio) and the ERC-20 page (/erc20/0x…).

export const PAGE_SIZE = 20;

export const tokens = (value: number) => numeral(Number(value.toFixed(2))).format("0,0.[00]");

export const PanelTitle = ({ title, subtitle }: { title: string; subtitle?: string }) => (
  <Box mb="4">
    <Text fontSize="md" fontWeight="600" color="explorer.text">
      {title}
    </Text>
    {subtitle && (
      <Text fontSize="sm" color="explorer.muted">
        {subtitle}
      </Text>
    )}
  </Box>
);

export const Paged = ({ count, page, setPage, label }: { count: number; page: number; setPage: (page: number) => void; label: string }) =>
  count > 0 ? (
    <Flex justify="space-between" align="center" mt="3" gap="3" wrap="wrap">
      <Text fontSize="sm" color="explorer.muted">
        {numeral(count).format("0,0")} {label}
      </Text>
      {count > PAGE_SIZE && <Pager count={count} pageSize={PAGE_SIZE} page={page} onPageChange={setPage} />}
    </Flex>
  ) : null;

/** Small pill switch above a table, e.g. Delegations / Unbondings. */
export function Segmented<T extends string>({
  value,
  onChange,
  items,
}: {
  value: T;
  onChange: (value: NoInfer<T>) => void;
  items: Array<{ value: NoInfer<T>; label: string; count: number }>;
}) {
  return (
    <Flex gap="1" p="1" mb="2" w="fit-content" borderRadius="6px" bg="explorer.inset">
      {items.map((item) => (
        <Button
          key={item.value}
          size="xs"
          variant="ghost"
          fontWeight="400"
          color={value === item.value ? "explorer.text" : "explorer.muted"}
          bg={value === item.value ? "explorer.card" : "transparent"}
          onClick={() => onChange(item.value)}
        >
          {item.label}
          <Text as="span" color="explorer.muted" fontSize="xs">
            {numeral(item.count).format("0,0")}
          </Text>
        </Button>
      ))}
    </Flex>
  );
}

/** Bonded / unbonding / liquid bar and legend, with a closing footer row. */
export const SupplyComposition = ({
  supply,
  bonded,
  unbonding,
  symbol,
  footer,
}: {
  supply: number;
  bonded: number;
  unbonding: number;
  symbol: string;
  footer: { label: string; value: ReactNode };
}) => {
  const parts = [
    { label: "Bonded", value: bonded, color: "explorer.chart1" },
    { label: "Unbonding", value: unbonding, color: "explorer.chart3" },
    { label: "Liquid", value: Math.max(supply - bonded - unbonding, 0), color: "explorer.muted" },
  ];
  const share = (value: number) => (supply ? (value / supply) * 100 : 0);

  return (
    <Panel>
      <PanelTitle title="Supply composition" subtitle={`${tokens(supply)} ${symbol} total supply`} />
      <Flex h="6px" borderRadius="full" overflow="hidden" bg="explorer.inset" my="8">
        {parts.map((part) => (
          <Box key={part.label} h="full" bg={part.color} w={`${share(part.value)}%`} />
        ))}
      </Flex>
      <Stack gap="3">
        {parts.map((part) => (
          <Flex key={part.label} justify="space-between" fontSize="sm" gap="4">
            <Flex align="center" gap="2.5" color="explorer.text">
              <Box w="7px" h="7px" borderRadius="full" bg={part.color} />
              {part.label}
            </Flex>
            <Flex gap="6">
              <Text color="explorer.text">
                {tokens(part.value)}{" "}
                <Text as="span" color="explorer.muted" fontSize="xs">
                  {symbol}
                </Text>
              </Text>
              <Text color="explorer.muted" w="56px" textAlign="end">
                {formatPercent(share(part.value))}
              </Text>
            </Flex>
          </Flex>
        ))}
      </Stack>
      <Flex justify="space-between" mt="6" pt="3" borderTopWidth="1px" borderColor="explorer.border" fontSize="sm">
        <Text color="explorer.muted">{footer.label}</Text>
        <Box color="explorer.text">{footer.value}</Box>
      </Flex>
    </Panel>
  );
};

export const TokenInformation = ({ rows }: { rows: Array<[string, ReactNode]> }) => (
  <Panel>
    <PanelTitle title="Token information" subtitle="On chain metadata" />
    {rows.map(([label, value], index) => (
      <Flex key={label} justify="space-between" align="center" gap="4" py="3" borderTopWidth={index ? "1px" : "0"} borderColor="explorer.border" fontSize="sm">
        <Text color="explorer.muted">{label}</Text>
        <Box color="explorer.text" textAlign="end">
          {value}
        </Box>
      </Flex>
    ))}
  </Panel>
);

export type HolderRow = { address: string; label: string; amount: number; share: number };
export type StakeRow = { address: string; validator: string; bondWeight: number; amount: number; height?: number };

export const holderColumns: Column<HolderRow>[] = [
  { key: "address", header: "Address", render: (row) => <AddressLink address={row.address} beginning={14} ending={8} /> },
  { key: "label", header: "Label", render: (row) => (row.label ? <Flex><Tag>{row.label}</Tag></Flex> : null) },
  { key: "amount", header: "Amount", align: "end", render: (row) => tokens(row.amount) },
  { key: "share", header: "Share", align: "end", render: (row) => formatPercent(row.share) },
];

export const stakeColumns = (withHeight: boolean): Column<StakeRow>[] => [
  { key: "address", header: "Address", render: (row) => <AddressLink address={row.address} beginning={12} ending={8} /> },
  { key: "validator", header: "Validator", render: (row) => <ValidatorName address={row.validator} /> },
  { key: "weight", header: "Bond weight", align: "end", render: (row) => numeral(row.bondWeight).format("0.0[0]") },
  { key: "power", header: "Voting power", align: "end", render: (row) => tokens(row.amount * row.bondWeight) },
  { key: "amount", header: "Amount", align: "end", render: (row) => tokens(row.amount) },
  ...(withHeight ? [{ key: "height", header: "Started at block", align: "end" as const, render: (row: StakeRow) => numeral(row.height).format("0,0") }] : []),
];
