import { coins } from "@cosmjs/stargate";

export const createDelegateTx = async ({
  sender,
  validator,
  denom,
  amount,
  fees,
  gas,
  memo,
  signer, // Ensure this is an Amino signer
  decimal,
}) => {
  try {
    // Convert amount to the correct format
    const amountInMicro = (parseFloat(amount) * 10 ** decimal).toString();

    const delegateMsg = {
      typeUrl: "/cosmos.staking.v1beta1.MsgDelegate",
      value: {
        delegatorAddress: sender,
        validatorAddress: validator,
        amount: {
          denom: denom,
          amount: amountInMicro,
        },
      },
    };

    const fee = {
      amount: coins(fees, denom),
      gas: gas,
    };

    const txResult = await signer.delegateTokens(sender, [delegateMsg], fee, memo);

    return txResult;
  } catch (err) {
    console.error("Delegate transaction failed:", err);
    throw err;
  }
};