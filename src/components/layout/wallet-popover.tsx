import {
  Box,
  Button,
  Flex,
  Image,
  Skeleton,
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { ReactNode, useState } from "react";
import { LuChevronRight, LuExternalLink, LuWallet } from "react-icons/lu";
import { useRecoilValue } from "recoil";
import { chainConfig } from "@/configs";
import { atomState } from "@/recoil/wallet/atom";
import { WALLET_DENOMS, useKeplrConnect, walletErrorMessage } from "@/recoil/wallet/hooks";
import { getMiddleEllipsis } from "@/utils/get_middle_ellipsis";
import { ACCOUNT_DETAILS } from "@/utils/go_to_page";
import { CopyButton } from "../explorer/copy_button";
import { shortUnits } from "../explorer/format";
import {
  PopoverBody,
  PopoverCloseTrigger,
  PopoverContent,
  PopoverRoot,
  PopoverTrigger,
} from "../ui/popover";

const KEPLR_INSTALL_URL = "https://www.keplr.app/get";

/** Keplr's app symbol, from its brand assets (keplr.app/brand). */
const KeplrLogo = () => <Image src="/images/wallets/keplr.svg" alt="" boxSize="32px" flexShrink={0} />;

const WalletRow = ({
  mark,
  name,
  hint,
  end,
  disabled,
  onClick,
}: {
  mark: ReactNode;
  name: string;
  hint?: ReactNode;
  end: ReactNode;
  disabled?: boolean;
  onClick?: () => void;
}) => (
  <Flex
    as="button"
    w="full"
    align="center"
    gap="3"
    px="3"
    py="2.5"
    borderWidth="1px"
    borderColor="explorer.border"
    borderRadius="6px"
    textAlign="left"
    cursor={disabled ? "not-allowed" : "pointer"}
    opacity={disabled ? 0.55 : 1}
    transition="background 0.15s, border-color 0.15s"
    _hover={disabled ? undefined : { bg: "explorer.inset", borderColor: "explorer.muted" }}
    focusVisibleRing="outside"
    onClick={disabled ? undefined : onClick}
    aria-disabled={disabled}
  >
    {mark}
    <Box flex="1" minW="0">
      <Text fontSize="sm" fontWeight="500" color="explorer.text">
        {name}
      </Text>
      {hint && (
        <Text fontSize="xs" color="explorer.muted" truncate>
          {hint}
        </Text>
      )}
    </Box>
    {end}
  </Flex>
);

const ConnectView = () => {
  const { connectKeplr } = useKeplrConnect();
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasKeplr = typeof window !== "undefined" && Boolean(window.keplr);

  const connect = async () => {
    if (!hasKeplr) {
      window.open(KEPLR_INSTALL_URL, "_blank", "noopener,noreferrer");
      return;
    }
    setError(null);
    setConnecting(true);
    try {
      await connectKeplr();
    } catch (err) {
      console.warn("Failed to connect to Keplr:", err);
      setError(walletErrorMessage(err));
    } finally {
      setConnecting(false);
    }
  };

  let keplrHint = "Browser extension";
  let keplrEnd: ReactNode = <LuChevronRight />;
  if (!hasKeplr) {
    keplrHint = "Not installed. Get the extension";
    keplrEnd = <LuExternalLink />;
  } else if (connecting) {
    keplrHint = "Approve the request in Keplr…";
    keplrEnd = <Spinner size="sm" color="explorer.muted" />;
  }

  return (
    <>
      <Box pr="8" mb="4">
        <Text fontSize="md" fontWeight="600" color="explorer.text">
          Connect a wallet
        </Text>
        <Text fontSize="sm" color="explorer.muted" mt="1">
          Connect to stake and see your balances on Realio Network.
        </Text>
      </Box>

      <WalletRow
        mark={<KeplrLogo />}
        name="Keplr"
        hint={keplrHint}
        end={<Box color="explorer.muted">{keplrEnd}</Box>}
        disabled={connecting}
        onClick={connect}
      />

      {error && (
        <Text mt="3" px="3" py="2" fontSize="xs" color="explorer.critical" bg="explorer.inset" borderRadius="6px">
          {error}
        </Text>
      )}

      <Flex mt="4" pt="3" borderTopWidth="1px" borderColor="explorer.border" justify="space-between" fontSize="xs" color="explorer.muted">
        <Text>Network</Text>
        <Text fontFamily="mono">{chainConfig.network}</Text>
      </Flex>
    </>
  );
};

const ConnectedView = ({ address }: { address: string }) => {
  const wallet = useRecoilValue(atomState);
  const { disconnectKeplr, reloadBalances, setWalletConnectPopover } = useKeplrConnect();
  const tokenUnits = chainConfig.tokenUnits as Record<string, { display: string; exponent: number }>;

  let balances: ReactNode;
  if (wallet.balances) {
    balances = WALLET_DENOMS.map((denom) => (
      <Flex key={denom} justify="space-between" fontSize="sm">
        <Text color="explorer.muted">{(tokenUnits[denom]?.display ?? denom).toUpperCase()}</Text>
        <Text color="explorer.text" fontVariantNumeric="tabular-nums">
          {shortUnits(wallet.balances?.[denom] ?? "0", tokenUnits[denom]?.exponent ?? 18, 4)}
        </Text>
      </Flex>
    ));
  } else if (wallet.balancesError) {
    balances = (
      <Flex justify="space-between" align="center" fontSize="sm" color="explorer.muted">
        <Text>Couldn&apos;t load balances.</Text>
        <Button variant="plain" size="xs" h="auto" p="0" color="explorer.link" onClick={reloadBalances}>
          Retry
        </Button>
      </Flex>
    );
  } else {
    balances = WALLET_DENOMS.map((denom) => <Skeleton key={denom} h="20px" borderRadius="4px" />);
  }

  return (
    <>
      <Flex align="center" gap="3" pr="8" mb="4">
        <KeplrLogo />
        <Box minW="0">
          <Text fontSize="md" fontWeight="600" color="explorer.text">
            {wallet.walletSelection || "Wallet"}
          </Text>
          <Flex align="center" gap="1.5" fontSize="xs" color="explorer.successMuted">
            <Box boxSize="6px" borderRadius="full" bg="currentColor" />
            Connected
          </Flex>
        </Box>
      </Flex>

      <Flex align="center" gap="2" px="3" py="2" bg="explorer.inset" borderRadius="6px">
        <Text flex="1" minW="0" fontSize="sm" fontFamily="mono" color="explorer.text" truncate title={address}>
          {getMiddleEllipsis(address, { beginning: 12, ending: 8 })}
        </Text>
        <CopyButton value={address} label="Copy address" />
      </Flex>

      <Text mt="4" mb="2" fontSize="xs" color="explorer.muted" textTransform="uppercase" letterSpacing="0.04em">
        Balances
      </Text>
      <Stack gap="2">{balances}</Stack>

      <Flex mt="5" gap="2">
        <Button
          asChild
          flex="1"
          size="sm"
          bg="explorer.button"
          color="explorer.buttonText"
          _hover={{ opacity: 0.85, textDecoration: "none" }}
          onClick={() => setWalletConnectPopover(false)}
        >
          <NextLink href={ACCOUNT_DETAILS(address)}>View account</NextLink>
        </Button>
        <Button
          flex="1"
          size="sm"
          variant="outline"
          borderColor="explorer.border"
          color="explorer.text"
          _hover={{ bg: "explorer.inset" }}
          onClick={disconnectKeplr}
        >
          Disconnect
        </Button>
      </Flex>
    </>
  );
};

/**
 * The header's wallet button and popover. There must be only one on the page:
 * every instance follows the same `openWalletConnectPopover` flag, so a second
 * one (eg. in the mobile menu) would open alongside it. Below `sm` the button
 * shrinks to an icon.
 */
const WalletPopover = () => {
  const wallet = useRecoilValue(atomState);
  const { setWalletConnectPopover } = useKeplrConnect();
  const address = wallet.walletAddress;

  return (
    <PopoverRoot
      open={wallet.openWalletConnectPopover}
      onOpenChange={(e) => setWalletConnectPopover(e.open)}
      positioning={{ placement: "bottom-end", gutter: 12 }}
      lazyMount
      unmountOnExit
    >
      <PopoverTrigger asChild>
        {address ? (
          <Button
            aria-label="Wallet"
            size="sm"
            h="32px"
            minW="32px"
            px={{ base: "2", sm: "3" }}
            borderRadius="full"
            variant="outline"
            borderColor="explorer.border"
            color="explorer.text"
            fontWeight="500"
            fontFamily="mono"
            _hover={{ bg: "explorer.inset" }}
            _expanded={{ bg: "explorer.inset" }}
          >
            <Box boxSize="6px" borderRadius="full" bg="explorer.successMuted" />
            <Box as="span" hideFrom="sm">
              <LuWallet />
            </Box>
            <Box as="span" hideBelow="sm">
              {getMiddleEllipsis(address, { beginning: 8, ending: 4 })}
            </Box>
          </Button>
        ) : (
          <Button
            aria-label="Connect Wallet"
            size="sm"
            h="32px"
            minW="32px"
            px={{ base: "0", sm: "3.5" }}
            borderRadius="full"
            bg="explorer.button"
            color="explorer.buttonText"
            fontWeight="500"
            _hover={{ opacity: 0.85 }}
          >
            <LuWallet />
            <Box as="span" hideBelow="sm">
              Connect Wallet
            </Box>
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent
        w={{ base: "calc(100vw - 32px)", sm: "360px" }}
        bg="explorer.card"
        borderWidth="1px"
        borderColor="explorer.border"
        borderRadius="8px"
        boxShadow="lg"
        color="explorer.text"
      >
        <PopoverCloseTrigger top="3" insetEnd="3" color="explorer.muted" />
        <PopoverBody p="5">{address ? <ConnectedView address={address} /> : <ConnectView />}</PopoverBody>
      </PopoverContent>
    </PopoverRoot>
  );
};

export default WalletPopover;
