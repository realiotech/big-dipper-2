import React, { useCallback, useEffect, useState } from 'react';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { Box, Button, Flex, Grid, Input, Link as ChakraLink, NativeSelect, Stack, Text } from '@chakra-ui/react';
import { LuSearch } from 'react-icons/lu';
import { InputGroup } from '@/components/ui/input-group';
import { Panel } from '@/components/explorer/panel';
import { PageTitle } from '@/components/explorer/page_title';
import { Column, DataTable } from '@/components/explorer/data_table';
import { Pager } from '@/components/explorer/pager';
import { AddressLink } from '@/components/explorer/address_link';
import { Tag } from '@/components/explorer/badges';
import { formatUtc } from '@/components/explorer/format';
import { getMiddleEllipsis } from '@/utils/get_middle_ellipsis';
import { ACCOUNT_DETAILS, BLOCK_DETAILS, TRANSACTION_DETAILS } from '@/utils/go_to_page';
import type {
  DenomAmount,
  MonitorActivity,
  MonitorAddress,
  MonitorOverview,
  PageResult,
} from './types';
import { denomSymbol, formatBaseUnits, messageLabel } from './format';

export type MonitorProps = {
  unauthorized?: boolean;
  overview?: MonitorOverview;
  addresses?: PageResult<MonitorAddress>;
  activity?: PageResult<MonitorActivity> & { types: string[] };
  filters?: Record<string, string>;
};

const params = (
  filters: Record<string, string>,
  patch: Record<string, string | number>
) => {
  const out = new URLSearchParams({
    ...filters,
    ...Object.fromEntries(
      Object.entries(patch).map(([key, value]) => [key, String(value)])
    ),
  });
  [...out].forEach(([key, value]) => {
    if (!value) out.delete(key);
  });
  const query = out.toString();
  return query ? `/monitor?${query}` : '/monitor';
};

type Tone = 'success' | 'warning' | 'critical' | 'muted';

const TONE_COLOR: Record<Tone, string> = {
  success: 'explorer.success',
  warning: 'explorer.warning',
  critical: 'explorer.critical',
  muted: 'explorer.muted',
};

/** Coloured dot and label, e.g. "Activity scan is current" or a tx result. */
const Dot = ({ tone, children }: { tone: Tone; children: React.ReactNode }) => (
  <Flex as="span" display="inline-flex" align="center" gap="1.5" fontSize="sm" color={TONE_COLOR[tone]} whiteSpace="nowrap">
    <Box w="5px" h="5px" borderRadius="full" bg="currentColor" flexShrink={0} />
    {children}
  </Flex>
);

const SectionTitle = ({ title, subtitle, aside }: { title: string; subtitle?: React.ReactNode; aside?: React.ReactNode }) => (
  <Flex justify="space-between" align={{ base: 'start', md: 'center' }} direction={{ base: 'column', md: 'row' }} gap="2" mb="4">
    <Box>
      <Text fontSize="md" fontWeight="600" color="explorer.text">
        {title}
      </Text>
      {subtitle && (
        <Text fontSize="sm" color="explorer.muted">
          {subtitle}
        </Text>
      )}
    </Box>
    {aside && (
      <Box fontSize="sm" color="explorer.muted">
        {aside}
      </Box>
    )}
  </Flex>
);

const Amounts = ({ rows }: { rows: { denom: string; amount: string }[] }) =>
  rows.length ? (
    <Stack gap="0.5">
      {rows.map((row) => (
        <Text key={row.denom} whiteSpace="nowrap" title={row.denom}>
          {formatBaseUnits(row.amount, row.denom, 2, false)}{' '}
          <Text as="span" fontSize="xs" color="explorer.muted">
            {denomSymbol(row.denom)}
          </Text>
        </Text>
      ))}
    </Stack>
  ) : (
    <Text color="explorer.muted">—</Text>
  );

