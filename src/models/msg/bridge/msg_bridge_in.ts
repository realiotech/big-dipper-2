import * as R from 'ramda';
import type { Categories } from '@/models/msg/types';

class MsgBridgeIn {
  public category: Categories;

  public type: string;

  public authority: string;

  public coin: MsgCoin;

  public receiver: string;

  public json: object;

  constructor(payload: object) {
    this.category = 'bridge';
    this.type = R.pathOr('', ['type'], payload);
    this.authority = R.pathOr('', ['authority'], payload);
    this.receiver = R.pathOr('', ['receiver'], payload);
    this.coin = {
      denom: R.pathOr('', ['coin', 'denom'], ''),
      amount: R.pathOr('0', ['coin', 'amount'], '0'),
    };
    this.json = R.pathOr({}, ['json'], payload);
  }

  static fromJson(json: object): MsgBridgeIn {
    return {
      category: 'bridge',
      json,
      type: R.pathOr('', ['@type'], json),
      authority: R.pathOr('', ['authority'], json),
      receiver: R.pathOr('', ['receiver'], json),
      coin: {
        denom: R.pathOr('', ['coin', 'denom'], json),
        amount: R.pathOr('0', ['coin', 'amount'], json),
      },
    };
  }
}

export default MsgBridgeIn;
