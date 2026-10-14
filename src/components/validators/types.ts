export interface ValidatorType {
  validator: string;
  votingPower: number;
  votingPowerPercent: number;
  commission: number;
  missedBlocks: number;
  status: number;
  jailed: boolean;
  tombstoned: boolean;
  denom: string;
}