const PlainAddress = ({ address }: { address: string }) => (
  <ChakraLink asChild color="explorer.link">
    <NextLink href={ACCOUNT_DETAILS(address)}>{getMiddleEllipsis(address, { beginning: 9, ending: 7 })}</NextLink>
  </ChakraLink>
);

const PageFooter = ({
  shown,
  total,
  label,
  pageSize,
  page,
  onPage,
}: {
  shown: number;
  total: number;
  label: string;
  pageSize: number;
  page: number;
  onPage: (next: number) => void;
}) =>
  total > 0 ? (
    <Flex justify="space-between" align="center" mt="3" gap="3" wrap="wrap">
      <Text fontSize="sm" color="explorer.muted">
        Showing{' '}
        <Text as="span" color="explorer.text">
          {shown.toLocaleString()}
        </Text>{' '}
        of{' '}
        <Text as="span" color="explorer.text">
          {total.toLocaleString()}
        </Text>{' '}
        {label}
      </Text>
      {total > pageSize && <Pager count={total} pageSize={pageSize} page={page} onPageChange={onPage} />}
    </Flex>
  ) : null;

const fieldProps = {
  h: '36px',
  fontSize: 'sm',
  bg: 'explorer.card',
  color: 'explorer.text',
  borderColor: 'explorer.border',
  borderRadius: '6px',
  _focusVisible: { borderColor: 'explorer.accent', outline: 'none' },
} as const;

const Select = ({
  label,
  value,
  onChange,
  width,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  width: string;
  children: React.ReactNode;
}) => (
  <NativeSelect.Root w={{ base: 'full', md: width }} size="sm">
    <NativeSelect.Field aria-label={label} value={value} onChange={(event) => onChange(event.target.value)} {...fieldProps} px="3">
      {children}
    </NativeSelect.Field>
    <NativeSelect.Indicator color="explorer.muted" />
  </NativeSelect.Root>
);

function MonitorStatus({ data }: { data: MonitorOverview }) {
  const hasActivity = data.activity.sinceRestart > 0;
  const isStale =
    data.job.stale || data.job.status !== 'ok' || (data.job.lag ?? 1) > 0;
  const tone: Tone = hasActivity ? 'critical' : isStale ? 'warning' : 'success';
  const statusLabel = hasActivity
    ? `${data.activity.sinceRestart} compromised-wallet events since restart`
    : isStale
      ? 'Coverage needs attention'
      : 'Activity scan is current';

  const stats = [
    ['Compromised', data.watchlistSize],
    ['Active stakers', data.stakers],
    ['Stake positions', data.lockRows],
    ['Validators', data.validators],
    ['Unbonding', data.unbondingAddresses],
    ['24h activity', data.activity.last24h],
  ] as const;

  const meta = [
    ['verified', data.job.verifiedThrough?.toLocaleString() ?? 'never'],
    ['captured', data.job.capturedHead?.toLocaleString() ?? 'never'],
    ['last run', data.job.ranAt ? formatUtc(data.job.ranAt) : 'never'],
    ['status', data.job.status],
  ];

  return (
    <Panel>
      <SectionTitle
        title="Monitor status"
        subtitle={
          hasActivity
            ? 'Review the matched activity below.'
            : isStale
              ? 'A quiet feed is not conclusive until the worker catches up.'
              : 'No compromised-wallet activity has been detected since restart.'
        }
        aside={<Dot tone={tone}>{statusLabel}</Dot>}
      />
      <Grid
        templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', xl: 'repeat(6, 1fr)' }}
        gap="5"
        pt="4"
        borderTopWidth="1px"
        borderColor="explorer.border"
      >
        {stats.map(([label, value]) => (
          <Box key={label}>
            <Text fontSize="sm" color="explorer.muted">
              {label}
            </Text>
            <Text fontSize="26px" lineHeight="36px" letterSpacing="-0.02em" color="explorer.text">
              {value.toLocaleString()}
            </Text>
          </Box>
        ))}
      </Grid>
      <Flex gap={{ base: '3', md: '6' }} wrap="wrap" mt="4" pt="3" borderTopWidth="1px" borderColor="explorer.border" fontSize="xs">
        {meta.map(([label, value]) => (
          <Text key={label} color="explorer.muted">
            {label}{' '}
            <Text as="span" color="explorer.text">
              {value}
            </Text>
          </Text>
        ))}
      </Flex>
    </Panel>
  );
}

