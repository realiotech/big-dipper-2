import { useEffect } from 'react';
import { useRecoilState } from 'recoil';
import { atomState } from '@/recoil/wallet/atom';
import { StargateClient, SigningStargateClient } from '@cosmjs/stargate';

export const useKeplrConnect = () => {
  const [wallet, setWallet] = useRecoilState(atomState);

  const connectKeplr = async () => {
    if (!window.keplr) {
      alert('Keplr Wallet not installed.');
      setWallet((prev) => ({
        ...prev,
        openInstallKeplrExtensionDialog: true,
      }));
      return;
    }

    try {
      const chainId = 'realionetwork_3301-1'; 
      await window.keplr.enable(chainId);
      const client = await StargateClient.connect("https://realio.rpc.decentrio.ventures:443");
      
      const offlineSigner = window.getOfflineSigner(chainId);
      const accounts = await offlineSigner.getAccounts();
      const balance = await client.getBalance(accounts[0].address, 'ario');
      setWallet((prev) => ({
        ...prev,
        walletAddress: accounts[0].address,
        chainId,
        signer: offlineSigner,
        walletSelection: 'keplr',
      }));
      console.log("Wallet connected:", {
        walletAddress: accounts[0]?.address,
        chainId,
        offlineSigner,
        balance
      });
    } catch (err) {
      console.error('Failed to connect to Keplr:', err);
    }
  };

  return { connectKeplr };
};


export const useWalletRecoil = () => {
  const [wallet, setWallet] = useRecoilState(atomState);

  useEffect(() => {
    // set the wallet values
  }, [
    setWallet,
    wallet.openAuthorizeConnectionDialog,
    wallet.openInstallKeplrExtensionDialog,
    wallet.openLoginDialog,
    wallet.openLoginSuccessDialog,
    wallet.openPairConnectWalletDialog,
    wallet.openPairKeplrExtensionDialog,
    wallet.openSelectNetworkDialog,
    wallet.walletConnectURI,
    wallet.walletSelection,
  ]);
};
