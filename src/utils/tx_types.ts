/**
 * Message types the transaction filters offer, grouped by module as in the
 * "All types" menu. One entry can cover several type URLs where a message
 * exists in more than one module version (gov v1 and v1beta1, the two EVM
 * modules).
 */
export type TxTypeOption = { value: string; label: string; types: string[] };
export type TxTypeGroup = { label: string; options: TxTypeOption[] };

export const EVM_MSG_TYPES = ['/cosmos.evm.vm.v1.MsgEthereumTx', '/os.evm.v1.MsgEthereumTx'];

export const TX_TYPE_GROUPS: TxTypeGroup[] = [
  {
    label: 'Bank',
    options: [
      { value: 'send', label: 'Send', types: ['/cosmos.bank.v1beta1.MsgSend'] },
      { value: 'multi-send', label: 'Multi Send', types: ['/cosmos.bank.v1beta1.MsgMultiSend'] },
    ],
  },
  {
    label: 'Staking',
    options: [
      { value: 'delegate', label: 'Delegate', types: ['/cosmos.staking.v1beta1.MsgDelegate'] },
      { value: 'undelegate', label: 'Undelegate', types: ['/cosmos.staking.v1beta1.MsgUndelegate'] },
      { value: 'redelegate', label: 'Redelegate', types: ['/cosmos.staking.v1beta1.MsgBeginRedelegate'] },
      { value: 'cancel-unbonding', label: 'Cancel Unbonding', types: ['/cosmos.staking.v1beta1.MsgCancelUnbondingDelegation'] },
      { value: 'create-validator', label: 'Create Validator', types: ['/cosmos.staking.v1beta1.MsgCreateValidator'] },
      { value: 'edit-validator', label: 'Edit Validator', types: ['/cosmos.staking.v1beta1.MsgEditValidator'] },
    ],
  },
  {
    label: 'Multistaking',
    options: [
      { value: 'delegate-evm', label: 'Delegate EVM', types: ['/multistaking.v1.MsgDelegateEVM'] },
      { value: 'undelegate-evm', label: 'Undelegate EVM', types: ['/multistaking.v1.MsgUndelegateEVM'] },
      { value: 'redelegate-evm', label: 'Redelegate EVM', types: ['/multistaking.v1.MsgBeginRedelegateEVM'] },
      { value: 'create-evm-validator', label: 'Create EVM Validator', types: ['/multistaking.v1.MsgCreateEVMValidator'] },
    ],
  },
  {
    label: 'Distribution',
    options: [
      { value: 'claim-reward', label: 'Claim Reward', types: ['/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward'] },
      { value: 'claim-commission', label: 'Claim Commission', types: ['/cosmos.distribution.v1beta1.MsgWithdrawValidatorCommission'] },
      { value: 'set-withdraw-address', label: 'Set Withdraw Address', types: ['/cosmos.distribution.v1beta1.MsgSetWithdrawAddress'] },
    ],
  },
  {
    label: 'Governance',
    options: [
      {
        value: 'vote',
        label: 'Vote',
        types: ['/cosmos.gov.v1.MsgVote', '/cosmos.gov.v1beta1.MsgVote', '/cosmos.gov.v1.MsgVoteWeighted', '/cosmos.gov.v1beta1.MsgVoteWeighted'],
      },
      { value: 'deposit', label: 'Deposit', types: ['/cosmos.gov.v1.MsgDeposit', '/cosmos.gov.v1beta1.MsgDeposit'] },
      { value: 'submit-proposal', label: 'Submit Proposal', types: ['/cosmos.gov.v1.MsgSubmitProposal', '/cosmos.gov.v1beta1.MsgSubmitProposal'] },
    ],
  },
  {
    label: 'Authz',
    options: [
      { value: 'authz-exec', label: 'Authz Exec', types: ['/cosmos.authz.v1beta1.MsgExec'] },
      { value: 'authz-grant', label: 'Authz Grant', types: ['/cosmos.authz.v1beta1.MsgGrant'] },
      { value: 'authz-revoke', label: 'Authz Revoke', types: ['/cosmos.authz.v1beta1.MsgRevoke'] },
    ],
  },
  {
    label: 'EVM',
    options: [{ value: 'ethereum-tx', label: 'Ethereum Tx', types: EVM_MSG_TYPES }],
  },
  {
    label: 'Bridge',
    options: [
      { value: 'bridge-in', label: 'Bridge In', types: ['/realionetwork.bridge.v1.MsgBridgeIn'] },
      { value: 'bridge-out', label: 'Bridge Out', types: ['/realionetwork.bridge.v1.MsgBridgeOut'] },
    ],
  },
  {
    label: 'IBC',
    options: [
      { value: 'ibc-transfer', label: 'IBC Transfer', types: ['/ibc.applications.transfer.v1.MsgTransfer'] },
      { value: 'ibc-receive', label: 'IBC Receive', types: ['/ibc.core.channel.v1.MsgRecvPacket'] },
      { value: 'ibc-acknowledgement', label: 'IBC Acknowledgement', types: ['/ibc.core.channel.v1.MsgAcknowledgement'] },
      { value: 'ibc-timeout', label: 'IBC Timeout', types: ['/ibc.core.channel.v1.MsgTimeout'] },
      { value: 'ibc-update-client', label: 'IBC Update Client', types: ['/ibc.core.client.v1.MsgUpdateClient'] },
      { value: 'ibc-create-client', label: 'IBC Create Client', types: ['/ibc.core.client.v1.MsgCreateClient'] },
    ],
  },
  {
    label: 'Other',
    options: [
      { value: 'unjail', label: 'Unjail', types: ['/cosmos.slashing.v1beta1.MsgUnjail'] },
      { value: 'authorize-address', label: 'Authorize Address', types: ['/realionetwork.asset.v1.MsgAuthorizeAddress'] },
    ],
  },
];

const OPTIONS = new Map(TX_TYPE_GROUPS.flatMap((group) => group.options.map((option) => [option.value, option] as const)));

export const txTypeOption = (value?: string | null): TxTypeOption | undefined => (value ? OPTIONS.get(value) : undefined);