type DenomTotal = { denom: string; staked: string; balance: string; total: string };

// Snapshot amounts are 18-decimal base units, so they are folded with BigInt.
const denomTotals = (
  staked: DenomAmount[],
  balances: DenomAmount[]
): DenomTotal[] => {
  const rows = new Map<string, { staked: bigint; balance: bigint }>();
  const add = (list: DenomAmount[], key: 'staked' | 'balance') =>
    list.forEach((row) => {
      const current = rows.get(row.denom) ?? { staked: BigInt(0), balance: BigInt(0) };
      current[key] += BigInt(row.amount || '0');
      rows.set(row.denom, current);
    });
  add(staked, 'staked');
  add(balances, 'balance');
  return [...rows]
    .map(([denom, value]) => ({
      denom,
      staked: value.staked.toString(),
      balance: value.balance.toString(),
      total: (value.staked + value.balance).toString(),
    }))
    .sort(
      (a, b) =>
        (BigInt(a.total) < BigInt(b.total) ? 1 : BigInt(a.total) > BigInt(b.total) ? -1 : 0) ||
        a.denom.localeCompare(b.denom)
    );
};

function BlacklistTotals({ data }: { data: MonitorOverview }) {
  const rows = denomTotals(data.stakeByDenom, data.balanceByDenom);

  return (
    <Panel>
      <SectionTitle
        title="Blacklist totals"
        subtitle="Staked and wallet balances held by every blacklisted address, per token, from the latest snapshot."
        aside={`${data.stakers.toLocaleString()} staking · ${data.balanceAddresses.toLocaleString()} with a balance · ${data.watchlistSize.toLocaleString()} blacklisted`}
      />
      {rows.length ? (
        <Grid templateColumns={{ base: '1fr', sm: 'repeat(auto-fill, minmax(200px, 1fr))' }} gap="3">
          {rows.map((row) => (
            <Box key={row.denom} bg="explorer.page" borderWidth="1px" borderColor="explorer.border" borderRadius="6px" p="4" minW="0">
              <Text fontSize="sm" color="explorer.muted" title={row.denom} overflowWrap="anywhere">
                {denomSymbol(row.denom)} total
              </Text>
              <Text fontSize="22px" lineHeight="32px" letterSpacing="-0.02em" color="explorer.text" mt="1" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
                {formatBaseUnits(row.total, row.denom, 2, false)}
              </Text>
              <Flex justify="space-between" gap="3" mt="3" fontSize="xs">
                <Box minW="0">
                  <Text color="explorer.muted">Staked</Text>
                  <Text color="explorer.text" whiteSpace="nowrap">
                    {formatBaseUnits(row.staked, row.denom, 2, false)}
                  </Text>
                </Box>
                <Box textAlign="end" minW="0">
                  <Text color="explorer.muted">Balance</Text>
                  <Text color="explorer.text" whiteSpace="nowrap">
                    {formatBaseUnits(row.balance, row.denom, 2, false)}
                  </Text>
                </Box>
              </Flex>
            </Box>
          ))}
        </Grid>
      ) : (
        <Text fontSize="sm" color="explorer.muted">
          No snapshot amounts captured yet.
        </Text>
      )}
    </Panel>
  );
}

