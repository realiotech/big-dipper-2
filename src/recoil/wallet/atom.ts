import { atom } from 'recoil';

export interface AtomState {
  openAuthorizeConnectionDialog: boolean;
  openInstallKeplrExtensionDialog: boolean;
  openLoginDialog: boolean;
  openLoginSuccessDialog: boolean;
  openPairConnectWalletDialog: boolean;
  openPairKeplrExtensionDialog: boolean;
  openSelectNetworkDialog: boolean;
  openWalletConnectPopover: boolean;
  walletConnectURI: string;
  walletSelection: string;
  walletAddress: string | null; // New field for the wallet address
  chainId: string | null; // New field for the chain ID
  signer: any | null; // New field for the signer object
  accounts: any | null; // New field for the accounts object
  balances: Record<string, string> | null; 
  offlineSigner: any | null; // New field for the offline signer object
}

const initialState: AtomState = {
  openAuthorizeConnectionDialog: false,
  openInstallKeplrExtensionDialog: false,
  openLoginDialog: false,
  openLoginSuccessDialog: false,
  openPairConnectWalletDialog: false,
  openPairKeplrExtensionDialog: false,
  openSelectNetworkDialog: false,
  openWalletConnectPopover: false,
  walletConnectURI: '',
  walletSelection: '',
  walletAddress: null, // Default to null
  chainId: null, // Default to null
  signer: null, // Default to null
  accounts: null, // Default to null
  balances: null,
  offlineSigner: null, // Default to null
};

export const atomState = atom<AtomState>({
  key: 'wallet',
  default: initialState,
});

