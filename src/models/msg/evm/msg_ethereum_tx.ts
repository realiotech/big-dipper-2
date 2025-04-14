import * as R from 'ramda';
import type { Categories } from '@/models/msg/types';

class MsgEthereumTx {
  public category: Categories;

  public type: string;

  public from: string;

  public hash: string;
  
  public json: object;

  constructor(payload: object) {
    this.category = 'evm';
    this.type = R.pathOr('', ['type'], payload);
    this.from = R.pathOr('', ['from'], payload);
    this.hash = R.pathOr('', ['hash'], payload);
  }

  static fromJson(json: object): MsgEthereumTx {
    return {
      category: 'evm',
      json,
      type: R.pathOr('', ['@type'], json),
      from: R.pathOr('', ['from'], json),
      hash: R.pathOr('', ['hash'], json)
    };
  }
}

export default MsgEthereumTx;
