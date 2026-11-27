import { useRecoilState } from "recoil";
import { atomState } from "@/recoil/wallet/atom";
import { SigningStargateClient, StargateClient } from "@cosmjs/stargate";
import { chainConfig } from "@/configs";
import type { Keplr } from "@keplr-wallet/types";

declare global {
  interface Window {
    keplr?: Keplr;
  }
}

export const WALLET_DENOMS = ["ario", "arst", "almx"];

const rpcUrl = () => process.env.NEXT_PUBLIC_RPC_URL ?? "";

// Keplr's chain entry for this network (mainnet or testnet, from the build's config).
const chainInfo = () => ({
  chainId: chainConfig.network,
  chainName: "Realio Network",
  rpc: rpcUrl(),
  rest: process.env.NEXT_PUBLIC_API_URL,
  stakeCurrency: {
    coinDenom: "RIO",
    coinMinimalDenom: "ario",
    coinDecimals: 18,
    coinGeckoId: "rio",
  },
  bip44: {
    coinType: 60,
  },
  bech32Config: {
    bech32PrefixAccAddr: "realio",
    bech32PrefixAccPub: "realiopub",
    bech32PrefixValAddr: "realiovaloper",
    bech32PrefixValPub: "realiovaloperpub",
    bech32PrefixConsAddr: "realiovalcons",
    bech32PrefixConsPub: "realiovalconspub",
  },
  currencies: [
    {
      coinDenom: "RIO",
      coinMinimalDenom: "ario",
      coinDecimals: 18,
      coinGeckoId: "rio",
    },
  ],
  feeCurrencies: [
    {
      coinDenom: "RIO",
      coinMinimalDenom: "ario",
      coinDecimals: 18,
      coinGeckoId: "rio",
    },
  ],
  gasPriceStep: {
    low: 0.0001,
    average: 0.00125,
    high: 0.02,
  },
  features: ["stargate", "ibc-transfer"],
});

const fetchBalances = async (address: string) => {
  const client = await StargateClient.connect(rpcUrl());
  const balances: Record<string, string> = {};
  for (const denom of WALLET_DENOMS) {
    // eslint-disable-next-line no-await-in-loop
    balances[denom] = (await client.getBalance(address, denom)).amount;
  }
  return balances;
};

/** A Keplr error as a sentence for the connect popover. */
export const walletErrorMessage = (err: unknown): string => {
  const message = err instanceof Error ? err.message : String(err);
  if (/reject|denied|cancel/i.test(message)) return "The request was rejected in Keplr.";
  if (/not installed/i.test(message)) return "Keplr is not installed in this browser.";
  return message || "Could not connect to Keplr.";
};

export const useKeplrConnect = () => {
  const [wallet, setWallet] = useRecoilState(atomState);

  const loadBalances = async (address: string) => {
    setWallet((prev) => ({ ...prev, balancesError: false }));
    try {
      const balances = await fetchBalances(address);
      setWallet((prev) => (prev.walletAddress === address ? { ...prev, balances } : prev));
    } catch (err) {
      console.warn("Failed to load wallet balances:", err);
      setWallet((prev) => (prev.walletAddress === address ? { ...prev, balancesError: true } : prev));
    }
  };

  /**
   * Connects Keplr and throws when that fails, so the caller can show why.
   * The address is shown as soon as Keplr hands it over; the signing client
   * and balances need the RPC and load after it, without blocking the connect.
   */
  const connectKeplr = async () => {
    if (!window.keplr) throw new Error("Keplr is not installed");

    const info = chainInfo();
    await window.keplr.experimentalSuggestChain(info);
    await window.keplr.enable(info.chainId);
    const offlineSigner = await window.keplr.getOfflineSignerAuto(info.chainId);
    const accounts = await offlineSigner.getAccounts();
    const address = accounts[0]?.address;
    if (!address) throw new Error("Keplr returned no account");

    setWallet((prev) => ({
      ...prev,
      walletAddress: address,
      chainId: info.chainId,
      offlineSigner,
      accounts,
      walletSelection: "Keplr",
      balances: null,
      balancesError: false,
    }));

    SigningStargateClient.connectWithSigner(info.rpc, offlineSigner)
      .then((signer) => setWallet((prev) => (prev.walletAddress === address ? { ...prev, signer } : prev)))
      .catch((err) => console.warn("Failed to create the signing client:", err));
    await loadBalances(address);
  };

  const disconnectKeplr = () => {
    setWallet((prev) => ({
      ...prev,
      walletAddress: null,
      chainId: null,
      signer: null,
      offlineSigner: null,
      accounts: null,
      walletSelection: "",
      balances: null,
      balancesError: false,
    }));
  };

  const setWalletConnectPopover = (open: boolean) => {
    setWallet((prev) => ({ ...prev, openWalletConnectPopover: open }));
  };

  const triggerWalletConnectPopover = () => {
    setWallet((prev) => ({
      ...prev,
      openWalletConnectPopover: !prev.openWalletConnectPopover,
    }));
  };

  const reloadBalances = async () => {
    if (wallet.walletAddress) await loadBalances(wallet.walletAddress);
  };

  return {
    connectKeplr,
    disconnectKeplr,
    setWalletConnectPopover,
    triggerWalletConnectPopover,
    reloadBalances,
  };
};
