import React, { useCallback, useEffect, useState } from 'react';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import {
  Box,
  Button,
  Flex,
  Grid,
  Input,
  Link,
  NativeSelect,
  Table,
  Text,
} from '@chakra-ui/react';
import { Status } from '@/components/ui/status';
import Pagination from '@/components/layout/pagination';
import type {
  DenomAmount,
  MonitorActivity,
  MonitorAddress,
  MonitorOverview,
  PageResult,
} from './types';
import { denomSymbol, formatBaseUnits, messageLabel, short } from './format';

export type MonitorProps = {
  unauthorized?: boolean;
  overview?: MonitorOverview;
  addresses?: PageResult<MonitorAddress>;
  activity?: PageResult<MonitorActivity> & { types: string[] };
  filters?: Record<string, string>;
};

const panelBg = { base: '#FAFBFC', _dark: '#0F0F0F' };
const rowBg = { base: 'white', _dark: '#262626' };
const fieldBg = { base: 'white', _dark: 'black' };
const borderColor = { base: 'gray.200', _dark: 'gray.700' };
const mutedColor = { base: 'gray.600', _dark: 'gray.400' };
const actionBg = { base: '#707D8A', _dark: '#242323' };

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

const Amounts = ({ rows }: { rows: { denom: string; amount: string }[] }) => (
  <>
    {rows.length ? (
      rows.map((row) => (
        <Text key={row.denom} fontFamily="mono" whiteSpace="nowrap">
          {formatBaseUnits(row.amount, row.denom)}
        </Text>
      ))
    ) : (
      <Text color={mutedColor}>—</Text>
    )}
  </>
);

const PageBar = ({
  total,
  pageSize,
  page,
  onPage,
}: {
  total: number;
  pageSize: number;
  page: number;
  onPage: (next: number) => void;
}) =>
  (total <= pageSize ? null : (
    <Flex justify="center" pt="5">
      <Pagination
        page={page}
        pageInfo={{ count: total, pageSize, currentPage: page }}
        // The bundled Chakra typings lose zag's page field; the runtime detail
        // object always carries it.
        pageChangeFunc={(details) => onPage((details as unknown as { page: number }).page)}
        pageSizeChangeFunc={() => {}}
      />
    </Flex>
  ));

const Section = ({
  title,
  summary,
  children,
}: {
  title: string;
  summary?: React.ReactNode;
  children: React.ReactNode;
}) => (
  <Box bg={panelBg} borderRadius="20px" py="5" px={{ base: '4', md: '8' }}>
    <Flex
      justify="space-between"
      align={{ base: 'start', md: 'center' }}
      direction={{ base: 'column', md: 'row' }}
      gap="2"
      mb="5"
    >
      <Text fontSize="2xl" fontWeight="bold">
        {title}
      </Text>
      {summary ? (
        <Text color={mutedColor} fontSize="sm">
          {summary}
        </Text>
      ) : null}
    </Flex>
    {children}
  </Box>
);

const EmptyRow = ({ columns }: { columns: number }) => (
  <Table.Row bg={rowBg}>
    <Table.Cell
      colSpan={columns}
      py="8"
      textAlign="center"
      color={mutedColor}
      borderBottomColor={borderColor}
    >
      Nothing to show
    </Table.Cell>
  </Table.Row>
);

