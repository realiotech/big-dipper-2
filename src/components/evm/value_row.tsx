import React, { useState } from "react";
import { Button, Flex, Stack, Text } from "@chakra-ui/react";
import { useRecoilValue } from "recoil";
import { LuArrowRight } from "react-icons/lu";
import { chainConfig } from "@/configs";
import { readAsset } from "@/recoil/asset";
import type { Coin, CosmosActivity } from "@/utils/cosmos_activity";
import { valueLines, ValueLine, ValueTag } from "@/utils/evm_value";
import { Tag } from "@/components/explorer/badges";
import { BlockscoutAddress, formatUnits, useBlockscout } from "@/components/explorer/blockscout";
import { EvmAddress } from "@/components/explorer/evm_address";
import { formatUtc } from "@/components/explorer/format";
import { ValidatorName } from "@/components/explorer/validator_name";
import { TokenTransfer, transferAmount, transferKind } from "./columns";

const TAG_COLOR: Record<ValueTag, string> = {
  Transfer: "explorer.link",
  Payment: "explorer.link",
  "Claim reward": "explorer.successMuted",
  "Claim commission": "explorer.successMuted",
  "Auto-claimed": "explorer.muted",
  Delegate: "explorer.successMuted",
  Undelegate: "explorer.successMuted",
  Redelegate: "explorer.successMuted",
  Minted: "explorer.successMuted",
  Burnt: "explorer.evm",
  Approval: "explorer.warning",
};

// 2^256 - 1: approve(spender, max) grants an unlimited allowance.
const MAX_UINT256 = "115792089237316195423570985008687907853269984665640564039457584007913129639935";
const SHOWN_LINES = 4;

const Muted = ({ children }: { children: React.ReactNode }) => (
  <Text as="span" color="explorer.muted">
    {children}
  </Text>
);

const Amount = ({ value, symbol }: { value: string; symbol?: string | null }) => (
  <Text as="span">
    {value} {symbol && <Muted>{symbol}</Muted>}
  </Text>
);

/** Exact amount and symbol of a Cosmos coin; unknown denoms show raw. */
const CoinAmount = ({ coin }: { coin: Coin }) => {
  const asset = useRecoilValue(readAsset(coin.denom));
  const unit = chainConfig.tokenUnits?.[coin.denom];
  return (
    <Amount
      value={formatUnits(coin.amount, asset?.decimals ?? unit?.exponent ?? 0)}
      symbol={asset?.symbol ?? unit?.display?.toUpperCase() ?? coin.denom}
    />
  );
};

