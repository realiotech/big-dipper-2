import { useRecoilState } from "recoil";
import { atomState } from "@/recoil/wallet/atom";
import { SigningStargateClient, StargateClient } from "@cosmjs/stargate";

export const useKeplrConnect = () => {
  const [wallet, setWallet] = useRecoilState(atomState);

  const connectKeplr = async () => {
    if (!window.keplr) {
      alert("Keplr Wallet not installed.");
      setWallet((prev) => ({
        ...prev,
        openInstallKeplrExtensionDialog: true,
      }));
      return;
    }

    try {
      const chainId = "realionetwork_3301-1";

      // Define the chain configuration for Keplr
      const chainInfo = {
        chainId: "realionetwork_3301-1",
        chainName: "Realio Network",
        rpc: "https://realio.rpc.decentrio.ventures:443",
        rest: "https://realio.api.decentrio.ventures:443",
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
      };
      await window.keplr.experimentalSuggestChain(chainInfo);
      await window.keplr.enable(chainId);
      const client = await StargateClient.connect(chainInfo.rpc);
      const offlineSigner = await window.keplr.getOfflineSignerAuto(chainId);

      const accounts = await offlineSigner.getAccounts();
      const signer = await SigningStargateClient.connectWithSigner(
        chainInfo.rpc,
        offlineSigner
      );

      // Fetch balances for multiple denoms
      const denoms = ["ario", "arst", "almx"];
      const balances: Record<string, string> = {};

      for (const denom of denoms) {
        const balance = await client.getBalance(accounts[0].address, denom);
        balances[denom] = balance.amount;
      }

      setWallet((prev) => ({
        ...prev,
        walletAddress: accounts[0]?.address,
        chainId,
        signer: signer,
        offlineSigner,
        walletSelection: "Keplr",
        balances,
        accounts
      }));

      // console.log("Wallet connected:", {
      //   walletAddress: accounts[0]?.address,
      //   chainId,
      //   offlineSigner,
      //   balances,
      // });
    } catch (err) {
      console.error("Failed to connect to Keplr:", err);
    }
  };

  const disconnectKeplr = async () => {
    setWallet((prev) => ({
      ...prev,
      walletAddress: null,
      chainId: null,
      signer: null,
      walletSelection: null,
      balances: null,
    }));
    console.log("Wallet disconnected");
  };

  const triggerWalletConnectPopover = () => {
    setWallet((prev) => ({
      ...prev,
      openWalletConnectPopover: !prev.openWalletConnectPopover,
    }));
  };
  
  const reloadBalances = async () => {
    if (!wallet.walletAddress) return;

    const client = await StargateClient.connect(
      "https://realio.rpc.decentrio.ventures:443"
    );
    const denoms = ["ario", "arst", "almx"];
    const balances: Record<string, string> = {};

    for (const denom of denoms) {
      const balance = await client.getBalance(wallet.walletAddress, denom);
      balances[denom] = balance.amount;
    }

    setWallet((prev) => ({
      ...prev,
      balances,
    }));
  };

  return { connectKeplr, disconnectKeplr, triggerWalletConnectPopover, reloadBalances };
};