function MonitorStatus({ data }: { data: MonitorOverview }) {
  const hasActivity = data.activity.sinceRestart > 0;
  const isStale =
    data.job.stale || data.job.status !== 'ok' || (data.job.lag ?? 1) > 0;
  const statusValue = hasActivity ? 'error' : isStale ? 'warning' : 'success';
  const statusLabel = hasActivity
    ? `${data.activity.sinceRestart} compromised-wallet events since restart`
    : isStale
      ? 'Coverage needs attention'
      : 'Activity scan is current';

  const stats = [
    ['Compromised', data.watchlistSize.toLocaleString()],
    ['Active stakers', data.stakers.toLocaleString()],
    ['Stake positions', data.lockRows.toLocaleString()],
    ['Validators', data.validators.toLocaleString()],
    ['Unbonding', data.unbondingAddresses.toLocaleString()],
    ['24h activity', data.activity.last24h.toLocaleString()],
  ];

  return (
    <Box bg={panelBg} borderRadius="20px" py="5" px={{ base: '4', md: '8' }}>
      <Flex
        justify="space-between"
        align={{ base: 'start', md: 'center' }}
        direction={{ base: 'column', md: 'row' }}
        gap="3"
      >
        <Box>
          <Text fontSize="2xl" fontWeight="bold">
            Monitor status
          </Text>
          <Text color={mutedColor} fontSize="sm" mt="1">
            {hasActivity
              ? 'Review the matched activity below.'
              : isStale
                ? 'A quiet feed is not conclusive until the worker catches up.'
                : 'No compromised-wallet activity has been detected since restart.'}
          </Text>
        </Box>
        <Status value={statusValue}>{statusLabel}</Status>
      </Flex>

      <Grid
        templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', xl: 'repeat(6, 1fr)' }}
        gap={{ base: '5', md: '7' }}
        mt="6"
        pt="5"
        borderTopWidth="1px"
        borderColor={borderColor}
      >
        {stats.map(([label, value]) => (
          <Box key={label}>
            <Text fontSize="sm" color={mutedColor}>
              {label}
            </Text>
            <Text fontSize="2xl" fontWeight="semibold" mt="1">
              {value}
            </Text>
          </Box>
        ))}
      </Grid>

      <Flex
        gap={{ base: '3', md: '6' }}
        wrap="wrap"
        mt="5"
        pt="4"
        borderTopWidth="1px"
        borderColor={borderColor}
        color={mutedColor}
        fontFamily="mono"
        fontSize="xs"
      >
        <Text>verified {data.job.verifiedThrough?.toLocaleString() ?? 'never'}</Text>
        <Text>captured {data.job.capturedHead?.toLocaleString() ?? 'never'}</Text>
        <Text>
          last run {data.job.ranAt ? new Date(data.job.ranAt).toLocaleString() : 'never'}
        </Text>
        <Text>status {data.job.status}</Text>
      </Flex>
    </Box>
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
    <Box bg={panelBg} borderRadius="20px" py="5" px={{ base: '4', md: '8' }} mt="6">
      <Flex
        justify="space-between"
        align={{ base: 'start', md: 'center' }}
        direction={{ base: 'column', md: 'row' }}
        gap="2"
        mb="5"
      >
        <Box>
          <Text fontSize="2xl" fontWeight="bold">
            Blacklist totals
          </Text>
          <Text color={mutedColor} fontSize="sm" mt="1">
            Staked and wallet balances held by every blacklisted address, per
            token, from the latest snapshot.
          </Text>
        </Box>
        <Text color={mutedColor} fontSize="sm">
          {data.stakers.toLocaleString()} staking ·{' '}
          {data.balanceAddresses.toLocaleString()} with a balance ·{' '}
          {data.watchlistSize.toLocaleString()} blacklisted
        </Text>
      </Flex>

      {rows.length ? (
        <Grid
          templateColumns={{ base: '1fr', sm: 'repeat(auto-fill, minmax(260px, 1fr))' }}
          gap={{ base: '4', md: '5' }}
        >
          {rows.map((row) => (
            <Box
              key={row.denom}
              bg={rowBg}
              borderRadius="12px"
              borderWidth="1px"
              borderColor={borderColor}
              p="4"
              minW="0"
            >
              <Text
                fontSize="sm"
                color={mutedColor}
                title={row.denom}
                overflowWrap="anywhere"
              >
                {denomSymbol(row.denom)} total
              </Text>
              <Text
                fontSize="2xl"
                fontWeight="semibold"
                fontFamily="mono"
                mt="1"
                whiteSpace="nowrap"
              >
                {formatBaseUnits(row.total, row.denom, 2, false)}
              </Text>
              <Flex
                justify="space-between"
                gap="4"
                wrap="wrap"
                mt="3"
                pt="3"
                borderTopWidth="1px"
                borderColor={borderColor}
                fontSize="sm"
              >
                <Box minW="0">
                  <Text color={mutedColor}>Staked</Text>
                  <Text fontFamily="mono" whiteSpace="nowrap">
                    {formatBaseUnits(row.staked, row.denom, 2, false)}
                  </Text>
                </Box>
                <Box textAlign="end" minW="0">
                  <Text color={mutedColor}>Balance</Text>
                  <Text fontFamily="mono" whiteSpace="nowrap">
                    {formatBaseUnits(row.balance, row.denom, 2, false)}
                  </Text>
                </Box>
              </Flex>
            </Box>
          ))}
        </Grid>
      ) : (
        <Text color={mutedColor}>No snapshot amounts captured yet.</Text>
      )}
    </Box>
  );
}

const tableHeaderProps = {
  bg: panelBg,
  borderBottomColor: borderColor,
};