const Coins = ({ coins }: { coins: Coin[] }) => (
  <>
    {coins.map((coin) => (
      <CoinAmount key={coin.denom} coin={coin} />
    ))}
  </>
);

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? "" : "s"}`;

const CosmosLine = ({ tag, activity }: { tag: ValueTag; activity: CosmosActivity }) => {
  const label = <Tag color={TAG_COLOR[tag]}>{tag}</Tag>;
  switch (activity.kind) {
    case "rewards":
    case "commission":
      return (
        <>
          <Coins coins={activity.coins} />
          {label}
          <Muted>
            from {plural(activity.validators.length, "validator")}
            {tag === "Auto-claimed" && " · paid out automatically when a delegation changes"}
          </Muted>
        </>
      );
    case "delegate":
      return (
        <>
          {activity.coins.length > 0 && <Coins coins={activity.coins} />}
          {label}
          <LuArrowRight />
          <ValidatorName address={activity.validator} />
        </>
      );
    case "undelegate":
      return (
        <>
          {label}
          <Muted>from</Muted>
          <ValidatorName address={activity.validator} />
          {activity.completion && <Muted>· unlocks {formatUtc(activity.completion)}</Muted>}
        </>
      );
    default:
      return (
        <>
          {label}
          <ValidatorName address={activity.from} />
          <LuArrowRight />
          <ValidatorName address={activity.to} />
          {activity.completion && <Muted>· completes {formatUtc(activity.completion)}</Muted>}
        </>
      );
  }
};

const TokenLine = ({ tag, transfer }: { tag: ValueTag; transfer: TokenTransfer }) => (
  <>
    <Amount value={transferAmount(transfer)} symbol={transfer.token?.symbol ?? transfer.token?.name} />
    <Tag color={TAG_COLOR[tag]}>{tag}</Tag>
    {tag !== "Minted" && (
      <>
        <Muted>from</Muted>
        <EvmAddress address={transfer.from} short />
      </>
    )}
    {tag !== "Burnt" && (
      <>
        <LuArrowRight />
        <EvmAddress address={transfer.to} short />
      </>
    )}
  </>
);

type TokenInfo = { token?: { symbol?: string | null; decimals?: string | null; type?: string | null } | null };

const ApprovalLine = ({ token, spender, amount }: { token?: BlockscoutAddress | null; spender: string; amount: string }) => {
  // ERC-20 allowances are in the token's units (decimals from Blockscout);
  // for NFTs (ERC-721) the second argument is the approved token's id.
  const { data } = useBlockscout<TokenInfo>(token?.hash ? `addresses/${token.hash}` : null);
  const decimals = data?.token?.decimals;
  const nft = /^ERC-(721|1155)$/.test(data?.token?.type ?? "");
  let value = amount;
  if (nft) value = `#${amount}`;
  else if (amount === MAX_UINT256) value = "Unlimited";
  else if (decimals) value = formatUnits(amount, Number(decimals));
  return (
    <>
      <Amount value={value} symbol={data?.token?.symbol ?? token?.name} />
      <Tag color={TAG_COLOR.Approval}>Approval</Tag>
      <Muted>for</Muted>
      <EvmAddress address={{ hash: spender }} short />
    </>
  );
};

/**
 * The "Value" row of an EVM transaction: the native RIO sent, then every
 * other movement with a tag. A 0 native value is only shown when nothing
 * else moved.
 */
export const ValueRow = ({
  value,
  input,
  to,
  activity,
  transfers,
  transfersOverflow,
  onViewTransfers,
}: {
  value?: string | null;
  input?: string | null;
  to?: BlockscoutAddress | null;
  activity: CosmosActivity[];
  transfers: TokenTransfer[];
  transfersOverflow?: boolean;
  onViewTransfers: () => void;
}) => {
  const [expanded, setExpanded] = useState(false);
  const summaries = transfers.map((t) => ({ kind: transferKind(t).label as "Mint" | "Burn" | "Transfer", amount: t.total?.value }));
  const lines = valueLines({ value, input, activity, transfers: summaries });

  if (!lines.length) return <Amount value="0" symbol="RIO" />;

  const shown = expanded ? lines : lines.slice(0, SHOWN_LINES);
  const render = (line: ValueLine) => {
    if (line.type === "native") {
      return (
        <>
          <Amount value={formatUnits(line.wei)} symbol="RIO" />
          <Tag color={TAG_COLOR[line.tag]}>{line.tag}</Tag>
          <LuArrowRight />
          <EvmAddress address={to} short />
        </>
      );
    }
    if (line.type === "cosmos") return <CosmosLine tag={line.tag} activity={line.activity} />;
    if (line.type === "token") return <TokenLine tag={line.tag} transfer={transfers[line.index]} />;
    return <ApprovalLine token={to} spender={line.spender} amount={line.amount} />;
  };

  return (
    <Stack gap="2">
      {shown.map((line, index) => (
        <Flex key={index} align="center" gap="2" wrap="wrap">
          {render(line)}
        </Flex>
      ))}
      {lines.length > SHOWN_LINES && (
        <Button variant="plain" size="xs" h="auto" p="0" alignSelf="flex-start" color="explorer.link" fontWeight="400" onClick={() => setExpanded(!expanded)}>
          {expanded ? "Show less" : `Show ${lines.length - SHOWN_LINES} more`}
        </Button>
      )}
      {transfersOverflow && (
        <Button variant="plain" size="xs" h="auto" p="0" alignSelf="flex-start" color="explorer.link" fontWeight="400" onClick={onViewTransfers}>
          View all token transfers
        </Button>
      )}
    </Stack>
  );
};
