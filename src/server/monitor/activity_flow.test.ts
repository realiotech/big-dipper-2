import { messageFlow } from './activity';

const A = 'realio1qyayxk72frktye0p9plyegt06xtyyw9csahqt3';
const B = 'realio1d2rjp2kxc7md7q9xmjmslmludexv5lvk338k6j';
const VAL = 'realiovaloper1q9xw5t6lsf848yylkcen5x7f6fg346g2ake6zt';

describe('messageFlow', () => {
  it('reads a send: sender, recipient, amount, signed by the sender', () => {
    expect(messageFlow('/cosmos.bank.v1beta1.MsgSend', {
      from_address: A, to_address: B, amount: [{ denom: 'ario', amount: '2000000000000000' }],
    })).toEqual({ from: [{ address: A }], to: [{ address: B }], signer: A, amounts: [{ denom: 'ario', amount: '2000000000000000' }] });
  });

  it('shows staking exits the way funds move, without multistaking units', () => {
    expect(messageFlow('/cosmos.staking.v1beta1.MsgUndelegate', {
      delegator_address: B, validator_address: VAL, amount: { denom: 'stake', amount: '100000000000000000000001' },
    })).toEqual({ from: [{ address: VAL }], to: [{ address: B }], signer: B, amounts: [] });
    expect(messageFlow('/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward', { delegator_address: B, validator_address: VAL }))
      .toEqual({ from: [{ address: VAL }], to: [{ address: B }], signer: B, amounts: [] });
  });

  it('names the bridge and its signers', () => {
    expect(messageFlow('/realionetwork.bridge.v1.MsgBridgeIn', {
      authority: A, receiver: B, coin: { denom: 'ario', amount: '74372000000000000000000' },
    })).toEqual({ from: [{ label: 'Bridge' }], to: [{ address: B }], signer: A, amounts: [{ denom: 'ario', amount: '74372000000000000000000' }] });
    expect(messageFlow('/realionetwork.bridge.v1.MsgBridgeOut', { signer: B, coin: { denom: 'ario', amount: '10' } }))
      .toEqual({ from: [{ address: B }], to: [{ label: 'Bridge' }], signer: B, amounts: [{ denom: 'ario', amount: '10' }] });
  });

  it('takes the grantee as signer of an authz exec and the granter of a grant', () => {
    expect(messageFlow('/cosmos.authz.v1beta1.MsgExec', { grantee: A, msgs: [{ from_address: B, to_address: A }] }).signer).toBe(A);
    expect(messageFlow('/cosmos.authz.v1beta1.MsgGrant', { granter: B, grantee: A }).signer).toBe(B);
  });

  it('falls back to payload roles for other messages', () => {
    const flow = messageFlow('/cosmos.gov.v1.MsgVote', { voter: A, proposal_id: '3', option: 1 });
    expect(flow.signer).toBe(A);
    expect(flow.from).toEqual([]);
  });
});
