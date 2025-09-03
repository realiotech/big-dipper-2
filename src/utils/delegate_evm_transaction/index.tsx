import { coins } from "@cosmjs/stargate";
import { PubKey } from "cosmjs-types/cosmos/crypto/secp256k1/keys";
import { Any } from "cosmjs-types/google/protobuf/any";
import {
  makeAuthInfoBytes, makeSignDoc,
} from "@cosmjs/proto-signing";
import { TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import { Int53 } from "@cosmjs/math";
import { fromBase64 } from "@cosmjs/encoding";
import Big from "big.js";

// EVM Delegate message type for DSTRX tokens
export const createDelegateEVMTx = async ({
    sender,
    validator,
    contractAddress,
    amount,
    fees,
    gas,
    memo,
    accounts,
    signer, 
    offlineSigner,
    decimal,
    chainId,
    rpcEndpoint,
    apiEndpoint,
  }) => {
    try {
      // Validate input
      if (!sender) {
        throw new Error("Delegator address is required");
      }
      if (!validator) {
        throw new Error("Validator address is required");
      }
      if (!contractAddress) {
        throw new Error("ERC20 contract address is required");
      }
      if (!amount || parseFloat(amount) <= 0) {
        throw new Error("Invalid amount");
      }

      const account = accounts.find((acc) => acc.address === sender);
      if (!account) {
        throw new Error("Account not found");
      }

      // Create EVM delegate message for ERC20 tokens
      const delegateEVMMsg = {
        typeUrl: "/realionetwork.multistaking.v1.MsgDelegateEVM",
        value: {
          delegatorAddress: sender,
          validatorAddress: validator,
          contractAddress: contractAddress,
          amount: Big(amount).times(Big(10).pow(decimal)).toFixed(0),
        },
      };

      const fee = {
        amount: coins(fees, "ario"), // Use RIO for fees
        gas: gas,
      };

      const accountResponse = await fetch(`${apiEndpoint}/cosmos/auth/v1beta1/accounts/${sender}`);

      if (!accountResponse.ok) {
        throw new Error(`Failed to fetch account data: ${accountResponse.status} ${accountResponse.statusText}`);
      }

      const accountData = await accountResponse.json();
      console.log('Account data response:', accountData);

      if (!accountData.account) {
        throw new Error("Account not found in response");
      }

      const { account_number: accountNumber, sequence } = accountData.account;

      const pubKey = Any.fromPartial({
        typeUrl: "/ethermint.crypto.v1.ethsecp256k1.PubKey",
        value: PubKey.encode({ key: account.pubkey }).finish(),
      });

      const txBody = {
        typeUrl: "/cosmos.tx.v1beta1.TxBody",
        value: { messages: [delegateEVMMsg], memo },
      };

      const txBodyBytes = signer.registry.encode(txBody);
      const gasLimit = Int53.fromString(fee.gas).toNumber();
      const authInfoBytes = makeAuthInfoBytes(
        [{ pubkey: pubKey, sequence }],
        fee.amount,
        gasLimit,
      );
      const signDoc = makeSignDoc(txBodyBytes, authInfoBytes, chainId, accountNumber);

      const { signed, signature } = await offlineSigner.signDirect(sender, signDoc);

      const txBytes = TxRaw.encode({
        bodyBytes: signed.bodyBytes,
        authInfoBytes: signed.authInfoBytes,
        signatures: [fromBase64(signature.signature)],
      }).finish();

      const result = await signer.broadcastTx(txBytes);

      if (result.code !== 0) {
        throw new Error(result.rawLog);
      }

      return result;
    } catch (err) {
      console.error("EVM Delegate transaction failed:", err);
      throw err;
    }
  };
