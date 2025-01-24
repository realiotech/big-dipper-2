import { useRecoilState } from "recoil";
import { atomState } from "@/recoil/wallet/atom";
import { SigningStargateClient, StargateClient } from "@cosmjs/stargate";
import { useEffect } from "react";

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

      // Enable chain and get signer
      await window.keplr.enable(chainId);
      const client = await StargateClient.connect(
        "https://realio.rpc.decentrio.ventures:443"
      );
      const offlineSigner = await window.keplr.getOfflineSignerAuto(chainId);

      const accounts = await offlineSigner.getAccounts();
      const signer = await SigningStargateClient.connectWithSigner(
        "https://realio.rpc.decentrio.ventures:443",
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
        walletSelection: "Keplr",
        balances,
      }));

      console.log("Wallet connected:", {
        walletAddress: accounts[0]?.address,
        chainId,
        offlineSigner,
        balances,
      });
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
      balance: null,
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
  }

  return { connectKeplr, disconnectKeplr, triggerWalletConnectPopover, reloadBalances };
};
