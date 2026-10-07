import { cosmosActivity, parseCoins } from '@/utils/cosmos_activity';

const ev = (type: string, attrs: Record<string, string>) => ({
  type,
  attributes: Object.entries(attrs).map(([key, value]) => ({ key, value, index: true })),
});

const DELEGATOR = 'realio17z76hrngactw0sg044ezdvgvrn38vrqhn08544';
const FEE_COLLECTOR = 'realio17xpfvakm2amg962yls6f84z3kell8c5lev82h8';
const DISTRIBUTION = 'realio1jv65s3grqf6v6jl3dp4t6c9t9rk99cd8w2qk49';
const MULTISTAKING = 'realio1mgydlcxrwfn9kx9u6642t4l5fn5h5kydekwk47';
const DSTRX = 'erc20:0xb841F365D5221Bed66d60E69094418D8C2aa5A44';
const VAL = ['realiovaloper1r3mzluplmfsxkzef423zwgmcjykny9zsyea9wz', 'realiovaloper1xxx55pmjmtm45kdtvvvynsjp774sh6sm4aup8k', 'realiovaloper105pcxx692pmf32zh97zyxhkhrtd08xdwmlcrkr', 'realiovaloper15c2qu5ekehnkzl5x84gurzt3avlpcj9wauncvf'];

describe('cosmosActivity', () => {
  it('sums rewards claimed through the distribution precompile (0x6340c9c3…)', () => {
    const logs = {
      events: [
        ev('transfer', { recipient: FEE_COLLECTOR, sender: DELEGATOR, amount: '2115316ario' }),
        ev('transfer', { recipient: DELEGATOR, sender: DISTRIBUTION, amount: '432088632747141448ario' }),
        ev('withdraw_rewards', { amount: '432088632747141448ario', validator: VAL[0], delegator: DELEGATOR }),
        ev('withdraw_rewards', { amount: '79225782923931489ario', validator: VAL[1], delegator: DELEGATOR }),
        ev('withdraw_rewards', { amount: '17151255772948091397ario', validator: VAL[2], delegator: DELEGATOR }),
        ev('withdraw_rewards', { amount: '0ario', validator: VAL[3], delegator: DELEGATOR }),
      ],
    };
    expect(cosmosActivity(logs)).toEqual([
      { kind: 'rewards', coins: [{ denom: 'ario', amount: '17662570188619164334' }], validators: VAL.slice(0, 3) },
    ]);
  });

  it('finds the coins a multistaking delegation locked, not its `stake` units', () => {
    const logs = {
      events: [
        ev('transfer', { recipient: MULTISTAKING, sender: DELEGATOR, amount: `82148977098251990171${DSTRX}` }),
        ev('coinbase', { minter: MULTISTAKING, amount: '82148977098251990171stake' }),
        ev('transfer', { recipient: DELEGATOR, sender: MULTISTAKING, amount: '82148977098251990171stake' }),
        ev('withdraw_rewards', { amount: '2568384783226680ario', validator: VAL[2], delegator: DELEGATOR }),
        ev('delegate', { validator: VAL[2], delegator: DELEGATOR, amount: '82148977098251990171stake' }),
      ],
    };
    expect(cosmosActivity(logs)).toEqual([
      { kind: 'rewards', coins: [{ denom: 'ario', amount: '2568384783226680' }], validators: [VAL[2]] },
      { kind: 'delegate', validator: VAL[2], coins: [{ denom: DSTRX, amount: '82148977098251990171' }] },
    ]);
  });

  it('reports undelegations and redelegations without their `stake` amounts', () => {
    const logs = [
      {
        events: [
          ev('unbond', { validator: VAL[2], delegator: DELEGATOR, amount: '1412595354780645919287stake', completion_time: '2026-09-17T18:56:04Z' }),
          ev('redelegate', { source_validator: VAL[1], destination_validator: VAL[2], amount: '1stake', completion_time: '2026-10-02T08:28:07Z' }),
        ],
      },
    ];
    expect(cosmosActivity(logs)).toEqual([
      { kind: 'undelegate', validator: VAL[2], completion: '2026-09-17T18:56:04Z' },
      { kind: 'redelegate', from: VAL[1], to: VAL[2], completion: '2026-10-02T08:28:07Z' },
    ]);
  });

  it('is empty for plain transfers and missing logs', () => {
    expect(cosmosActivity({ events: [ev('transfer', { recipient: FEE_COLLECTOR, sender: DELEGATOR, amount: '1ario' })] })).toEqual([]);
    expect(cosmosActivity(null)).toEqual([]);
    expect(cosmosActivity(undefined)).toEqual([]);
  });
});

describe('parseCoins', () => {
  it('splits multi-coin amounts, including erc20 denoms', () => {
    expect(parseCoins(`12ario,3${DSTRX}`)).toEqual([{ denom: 'ario', amount: '12' }, { denom: DSTRX, amount: '3' }]);
    expect(parseCoins('')).toEqual([]);
  });
});
