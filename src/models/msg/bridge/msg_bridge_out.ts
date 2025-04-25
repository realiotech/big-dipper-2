import * as R from 'ramda';
import type { Categories } from '@/models/msg/types';

class MsgBridgeOut {
    public category: Categories;

    public type: string;

    public signer: string;

    public coin: MsgCoin;

    public json: object;

    constructor(payload: object) {
        this.category = 'bridge';
        this.type = R.pathOr('', ['type'], payload);
        this.signer = R.pathOr('', ['signer'], payload);
        this.coin = {
            denom: R.pathOr('', ['coin', 'denom'], ''),
            amount: R.pathOr('0', ['coin', 'amount'], '0'),
        };
        this.json = R.pathOr({}, ['json'], payload);
    }

    static fromJson(json: object): MsgBridgeOut {
        return {
            category: 'bridge',
            json,
            type: R.pathOr('', ['@type'], json),
            signer: R.pathOr('', ['signer'], json),
            coin: {
                denom: R.pathOr('', ['coin', 'denom'], json),
                amount: R.pathOr('0', ['coin', 'amount'], json),
            },
        };
    }
}

export default MsgBridgeOut;
