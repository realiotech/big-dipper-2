import { coins } from "@cosmjs/stargate";
import { PubKey } from "cosmjs-types/cosmos/crypto/secp256k1/keys";
import { Any } from "cosmjs-types/google/protobuf/any";
import {
  makeAuthInfoBytes, makeSignDoc,
} from "@cosmjs/proto-signing";
import { TxRaw, TxBody } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import { Int53 } from "@cosmjs/math";
import { fromBase64 } from "@cosmjs/encoding";
import Big from "big.js";

// Define the MsgDelegateEVM proto message structure
const MsgDelegateEVM = {
  encode(message: any): Uint8Array {
    // Manual protobuf encoding for MsgDelegateEVM
    const writer = new Uint8Array(1024); // Allocate buffer
    let offset = 0;

    // Field 1: delegator_address (string)
    if (message.delegatorAddress) {
      const delegatorBytes = new TextEncoder().encode(message.delegatorAddress);
      writer[offset++] = 0x0a; // field 1, wire type 2 (length-delimited)
      writer[offset++] = delegatorBytes.length;
      writer.set(delegatorBytes, offset);
      offset += delegatorBytes.length;
    }

    // Field 2: validator_address (string)
    if (message.validatorAddress) {
      const validatorBytes = new TextEncoder().encode(message.validatorAddress);
      writer[offset++] = 0x12; // field 2, wire type 2 (length-delimited)
      writer[offset++] = validatorBytes.length;
      writer.set(validatorBytes, offset);
      offset += validatorBytes.length;
    }

    // Field 3: contract_address (string)
    if (message.contractAddress) {
      const contractBytes = new TextEncoder().encode(message.contractAddress);
      writer[offset++] = 0x1a; // field 3, wire type 2 (length-delimited)
      writer[offset++] = contractBytes.length;
      writer.set(contractBytes, offset);
      offset += contractBytes.length;
    }

    // Field 4: amount (string)
    if (message.amount) {
      const amountBytes = new TextEncoder().encode(message.amount);
      writer[offset++] = 0x22; // field 4, wire type 2 (length-delimited)
      writer[offset++] = amountBytes.length;
      writer.set(amountBytes, offset);
      offset += amountBytes.length;
    }

    return writer.slice(0, offset);
  }
};

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
        delegatorAddress: sender,
        validatorAddress: validator,
        contractAddress: contractAddress,
        amount: Big(amount).times(Big(10).pow(decimal)).toFixed(0),
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

      if (!accountData.account) {
        throw new Error("Account not found in response");
      }

      const { account_number: accountNumber, sequence } = accountData.account;

      const pubKey = Any.fromPartial({
        typeUrl: "/ethermint.crypto.v1.ethsecp256k1.PubKey",
        value: PubKey.encode({ key: account.pubkey }).finish(),
      });

      // Encode the MsgDelegateEVM using our custom encoder
      const msgBytes = MsgDelegateEVM.encode(delegateEVMMsg);

      // Create the Any wrapper for the message
      const anyMsg = Any.fromPartial({
        typeUrl: "/multistaking.v1.MsgDelegateEVM",
        value: msgBytes,
      });

      // Create TxBody manually
      const txBodyValue = {
        messages: [anyMsg],
        memo: memo || "",
        timeoutHeight: BigInt(0),
        extensionOptions: [],
        nonCriticalExtensionOptions: [],
      };

      const txBodyBytes = TxBody.encode(txBodyValue).finish();

      const gasLimit = Int53.fromString(fee.gas).toNumber();
      const authInfoBytes = makeAuthInfoBytes(
        [{ pubkey: pubKey, sequence }],
        fee.amount,
        gasLimit,
        undefined,
        undefined
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