function Coverage({ data }: { data: MonitorOverview }) {
  const rows = [
    {
      key: 'evm',
      title: 'EVM transactions',
      body: (
        <>
          <Text>
            Explorer message type{' '}
            <Text as="span" color="explorer.text">
              {data.evm.actualType}
            </Text>
          </Text>
          <Text fontSize="xs">
            Observed:{' '}
            {data.evm.observedTypes.map((row) => `${messageLabel(row.type)} ${row.count}`).join(', ') || 'none in the stored range'}
          </Text>
        </>
      ),
      aside: <Dot tone={data.evm.covered ? 'success' : 'critical'}>{data.evm.covered ? 'Covered' : 'Not covered'}</Dot>,
    },
    ...data.classifications.map((item) => ({
      key: `${item.tag}:${item.address}`,
      title: item.label ?? tagLabel(item.tag),
      body: <Text>Behavioral classification only, no ownership attribution.</Text>,
      aside: (
        <Flex gap="3" align="center" wrap="wrap">
          <Text fontSize="xs" color="explorer.muted" textTransform="uppercase" letterSpacing="0.04em">
            {item.tag.replace(/_/g, ' ')}
          </Text>
          <AddressLink address={item.address} beginning={12} ending={10} />
        </Flex>
      ),
    })),
  ];

  return (
    <Panel>
      <SectionTitle title="Coverage" />
      {rows.map((row, index) => (
        <Flex
          key={row.key}
          justify="space-between"
          align={{ base: 'start', md: 'center' }}
          direction={{ base: 'column', md: 'row' }}
          gap="2"
          py="3"
          borderTopWidth={index ? '1px' : '0'}
          borderColor="explorer.border"
        >
          <Box fontSize="sm" color="explorer.muted">
            <Text fontWeight="600" color="explorer.text" mb="1">
              {row.title}
            </Text>
            {row.body}
          </Box>
          {row.aside}
        </Flex>
      ))}
    </Panel>
  );
}

const TAG_COLOR: Record<string, string> = {
  compromised: 'explorer.warning',
  suspected_sink: 'explorer.critical',
};

const tagLabel = (tag: string) => tag.replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase());

const addressColumns: Column<MonitorAddress>[] = [
  { key: 'address', header: 'Address', render: (row) => <AddressLink address={row.address} beginning={10} ending={8} /> },
  {
    key: 'tags',
    header: 'Classification',
    render: (row) => (
      <Flex gap="1" wrap="wrap">
        {row.tags.map((tag) => (
          <Tag key={tag} color={TAG_COLOR[tag] ?? 'explorer.muted'}>
            {tagLabel(tag)}
          </Tag>
        ))}
      </Flex>
    ),
  },
  { key: 'stake', header: 'Staked', render: (row) => <Amounts rows={row.stake} /> },
  { key: 'balances', header: 'Balances', render: (row) => <Amounts rows={row.balances} /> },
  { key: 'validators', header: 'Delegated validators', align: 'end', render: (row) => row.validators },
  {
    key: 'activity',
    header: 'Last activity',
    align: 'end',
    render: (row) =>
      row.lastActivityHeight ? (
        <ChakraLink asChild color="explorer.link">
          <NextLink href={BLOCK_DETAILS(row.lastActivityHeight)}>{row.lastActivityHeight.toLocaleString()}</NextLink>
        </ChakraLink>
      ) : (
        <Text color="explorer.muted">—</Text>
      ),
  },
];

const activityColumns: Column<MonitorActivity>[] = [
  {
    key: 'block',
    header: 'Block / time',
    render: (row) => (
      <Stack gap="0.5">
        <ChakraLink asChild color="explorer.link">
          <NextLink href={TRANSACTION_DETAILS(row.txHash)}>{row.height.toLocaleString()}</NextLink>
        </ChakraLink>
        <Text fontSize="xs" color="explorer.muted">
          {row.blockTime ? formatUtc(row.blockTime) : '—'}
        </Text>
        <Text fontSize="xs" color="explorer.muted" title={row.txHash}>
          {getMiddleEllipsis(row.txHash, { beginning: 6, ending: 6 })}
        </Text>
      </Stack>
    ),
  },
  { key: 'wallet', header: 'Wallet', render: (row) => <PlainAddress address={row.address} /> },
  {
    key: 'message',
    header: 'Message',
    render: (row) => (
      <Flex>
        <Tag color="explorer.text">{messageLabel(row.type)}</Tag>
      </Flex>
    ),
  },
  { key: 'direction', header: 'Direction', render: (row) => <Text textTransform="capitalize">{row.direction}</Text> },
  {
    key: 'counterparties',
    header: 'Counterparties',
    render: (row) =>
      row.counterparties.length ? (
        <Stack gap="0.5">
          {row.counterparties.map((address) => (
            <PlainAddress key={address} address={address} />
          ))}
        </Stack>
      ) : (
        <Text color="explorer.muted">—</Text>
      ),
  },
  {
    key: 'result',
    header: 'Result',
    align: 'end',
    render: (row) =>
      row.success === true ? <Dot tone="success">Success</Dot> : row.success === false ? <Dot tone="critical">Failed</Dot> : <Dot tone="muted">Unknown</Dot>,
  },
];

