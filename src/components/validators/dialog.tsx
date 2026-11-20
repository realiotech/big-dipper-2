import {
  Box,
  Button,
  Flex,
  Input,
  Link as ChakraLink,
  Skeleton,
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/react";
import Big from "big.js";
import NextLink from "next/link";
import { ReactNode, useEffect, useState } from "react";
import { LuChevronDown, LuCircleCheck, LuWallet } from "react-icons/lu";
import { useRecoilValue } from "recoil";
import { realioNetworkToEth } from "@realiotech/address-generator";
import { useErc20SpendableBalance } from "@/components/accounts/hooks";
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { chainConfig } from "@/configs";
import { atomState } from "@/recoil/wallet/atom";
import { useKeplrConnect } from "@/recoil/wallet/hooks";
import { createDelegateEVMTx } from "@/utils/delegate_evm_transaction";
import { createDelegateTx } from "@/utils/delegate_transaction";
import { getMiddleEllipsis } from "@/utils/get_middle_ellipsis";
import { TRANSACTION_DETAILS } from "@/utils/go_to_page";
import { shortUnits } from "../explorer/format";

// Fee and gas the transaction builders are given; the fee is in base units
// of the staked denom (ario for ERC-20 delegations).
const DEFAULT_FEE = "2000";
const DEFAULT_GAS = { native: "300000", erc20: "3000000" };
const DEFAULT_MEMO = "realio.network";

const AMOUNT_PATTERN = /^\d*\.?\d*$/;

const fieldStyles = {
  h: "40px",
  bg: "explorer.page",
  borderColor: "explorer.border",
  borderRadius: "6px",
  color: "explorer.text",
  fontSize: "sm",
  _placeholder: { color: "explorer.muted" },
  _focusVisible: { borderColor: "explorer.accent", outline: "none" },
} as const;

const FieldLabel = ({ children, end }: { children: ReactNode; end?: ReactNode }) => (
  <Flex justify="space-between" align="center" mb="1.5" gap="2">
    <Text fontSize="xs" color="explorer.muted" textTransform="uppercase" letterSpacing="0.04em">
      {children}
    </Text>
    {end}
  </Flex>
);

const SummaryRow = ({ label, children }: { label: string; children: ReactNode }) => (
  <Flex justify="space-between" align="center" gap="3" fontSize="sm">
    <Text color="explorer.muted" flexShrink={0}>
      {label}
    </Text>
    <Box minW="0" textAlign="right" color="explorer.text">
      {children}
    </Box>
  </Flex>
);

const primaryButton = {
  w: "full",
  h: "40px",
  bg: "explorer.button",
  color: "explorer.buttonText",
  borderRadius: "6px",
  fontWeight: "500",
  _hover: { opacity: 0.85 },
  _disabled: { opacity: 0.4, cursor: "not-allowed" },
} as const;

/** Base units -> display amount, rounded down so "Max" never exceeds the balance. */
const toDisplay = (raw: string, decimals: number) =>
  Big(raw || "0").div(Big(10).pow(decimals)).round(6, Big.roundDown);

const isPositiveAmount = (amount: string) => {
  if (!amount || !AMOUNT_PATTERN.test(amount) || amount === ".") return false;
  return Big(amount).gt(0);
};

export const DelegateDialog = ({
  denom,
  denomSymbol,
  decimal,
  operatorName,
  operatorAddress,
}: {
  denom: string;
  denomSymbol: string;
  decimal: number;
  operatorName: string;
  operatorAddress: string;
}) => {
  const wallet = useRecoilValue(atomState);
  const { triggerWalletConnectPopover, reloadBalances } = useKeplrConnect();

  const isERC20 = denom?.startsWith("erc20:");
  const contractAddress = isERC20 ? denom.replace("erc20:", "") : null;
  const decimals = decimal || 18;
  const evmAddress = wallet.walletAddress ? realioNetworkToEth(wallet.walletAddress) : undefined;
  const { balance: erc20Balance, loading: erc20Loading } = useErc20SpendableBalance(
    isERC20 ? evmAddress : undefined,
    isERC20 ? contractAddress : undefined
  );

  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [gas, setGas] = useState(isERC20 ? DEFAULT_GAS.erc20 : DEFAULT_GAS.native);
  const [memo, setMemo] = useState(DEFAULT_MEMO);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  useEffect(() => {
    setGas(isERC20 ? DEFAULT_GAS.erc20 : DEFAULT_GAS.native);
  }, [isERC20]);

  // Start clean each time the dialog opens.
  useEffect(() => {
    if (!open) return;
    setAmount("");
    setError(null);
    setTxHash(null);
    setShowAdvanced(false);
  }, [open]);

  const feeDenom = isERC20 ? "ario" : denom;
  const feeSymbol = isERC20 ? "RIO" : denomSymbol;
  const rawAvailable = isERC20 ? erc20Balance : wallet.balances?.[denom];
  const availableLoading = isERC20 ? erc20Loading : !wallet.balances && !wallet.balancesError;
  const available = rawAvailable != null ? toDisplay(rawAvailable, decimals) : null;
  // A native delegation pays its fee in the same denom, so leave room for it.
  const maxAmount = (() => {
    if (!available) return null;
    if (isERC20) return available;
    const max = Big(rawAvailable).minus(DEFAULT_FEE);
    return max.gt(0) ? toDisplay(max.toFixed(0), decimals) : Big(0);
  })();

  let amountError: string | null = null;
  if (amount && !AMOUNT_PATTERN.test(amount)) amountError = "Enter a number.";
  else if (amount && maxAmount && isPositiveAmount(amount) && Big(amount).gt(maxAmount)) {
    amountError = "Amount is more than your available balance.";
  }
  const canSubmit = isPositiveAmount(amount) && !amountError && !loading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !wallet.walletAddress) return;
    setError(null);
    setLoading(true);
    try {
      const params = {
        sender: wallet.walletAddress,
        validator: operatorAddress,
        amount,
        fees: DEFAULT_FEE,
        gas,
        memo,
        accounts: wallet.accounts,
        offlineSigner: wallet.offlineSigner,
        signer: wallet.signer,
        decimal: decimals,
        chainId: chainConfig.network,
        rpcEndpoint: process.env.NEXT_PUBLIC_RPC_URL,
        apiEndpoint: process.env.NEXT_PUBLIC_API_URL,
      };
      if (!wallet.signer) throw new Error("The wallet is still connecting to the network. Try again in a moment.");
      const result = isERC20
        ? await createDelegateEVMTx({ ...params, contractAddress })
        : await createDelegateTx({ ...params, denom });
      setTxHash(result.transactionHash);
      reloadBalances();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(/reject|denied/i.test(message) ? "The transaction was rejected in Keplr." : message);
    } finally {
      setLoading(false);
    }
  };

  const actionLabel = isERC20 ? `Delegate ${denomSymbol}` : "Delegate";

  let body: ReactNode;
  if (!wallet.walletAddress) {
    body = (
      <Stack align="center" textAlign="center" gap="3" py="4">
        <Flex boxSize="44px" align="center" justify="center" borderRadius="full" bg="explorer.inset" color="explorer.text" fontSize="lg">
          <LuWallet />
        </Flex>
        <Box>
          <Text fontSize="sm" fontWeight="500" color="explorer.text">
            Connect a wallet to delegate
          </Text>
          <Text fontSize="sm" color="explorer.muted" mt="1">
            Your {denomSymbol} stays in your wallet until you sign the delegation.
          </Text>
        </Box>
        {/* Closes this dialog and opens the header's wallet popover. */}
        <Button {...primaryButton} mt="2" onClick={() => { setOpen(false); triggerWalletConnectPopover(); }}>
          <LuWallet />
          Connect Wallet
        </Button>
      </Stack>
    );
  } else if (txHash) {
    body = (
      <Stack align="center" textAlign="center" gap="3" py="4">
        <Box color="explorer.successMuted" fontSize="40px">
          <LuCircleCheck />
        </Box>
        <Box>
          <Text fontSize="md" fontWeight="600" color="explorer.text">
            Delegation submitted
          </Text>
          <Text fontSize="sm" color="explorer.muted" mt="1">
            {amount} {denomSymbol} delegated to {operatorName}.
          </Text>
        </Box>
        <ChakraLink asChild fontSize="sm" color="explorer.link" fontFamily="mono">
          <NextLink href={TRANSACTION_DETAILS(txHash)}>{getMiddleEllipsis(txHash, { beginning: 10, ending: 8 })}</NextLink>
        </ChakraLink>
        <Button {...primaryButton} mt="2" onClick={() => setOpen(false)}>
          Done
        </Button>
      </Stack>
    );
  } else {
    body = (
      <form onSubmit={handleSubmit}>
        <Stack gap="4">
          <Stack gap="2.5" p="3" bg="explorer.inset" borderRadius="6px">
            <SummaryRow label="From">
              <Text fontFamily="mono" truncate title={wallet.walletAddress}>
                {getMiddleEllipsis(wallet.walletAddress, { beginning: 10, ending: 6 })}
              </Text>
            </SummaryRow>
            <SummaryRow label="Validator">
              <Text truncate title={operatorAddress}>
                {operatorName}
              </Text>
            </SummaryRow>
          </Stack>

          <Box>
            <FieldLabel
              end={
                <Text fontSize="xs" color="explorer.muted">
                  Available:{" "}
                  {availableLoading ? (
                    <Skeleton as="span" display="inline-block" h="12px" w="56px" verticalAlign="middle" />
                  ) : (
                    <Text as="span" color="explorer.text">
                      {available ? shortUnits(rawAvailable, decimals, 6) : "—"}
                    </Text>
                  )}{" "}
                  {denomSymbol}
                </Text>
              }
            >
              Amount
            </FieldLabel>
            <Flex
              align="center"
              borderWidth="1px"
              borderColor={amountError ? "explorer.critical" : "explorer.border"}
              borderRadius="6px"
              bg="explorer.page"
              pr="2"
              _focusWithin={{ borderColor: amountError ? "explorer.critical" : "explorer.accent" }}
            >
              <Input
                {...fieldStyles}
                border="none"
                bg="transparent"
                flex="1"
                fontSize="md"
                fontVariantNumeric="tabular-nums"
                inputMode="decimal"
                autoComplete="off"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(",", "."))}
                _focusVisible={{ outline: "none" }}
                aria-invalid={Boolean(amountError)}
              />
              <Button
                variant="outline"
                size="xs"
                h="24px"
                px="2"
                borderColor="explorer.border"
                color="explorer.muted"
                fontSize="xs"
                _hover={{ color: "explorer.text", bg: "explorer.inset" }}
                disabled={!maxAmount || maxAmount.lte(0)}
                onClick={() => maxAmount && setAmount(maxAmount.toFixed())}
              >
                Max
              </Button>
              <Text ml="2.5" fontSize="sm" fontWeight="500" color="explorer.text">
                {denomSymbol}
              </Text>
            </Flex>
            {amountError && (
              <Text mt="1.5" fontSize="xs" color="explorer.critical">
                {amountError}
              </Text>
            )}
          </Box>

          <Stack gap="2" pt="3" borderTopWidth="1px" borderColor="explorer.border">
            <SummaryRow label="Network fee">
              {shortUnits(DEFAULT_FEE, 18, 6)} {feeSymbol}
            </SummaryRow>
            <Flex justify="space-between" align="center">
              <Button
                variant="plain"
                size="xs"
                h="auto"
                p="0"
                color="explorer.muted"
                fontWeight="400"
                fontSize="sm"
                _hover={{ color: "explorer.text" }}
                onClick={() => setShowAdvanced((value) => !value)}
                aria-expanded={showAdvanced}
              >
                Advanced
                <Box as="span" transform={showAdvanced ? "rotate(180deg)" : undefined} transition="transform 0.15s">
                  <LuChevronDown />
                </Box>
              </Button>
              {!showAdvanced && (
                <Text fontSize="xs" color="explorer.muted">
                  Gas {Number(gas || 0).toLocaleString("en-US")}
                </Text>
              )}
            </Flex>
            {showAdvanced && (
              <Stack gap="3" pt="1">
                <Box>
                  <FieldLabel>Gas limit</FieldLabel>
                  <Input {...fieldStyles} inputMode="numeric" value={gas} onChange={(e) => setGas(e.target.value.replace(/\D/g, ""))} />
                </Box>
                <Box>
                  <FieldLabel>Memo</FieldLabel>
                  <Input {...fieldStyles} value={memo} placeholder="Optional" onChange={(e) => setMemo(e.target.value)} />
                </Box>
              </Stack>
            )}
          </Stack>

          {error && (
            <Text px="3" py="2" fontSize="xs" color="explorer.critical" bg="explorer.inset" borderRadius="6px" wordBreak="break-word">
              {error}
            </Text>
          )}

          <Button {...primaryButton} type="submit" disabled={!canSubmit}>
            {loading ? (
              <>
                <Spinner size="sm" />
                Confirm in Keplr…
              </>
            ) : (
              actionLabel
            )}
          </Button>
        </Stack>
      </form>
    );
  }

  return (
    <DialogRoot open={open} onOpenChange={(e) => setOpen(e.open)} size="sm" placement="center" motionPreset="slide-in-bottom">
      <DialogTrigger asChild>
        <Button bg="explorer.button" color="explorer.buttonText" size="xs" h="28px" px="3" borderRadius="full" _hover={{ opacity: 0.85 }}>
          {actionLabel}
        </Button>
      </DialogTrigger>
      <DialogContent
        bg="explorer.card"
        color="explorer.text"
        borderWidth="1px"
        borderColor="explorer.border"
        borderRadius="8px"
        boxShadow="lg"
        mx="4"
      >
        <DialogCloseTrigger top="3" insetEnd="3" color="explorer.muted" />
        <Box px="5" pt="5" pr="12">
          <DialogTitle fontSize="md" fontWeight="600" color="explorer.text">
            {actionLabel}
          </DialogTitle>
          <Text fontSize="sm" color="explorer.muted" mt="1">
            Stake {denomSymbol} with {operatorName}.
          </Text>
        </Box>
        <DialogBody px="5" pt="4" pb="5">
          {body}
        </DialogBody>
      </DialogContent>
    </DialogRoot>
  );
};