const tableCellProps = {
  borderBottomColor: borderColor,
  py: '3',
};

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
      <Box bg={panelBg} borderRadius="20px" p={{ base: '5', md: '8' }}>
        <Text fontSize="2xl" fontWeight="bold">
          Authentication required
        </Text>
        <Text mt="2" color={mutedColor}>
          Enter the monitor credentials in the browser prompt.
        </Text>
      </Box>
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

  return (
    <Box pb="10">
      <Flex
        justify="space-between"
        align={{ base: 'start', md: 'center' }}
        direction={{ base: 'column', md: 'row' }}
        gap="3"
        mb="5"
      >
        <Text color={mutedColor} maxW="760px">
          Internal incident view for compromised-wallet staking exposure and
          decoded on-chain activity.
        </Text>
        <Button
          asChild
          bg={actionBg}
          color="white"
          border={{ base: 'none', _dark: '1px solid white' }}
          _hover={{ opacity: 0.9 }}
        >
          <a href="/api/monitor/export">Export staking CSV</a>
        </Button>
      </Flex>

      <MonitorStatus data={summary} />

      <BlacklistTotals data={summary} />

      <Box bg={panelBg} borderRadius="20px" py="5" px={{ base: '4', md: '8' }} mt="6">
        <Text fontSize="2xl" fontWeight="bold">
          Coverage
        </Text>
        <Flex
          justify="space-between"
          gap="4"
          align={{ base: 'start', md: 'center' }}
          direction={{ base: 'column', md: 'row' }}
          py="4"
          mt="2"
          borderBottomWidth={summary.classifications.length ? '1px' : '0'}
          borderColor={borderColor}
        >
          <Box>
            <Text fontWeight="semibold">EVM transactions</Text>
            <Text fontSize="sm" color={mutedColor} mt="1">
              Explorer message type <code>{summary.evm.actualType}</code>
            </Text>
            <Text fontSize="xs" color={mutedColor} mt="1">
              Observed:{' '}
              {summary.evm.observedTypes
                .map((row) => `${messageLabel(row.type)} ${row.count}`)
                .join(', ') || 'none in the stored range'}
            </Text>
          </Box>
          <Status value={summary.evm.covered ? 'success' : 'error'}>
            {summary.evm.covered ? 'Covered' : 'Not covered'}
          </Status>
        </Flex>

        {summary.classifications.map((item, index) => (
          <Flex
            key={`${item.tag}:${item.address}`}
            justify="space-between"
            align={{ base: 'start', md: 'center' }}
            direction={{ base: 'column', md: 'row' }}
            gap="2"
            py="4"
            borderBottomWidth={index < summary.classifications.length - 1 ? '1px' : '0'}
            borderColor={borderColor}
          >
            <Box>
              <Text fontWeight="semibold">{item.label}</Text>
              <Text fontSize="sm" color={mutedColor} mt="1">
                Behavioral classification only; no ownership attribution.
              </Text>
            </Box>
            <Flex gap="3" align="center" wrap="wrap">
              <Text fontSize="xs" color={mutedColor} textTransform="uppercase">
                {item.tag.replace('_', ' ')}
              </Text>
              <Link asChild colorPalette="blue" fontFamily="mono" fontSize="sm">
                <NextLink href={`/accounts/${item.address}`}>
                  {short(item.address, 12)}
                </NextLink>
              </Link>
            </Flex>
          </Flex>
        ))}
      </Box>

      <Box mt="6">
        <Section
          title="Staking exposure"
          summary={
            <>
              {addresses.total.toLocaleString()} addresses
              {stakerDelta == null
                ? ''
                : ` · ${stakerDelta >= 0 ? '+' : ''}${stakerDelta} vs prior snapshot`}
            </>
          }
        >
          <form
            onSubmit={(event) => {
              event.preventDefault();
              go({ q: query, sPage: 1 });
            }}
          >
            <Flex gap="3" wrap="wrap" mb="5">
              <Input
                aria-label="Search address"
                name="q"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search address"
                bg={fieldBg}
                borderRadius="full"
                w={{ base: 'full', md: '360px' }}
              />
              <NativeSelect.Root w={{ base: 'full', md: '240px' }}>
                <NativeSelect.Field
                  aria-label="Sort addresses"
                  name="sort"
                  value={filters.sort || 'stake'}
                  onChange={(event) => go({ sort: event.target.value, sPage: 1 })}
                  bg={fieldBg}
                  borderRadius="full"
                  px="4"
                >
                  <option value="stake">Stake high to low</option>
                  <option value="stake_asc">Stake low to high</option>
                  <option value="balance">Balance high to low</option>
                  <option value="balance_asc">Balance low to high</option>
                  <option value="validators">Validator count</option>
                  <option value="activity">Recent activity</option>
                  <option value="address">Address</option>
                </NativeSelect.Field>
                <NativeSelect.Indicator />
              </NativeSelect.Root>
              {sortDenoms.length > 1 ? (
                <NativeSelect.Root w={{ base: 'full', md: '140px' }}>
                  <NativeSelect.Field
                    aria-label="Token to sort by"
                    name="denom"
                    value={sortDenom}
                    onChange={(event) => go({ denom: event.target.value, sPage: 1 })}
                    bg={fieldBg}
                    borderRadius="full"
                    px="4"
                  >
                    {sortDenoms.map((denom) => (
                      <option key={denom} value={denom} title={denom}>
                        {denomSymbol(denom)}
                      </option>
                    ))}
                  </NativeSelect.Field>
                  <NativeSelect.Indicator />
                </NativeSelect.Root>
              ) : null}
              <Button
                type="submit"
                bg={actionBg}
                color="white"
                border={{ base: 'none', _dark: '1px solid white' }}
                _hover={{ opacity: 0.9 }}
                disabled={pending}
              >
                Search
              </Button>
            </Flex>
          </form>

          <Table.ScrollArea
            border="none"
            borderRadius="10px"
            opacity={pending ? 0.55 : 1}
            transition="opacity 0.15s"
          >
            <Table.Root color={{ base: 'black', _dark: 'white' }} size="sm">
              <Table.Header>
                <Table.Row {...tableHeaderProps}>
                  <Table.ColumnHeader>Address</Table.ColumnHeader>
                  <Table.ColumnHeader>Classification</Table.ColumnHeader>
                  <Table.ColumnHeader>Staked</Table.ColumnHeader>
                  <Table.ColumnHeader>Balances</Table.ColumnHeader>
                  <Table.ColumnHeader textAlign="end">Delegated validators</Table.ColumnHeader>
                  <Table.ColumnHeader>Last activity</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {addresses.rows.length ? (
                  addresses.rows.map((row) => (
                    <Table.Row key={row.address} bg={rowBg}>
                      <Table.Cell {...tableCellProps} fontFamily="mono">
                        <Link asChild colorPalette="blue">
                          <NextLink href={`/accounts/${row.address}`}>
                            {short(row.address, 10)}
                          </NextLink>
                        </Link>
                      </Table.Cell>
                      <Table.Cell {...tableCellProps}>
                        <Text fontSize="xs" textTransform="uppercase" color={mutedColor}>
                          {row.tags.map((tag) => tag.replace('_', ' ')).join(', ')}
                        </Text>
                      </Table.Cell>
                      <Table.Cell {...tableCellProps}>
                        <Amounts rows={row.stake} />
                      </Table.Cell>
                      <Table.Cell {...tableCellProps}>
                        <Amounts rows={row.balances} />
                      </Table.Cell>
                      <Table.Cell {...tableCellProps} textAlign="end">
                        {row.validators}
                      </Table.Cell>
                      <Table.Cell {...tableCellProps}>
                        {row.lastActivityHeight?.toLocaleString() ?? '—'}
                      </Table.Cell>
                    </Table.Row>
                  ))
                ) : (
                  <EmptyRow columns={6} />
                )}
              </Table.Body>
            </Table.Root>
          </Table.ScrollArea>
          <PageBar
            total={addresses.total}
            pageSize={addresses.pageSize}
            page={addresses.page}
            onPage={(next) => go({ sPage: next })}
          />
        </Section>
      </Box>

      <Box mt="6">
        <Section
          title="Activity"
          summary={`${activity.total.toLocaleString()} matches · one row per watched wallet in a message`}
        >
          <Flex gap="3" wrap="wrap" mb="5">
            <NativeSelect.Root w={{ base: 'full', md: '220px' }}>
              <NativeSelect.Field
                aria-label="Message type"
                name="type"
                value={filters.type || ''}
                onChange={(event) => go({ type: event.target.value, aPage: 1 })}
                bg={fieldBg}
                borderRadius="full"
                px="4"
              >
                <option value="">All message types</option>
                {activity.types.map((type) => (
                  <option key={type} value={type}>
                    {messageLabel(type)}
                  </option>
                ))}
              </NativeSelect.Field>
              <NativeSelect.Indicator />
            </NativeSelect.Root>
            <NativeSelect.Root w={{ base: 'full', md: '180px' }}>
              <NativeSelect.Field
                aria-label="Direction"
                name="direction"
                value={filters.direction || ''}
                onChange={(event) => go({ direction: event.target.value, aPage: 1 })}
                bg={fieldBg}
                borderRadius="full"
                px="4"
              >
                <option value="">All directions</option>
                <option value="incoming">Incoming</option>
                <option value="outgoing">Outgoing</option>
                <option value="self">Self</option>
                <option value="involved">Involved</option>
              </NativeSelect.Field>
              <NativeSelect.Indicator />
            </NativeSelect.Root>
            <NativeSelect.Root w={{ base: 'full', md: '160px' }}>
              <NativeSelect.Field
                aria-label="Result"
                name="success"
                value={filters.success || ''}
                onChange={(event) => go({ success: event.target.value, aPage: 1 })}
                bg={fieldBg}
                borderRadius="full"
                px="4"
              >
                <option value="">All results</option>
                <option value="success">Success</option>
                <option value="failed">Failed</option>
                <option value="unknown">Unknown</option>
              </NativeSelect.Field>
              <NativeSelect.Indicator />
            </NativeSelect.Root>
            <Flex
              as="label"
              align="center"
              gap="2"
              px="3"
              minH="10"
              fontSize="sm"
              color={mutedColor}
            >
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

          <Table.ScrollArea
            border="none"
            borderRadius="10px"
            opacity={pending ? 0.55 : 1}
            transition="opacity 0.15s"
          >
            <Table.Root color={{ base: 'black', _dark: 'white' }} size="sm">
              <Table.Header>
                <Table.Row {...tableHeaderProps}>
                  <Table.ColumnHeader>Block / time</Table.ColumnHeader>
                  <Table.ColumnHeader>Wallet</Table.ColumnHeader>
                  <Table.ColumnHeader>Message</Table.ColumnHeader>
                  <Table.ColumnHeader>Direction</Table.ColumnHeader>
                  <Table.ColumnHeader>Counterparties</Table.ColumnHeader>
                  <Table.ColumnHeader>Result</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {activity.rows.length ? (
                  activity.rows.map((row) => (
                    <Table.Row
                      key={`${row.height}:${row.txHash}:${row.msgIndex}:${row.address}`}
                      bg={rowBg}
                    >
                      <Table.Cell {...tableCellProps}>
                        <Link asChild colorPalette="blue">
                          <NextLink href={`/transactions/${row.txHash}`}>
                            {row.height.toLocaleString()}
                          </NextLink>
                        </Link>
                        <Text fontSize="xs" color={mutedColor}>
                          {row.blockTime
                            ? new Date(row.blockTime).toLocaleString()
                            : '—'}
                        </Text>
                        <Text
                          fontSize="xs"
                          fontFamily="mono"
                          color={mutedColor}
                          title={row.txHash}
                        >
                          {short(row.txHash, 6)}
                        </Text>
                      </Table.Cell>
                      <Table.Cell {...tableCellProps} fontFamily="mono">
                        <Link asChild colorPalette="blue">
                          <NextLink href={`/accounts/${row.address}`}>
                            {short(row.address)}
                          </NextLink>
                        </Link>
                      </Table.Cell>
                      <Table.Cell {...tableCellProps}>
                        {messageLabel(row.type)}
                      </Table.Cell>
                      <Table.Cell {...tableCellProps} textTransform="capitalize">
                        {row.direction}
                      </Table.Cell>
                      <Table.Cell {...tableCellProps}>
                        {row.counterparties.length ? (
                          row.counterparties.map((address) => (
                            <Text key={address} fontFamily="mono">
                              <Link asChild colorPalette="blue">
                                <NextLink href={`/accounts/${address}`}>
                                  {short(address)}
                                </NextLink>
                              </Link>
                            </Text>
                          ))
                        ) : (
                          <Text color={mutedColor}>—</Text>
                        )}
                      </Table.Cell>
                      <Table.Cell {...tableCellProps}>
                        <Status
                          value={
                            row.success === true
                              ? 'success'
                              : row.success === false
                                ? 'error'
                                : 'info'
                          }
                        >
                          {row.success === true
                            ? 'Success'
                            : row.success === false
                              ? 'Failed'
                              : 'Unknown'}
                        </Status>
                      </Table.Cell>
                    </Table.Row>
                  ))
                ) : (
                  <EmptyRow columns={6} />
                )}
              </Table.Body>
            </Table.Root>
          </Table.ScrollArea>
          <PageBar
            total={activity.total}
            pageSize={activity.pageSize}
            page={activity.page}
            onPage={(next) => go({ aPage: next })}
          />
        </Section>
      </Box>

      <Text mt="6" fontSize="sm" color={mutedColor}>
        Snapshot{' '}
        {summary.snapshotAt
          ? new Date(summary.snapshotAt).toLocaleString()
          : 'not yet captured'}{' '}
        at block {summary.snapshotHead?.toLocaleString() ?? '—'}. “Suspected
        sink” is a behavioral label, not an ownership attribution.
      </Text>
    </Box>
  );
}