export default function Monitor({
  unauthorized,
  overview: summary,
  addresses,
  activity,
  filters = {},
}: MonitorProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [query, setQuery] = useState(filters.q ?? '');

  useEffect(() => setQuery(filters.q ?? ''), [filters.q]);

  // Client-side navigation re-runs getServerSideProps and swaps the props in
  // place; only the route events tell us when that round trip is in flight.
  useEffect(() => {
    const start = () => setPending(true);
    const done = () => setPending(false);
    router.events.on('routeChangeStart', start);
    router.events.on('routeChangeComplete', done);
    router.events.on('routeChangeError', done);
    return () => {
      router.events.off('routeChangeStart', start);
      router.events.off('routeChangeComplete', done);
      router.events.off('routeChangeError', done);
    };
  }, [router]);

  const go = useCallback(
    (patch: Record<string, string | number>) =>
      router.push(params(filters, patch), undefined, { scroll: false }),
    [router, filters]
  );

  if (unauthorized || !summary || !addresses || !activity) {
    return (
      <Stack gap="5">
        <PageTitle title="Wallet Monitor" />
        <Panel>
          <SectionTitle title="Authentication required" subtitle="Enter the monitor credentials in the browser prompt." />
        </Panel>
      </Stack>
    );
  }

  const stakerDelta =
    summary.previousStakers == null
      ? null
      : summary.stakers - summary.previousStakers;

  // Stake and balance sorting rank one token at a time, so the picker offers
  // whichever tokens the latest snapshot actually holds.
  const sortDenoms = [
    ...new Set([
      ...summary.stakeByDenom.map((row) => row.denom),
      ...summary.balanceByDenom.map((row) => row.denom),
    ]),
  ];
  const sortDenom = filters.denom || 'ario';
  const pendingStyle = { opacity: pending ? 0.55 : 1, transition: 'opacity 0.15s' };

  return (
    <Stack gap="5">
      <PageTitle
        title="Wallet Monitor"
        subtitle="Internal incident view for compromised-wallet staking exposure and decoded on-chain activity."
        actions={
          <Button asChild size="sm" variant="outline" fontWeight="400" color="explorer.text" borderColor="explorer.border" flexShrink={0}>
            <a href="/api/monitor/export">Export staking CSV</a>
          </Button>
        }
      />

      <MonitorStatus data={summary} />
      <BlacklistTotals data={summary} />
      <Coverage data={summary} />

      <Panel>
        <SectionTitle
          title="Staking exposure"
          aside={
            <>
              {addresses.total.toLocaleString()} addresses
              {stakerDelta == null ? '' : ` · ${stakerDelta >= 0 ? '+' : ''}${stakerDelta} vs prior snapshot`}
            </>
          }
        />
        <form
          onSubmit={(event) => {
            event.preventDefault();
            go({ q: query, sPage: 1 });
          }}
        >
          <Flex gap="3" wrap="wrap" mb="2">
            <InputGroup w={{ base: 'full', md: '320px' }} startElement={<LuSearch />} startElementProps={{ color: 'explorer.muted' }}>
              <Input
                aria-label="Search address"
                name="q"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search address"
                _placeholder={{ color: 'explorer.muted' }}
                {...fieldProps}
              />
            </InputGroup>
            <Select label="Sort addresses" value={filters.sort || 'stake'} onChange={(sort) => go({ sort, sPage: 1 })} width="190px">
              <option value="stake">Stake high to low</option>
              <option value="stake_asc">Stake low to high</option>
              <option value="balance">Balance high to low</option>
              <option value="balance_asc">Balance low to high</option>
              <option value="validators">Validator count</option>
              <option value="activity">Recent activity</option>
              <option value="address">Address</option>
            </Select>
            {sortDenoms.length > 1 ? (
              <Select label="Token to sort by" value={sortDenom} onChange={(denom) => go({ denom, sPage: 1 })} width="130px">
                {sortDenoms.map((denom) => (
                  <option key={denom} value={denom} title={denom}>
                    {denomSymbol(denom)}
                  </option>
                ))}
              </Select>
            ) : null}
            <Button type="submit" size="sm" h="36px" px="4" fontWeight="400" bg="explorer.accent" color="white" _hover={{ opacity: 0.9 }} disabled={pending}>
              Search
            </Button>
          </Flex>
        </form>
        <Box {...pendingStyle}>
          <DataTable columns={addressColumns} rows={addresses.rows} rowKey={(row) => row.address} emptyText="No matching addresses" />
        </Box>
        <PageFooter
          shown={addresses.rows.length}
          total={addresses.total}
          label="addresses"
          pageSize={addresses.pageSize}
          page={addresses.page}
          onPage={(next) => go({ sPage: next })}
        />
      </Panel>

      <Panel>
        <SectionTitle title="Activity" aside={`${activity.total.toLocaleString()} matches · one row per watched wallet in a message`} />
        <Flex gap="3" wrap="wrap" mb="2" align="center">
          <Select label="Message type" value={filters.type || ''} onChange={(type) => go({ type, aPage: 1 })} width="200px">
            <option value="">All message types</option>
            {activity.types.map((type) => (
              <option key={type} value={type}>
                {messageLabel(type)}
              </option>
            ))}
          </Select>
          <Select label="Direction" value={filters.direction || ''} onChange={(direction) => go({ direction, aPage: 1 })} width="170px">
            <option value="">All directions</option>
            <option value="incoming">Incoming</option>
            <option value="outgoing">Outgoing</option>
            <option value="self">Self</option>
            <option value="involved">Involved</option>
          </Select>
          <Select label="Result" value={filters.success || ''} onChange={(success) => go({ success, aPage: 1 })} width="170px">
            <option value="">All results</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
            <option value="unknown">Unknown</option>
          </Select>
          <Flex as="label" align="center" gap="2" px="1" fontSize="sm" color="explorer.muted" cursor="pointer">
            <input
              type="checkbox"
              name="sinceRestart"
              value="1"
              checked={filters.sinceRestart === '1'}
              onChange={(event) => go({ sinceRestart: event.target.checked ? '1' : '', aPage: 1 })}
            />
            Since restart
          </Flex>
        </Flex>
        <Box {...pendingStyle}>
          <DataTable
            columns={activityColumns}
            rows={activity.rows}
            rowKey={(row) => `${row.height}:${row.txHash}:${row.msgIndex}:${row.address}`}
            emptyText="No matching activity"
          />
        </Box>
        <PageFooter
          shown={activity.rows.length}
          total={activity.total}
          label="matches"
          pageSize={activity.pageSize}
          page={activity.page}
          onPage={(next) => go({ aPage: next })}
        />
      </Panel>

      <Text fontSize="sm" color="explorer.muted">
        Snapshot {summary.snapshotAt ? formatUtc(summary.snapshotAt) : 'not yet captured'} at block{' '}
        {summary.snapshotHead?.toLocaleString() ?? '—'}. “Suspected sink” is a behavioral label, not an ownership attribution.
      </Text>
    </Stack>
  );
}
