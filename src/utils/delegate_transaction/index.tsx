import { coins } from "@cosmjs/stargate";
import { MsgDelegate } from "cosmjs-types/cosmos/staking/v1beta1/tx";
import { PubKey } from "cosmjs-types/cosmos/crypto/secp256k1/keys";
import { Any } from "cosmjs-types/google/protobuf/any";
import {
  makeAuthInfoBytes, makeSignDoc,
} from "@cosmjs/proto-signing";
import { TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import { Int53 } from "@cosmjs/math";
import { fromBase64 } from "@cosmjs/encoding";
import { SigningStargateClient, StargateClient } from "@cosmjs/stargate";


export const createDelegateTx = async ({
    sender,
    validator,
    denom,
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
      if (!amount || parseFloat(amount) <= 0) {
        throw new Error("Invalid amount");
      }
  
    //   const offlineSigner = window.keplr.getOfflineSigner(chainId);
    //   const accounts = await offlineSigner.getAccounts();
  
      if (!accounts || accounts.length === 0) {
        throw new Error("Failed to retrieve accounts from Keplr");
      }
  
      const account = accounts.find((acc) => acc.address === sender);
      if (!account) {
        throw new Error("Failed to find the connected account");
      }
      if (!account.pubkey) {
        throw new Error("Account does not have a public key");
      }
  
    //   const signingClient = await SigningStargateClient.connectWithSigner(rpcEndpoint, offlineSigner);
  
      const delegateMsg = {
        typeUrl: "/cosmos.staking.v1beta1.MsgDelegate",
        value: MsgDelegate.fromPartial({
          delegatorAddress: sender,
          validatorAddress: validator,
          amount: {
            denom: denom,
            amount: (parseFloat(amount) * 10 ** decimal).toString(),
          },
        }),
      };
  
      const fee = {
        amount: coins(fees, denom),
        gas: gas,
      };
  
      const accountResponse = await fetch(`${apiEndpoint}/cosmos/auth/v1beta1/accounts/${sender}`);
      const accountData = await accountResponse.json();
      const { account_number: accountNumber, sequence } = accountData.account;
  
      const pubKey = Any.fromPartial({
        typeUrl: "/ethermint.crypto.v1.ethsecp256k1.PubKey",
        value: PubKey.encode({ key: account.pubkey }).finish(),
      });
  
      const txBody = {
        typeUrl: "/cosmos.tx.v1beta1.TxBody",
        value: { messages: [delegateMsg], memo },
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
      console.error("Delegate transaction failed:", err);
      throw err;
    }
  };