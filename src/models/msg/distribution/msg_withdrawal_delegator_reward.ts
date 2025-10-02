import * as R from "ramda";
import { chainConfig } from "@/configs";
import type { Categories, Log } from "@/models/msg/types";
import { formatToken } from "@/utils/format_token";

const { primaryTokenUnit } = chainConfig;

class MsgWithdrawDelegatorReward {
  public category: Categories;

  public type: string;

  public delegatorAddress: string;

  public validatorAddress: string;

  public amounts: TokenUnit[];

  public json: object;

  constructor(payload: object) {
    this.category = "distribution";
    this.type = R.pathOr("", ["type"], payload);
    this.delegatorAddress = R.pathOr("", ["delegatorAddress"], payload);
    this.validatorAddress = R.pathOr("", ["validatorAddress"], payload);
    this.amounts = R.pathOr([], ["amounts"], payload);
    this.json = R.pathOr({}, ["json"], payload);
  }

  static getWithdrawalAmount(valAddress: string, logs?: Log | Log[]) {
    if (Array.isArray(logs)) {
      const withdrawEvents = logs.flatMap(
        (log) => log?.events?.filter((x) => x.type === "withdraw_rewards") || []
      );
      const withdrawAmounts =
        withdrawEvents?.[0]?.attributes?.filter((x) => x.key === "amount") ??
        [];

      const amounts = (withdrawAmounts?.[0]?.value ?? "0")
        .split(",")
        .map((x) => {
          const [amount, denom = primaryTokenUnit] =
            x.match(/[a-z]+|[^a-z]+/gi) ?? [];
          return formatToken(amount, denom);
        });

      return amounts;
    } else {
      const withdrawEvents =
        logs?.events?.filter((x) => x.type === "withdraw_rewards") ?? [];
      const withdrawEntry = withdrawEvents.find((x) => {
        return x.attributes.findIndex((y) => y.value === valAddress) !== -1;
      });
      const withdrawAmounts =
        withdrawEntry?.attributes?.filter((x) => x.key === "amount") ?? [];

      const amounts = (withdrawAmounts?.[0]?.value ?? "0")
        .split(",")
        .map((x) => {
          const [amount, denom = primaryTokenUnit] =
            x.match(/[a-z]+|[^a-z]+/gi) ?? [];
          return formatToken(amount, denom);
        });

      return amounts;
    }
  }

  static fromJson(
    json: object,
    logs?: Log | Log[]
  ): MsgWithdrawDelegatorReward {
    const amounts = this.getWithdrawalAmount(R.pathOr("", ["validator_address"], json), logs);

    return {
      category: "distribution",
      json,
      type: R.pathOr("", ["@type"], json),
      delegatorAddress: R.pathOr("", ["delegator_address"], json),
      validatorAddress: R.pathOr("", ["validator_address"], json),
      amounts,
    };
  }
}

export default MsgWithdrawDelegatorReward;
