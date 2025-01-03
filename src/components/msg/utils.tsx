import * as COMPONENTS from '@/components/msg';
import Tag from '@/components/helper/tag';
import * as MODELS from '@/models';
import type { Log } from '@/models/msg/types';
import isKeyOf from '@/utils/isKeyOf';
import type { TFunction } from '@/hooks/useAppTranslation';
import * as R from 'ramda';
import { ComponentProps, FC } from 'react';

// =====================================
// DO NOT UPDATE IF THIS IS A FORK.
// ONLY COSMOS SDK DEFAULT MESSAGES HERE.
// Please use `customTypeToModel` below for custom message types
// =====================================
const defaultTypeToModel = {
  // ========================
  // staking
  // ========================
  '/cosmos.staking.v1beta1.MsgDelegate': {
    model: MODELS.MsgDelegate,
    content: COMPONENTS.Delegate,
    tagTheme: 'blue',
    tagDisplay: 'txDelegateLabel',
  },
  '/cosmos.staking.v1beta1.MsgBeginRedelegate': {
    model: MODELS.MsgRedelegate,
    content: COMPONENTS.Redelegate,
    tagTheme: 'blue',
    tagDisplay: 'txRedelegateLabel',
  },
  '/cosmos.staking.v1beta1.MsgUndelegate': {
    model: MODELS.MsgUndelegate,
    content: COMPONENTS.Undelegate,
    tagTheme: 'blue',
    tagDisplay: 'txUndelegateLabel',
  },
  '/cosmos.staking.v1beta1.MsgCreateValidator': {
    model: MODELS.MsgCreateValidator,
    content: COMPONENTS.CreateValidator,
    tagTheme: 'blue',
    tagDisplay: 'txCreateValidatorLabel',
  },
  '/cosmos.staking.v1beta1.MsgEditValidator': {
    model: MODELS.MsgEditValidator,
    content: COMPONENTS.EditValidator,
    tagTheme: 'blue',
    tagDisplay: 'txEditValidatorLabel',
  },
  // ========================
  // bank
  // ========================
  '/cosmos.bank.v1beta1.MsgSend': {
    model: MODELS.MsgSend,
    content: COMPONENTS.Send,
    tagTheme: 'teal',
    tagDisplay: 'txSendLabel',
  },
  '/cosmos.bank.v1beta1.MsgMultiSend': {
    model: MODELS.MsgMultiSend,
    content: COMPONENTS.Multisend,
    tagTheme: 'teal',
    tagDisplay: 'txMultisendLabel',
  },
  // ========================
  // crisis
  // ========================
  '/cosmos.crisis.v1beta1.MsgVerifyInvariant': {
    model: MODELS.MsgVerifyInvariant,
    content: COMPONENTS.VerifyInvariant,
    tagTheme: 'orange',
    tagDisplay: 'txVerifyInvariantLabel',
  },
  // ========================
  // slashing
  // ========================
  '/cosmos.slashing.v1beta1.MsgUnjail': {
    model: MODELS.MsgUnjail,
    content: COMPONENTS.Unjail,
    tagTheme: 'red',
    tagDisplay: 'txUnjailLabel',
  },
  // ========================
  // distribution
  // ========================
  '/cosmos.distribution.v1beta1.MsgFundCommunityPool': {
    model: MODELS.MsgFundCommunityPool,
    content: COMPONENTS.Fund,
    tagTheme: 'purple',
    tagDisplay: 'txFundLabel',
  },
  '/cosmos.distribution.v1beta1.MsgSetWithdrawAddress': {
    model: MODELS.MsgSetWithdrawAddress,
    content: COMPONENTS.SetWithdrawalAddress,
    tagTheme: 'purple',
    tagDisplay: 'txsetRewardAddressLabel',
  },
  '/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward': {
    model: MODELS.MsgWithdrawDelegatorReward,
    content: COMPONENTS.WithdrawReward,
    tagTheme: 'purple',
    tagDisplay: 'txWithdrawRewardLabel',
  },
  '/cosmos.distribution.v1beta1.MsgWithdrawValidatorCommission': {
    model: MODELS.MsgWithdrawValidatorCommission,
    content: COMPONENTS.WithdrawCommission,
    tagTheme: 'purple',
    tagDisplay: 'txWithdrawCommissionLabel',
  },
  // ========================
  // governance
  // ========================
  '/cosmos.gov.v1beta1.MsgDeposit': {
    model: MODELS.MsgDeposit,
    content: COMPONENTS.DepositProposal,
    tagTheme: 'cyan',
    tagDisplay: 'txDepositLabel',
  },
  '/cosmos.gov.v1beta1.MsgVote': {
    model: MODELS.MsgVote,
    content: COMPONENTS.Vote,
    tagTheme: 'cyan',
    tagDisplay: 'txVoteLabel',
  },
  '/cosmos.gov.v1beta1.MsgSubmitProposal': {
    model: MODELS.MsgSubmitProposal,
    content: COMPONENTS.SubmitProposal,
    tagTheme: 'cyan',
    tagDisplay: 'txSubmitProposalLabel',
  },
  // ========================
  // ibc client
  // ========================
  '/ibc.core.client.v1.MsgCreateClient': {
    model: MODELS.MsgCreateClient,
    content: COMPONENTS.CreateClient,
    tagTheme: 'yellow',
    tagDisplay: 'txCreateClientLabel',
  },
  '/ibc.core.client.v1.MsgUpdateClient': {
    model: MODELS.MsgUpdateClient,
    content: COMPONENTS.UpdateClient,
    tagTheme: 'yellow',
    tagDisplay: 'txUpdateClientLabel',
  },
  '/ibc.core.client.v1.MsgUpgradeClient': {
    model: MODELS.MsgUpgradeClient,
    content: COMPONENTS.UpgradeClient,
    tagTheme: 'yellow',
    tagDisplay: 'txUpgradeClientLabel',
  },
  '/ibc.core.client.v1.MsgSubmitMisbehaviour': {
    model: MODELS.MsgSubmitMisbehaviour,
    content: COMPONENTS.SubmitMisbehaviour,
    tagTheme: 'yellow',
    tagDisplay: 'txSubmitMisbehaviourLabel',
  },
  '/ibc.core.client.v1.Height': {
    model: MODELS.MsgHeight,
    content: COMPONENTS.Height,
    tagTheme: 'yellow',
    tagDisplay: 'txHeightLabel',
  },
  // ========================
  // ibc channel
  // ========================
  '/ibc.core.channel.v1.MsgRecvPacket': {
    model: MODELS.MsgReceivePacket,
    content: COMPONENTS.ReceivePacket,
    tagTheme: 'yellow',
    tagDisplay: 'txRecvPacketLabel',
  },
  '/ibc.core.channel.v1.Channel': {
    model: MODELS.MsgChannel,
    content: COMPONENTS.Channel,
    tagTheme: 'yellow',
    tagDisplay: 'txChannelLabel',
  },
  '/ibc.core.channel.v1.Counterparty': {
    model: MODELS.MsgCounterpartyChannel,
    content: COMPONENTS.CounterpartyChannel,
    tagTheme: 'yellow',
    tagDisplay: 'txCounterpartyLabel',
  },
  '/ibc.core.channel.v1.Packet': {
    model: MODELS.MsgPacket,
    content: COMPONENTS.Packet,
    tagTheme: 'yellow',
    tagDisplay: 'txPacketLabel',
  },
  '/ibc.core.channel.v1.MsgAcknowledgement': {
    model: MODELS.MsgAcknowledgement,
    content: COMPONENTS.Acknowledgement,
    tagTheme: 'yellow',
    tagDisplay: 'txAcknowledgementLabel',
  },
  '/ibc.core.channel.v1.MsgChannelCloseConfirm': {
    model: MODELS.MsgChannelCloseConfirm,
    content: COMPONENTS.ChannelCloseConfirm,
    tagTheme: 'yellow',
    tagDisplay: 'txChannelCloseConfirmLabel',
  },
  '/ibc.core.channel.v1.MsgChannelCloseInit': {
    model: MODELS.MsgChannelCloseInit,
    content: COMPONENTS.ChannelCloseInit,
    tagTheme: 'yellow',
    tagDisplay: 'txChannelCloseInitLabel',
  },
  '/ibc.core.channel.v1.MsgChannelOpenAck': {
    model: MODELS.MsgChannelOpenAck,
    content: COMPONENTS.ChannelOpenAck,
    tagTheme: 'yellow',
    tagDisplay: 'txChannelOpenAckLabel',
  },
  '/ibc.core.channel.v1.MsgChannelOpenConfirm': {
    model: MODELS.MsgChannelOpenConfirm,
    content: COMPONENTS.ChannelOpenConfirm,
    tagTheme: 'yellow',
    tagDisplay: 'txChannelOpenConfirmLabel',
  },
  '/ibc.core.channel.v1.MsgChannelOpenInit': {
    model: MODELS.MsgChannelOpenInit,
    content: COMPONENTS.ChannelOpenInit,
    tagTheme: 'yellow',
    tagDisplay: 'txChannelOpenInitLabel',
  },
  '/ibc.core.channel.v1.MsgChannelOpenTry': {
    model: MODELS.MsgChannelOpenTry,
    content: COMPONENTS.ChannelOpenTry,
    tagTheme: 'yellow',
    tagDisplay: 'txChannelOpenTryLabel',
  },
  '/ibc.core.channel.v1.MsgTimeout': {
    model: MODELS.MsgTimeout,
    content: COMPONENTS.Timeout,
    tagTheme: 'yellow',
    tagDisplay: 'txTimeoutLabel',
  },
  '/ibc.core.channel.v1.MsgTimeoutOnClose': {
    model: MODELS.MsgTimeoutOnClose,
    content: COMPONENTS.TimeoutOnClose,
    tagTheme: 'yellow',
    tagDisplay: 'txTimeoutOnCloseLabel',
  },
  // ========================
  // ibc connection
  // ========================
  '/ibc.core.connection.v1.MsgConnectionOpenAck': {
    model: MODELS.MsgConnectionOpenAck,
    content: COMPONENTS.ConnectionOpenAck,
    tagTheme: 'yellow',
    tagDisplay: 'txConnectionOpenAckLabel',
  },
  '/ibc.core.connection.v1.MsgConnectionOpenConfirm': {
    model: MODELS.MsgConnectionOpenConfirm,
    content: COMPONENTS.ConnectionOpenConfirm,
    tagTheme: 'yellow',
    tagDisplay: 'txConnectionOpenConfirmLabel',
  },
  '/ibc.core.connection.v1.MsgConnectionOpenInit': {
    model: MODELS.MsgConnectionOpenInit,
    content: COMPONENTS.ConnectionOpenInit,
    tagTheme: 'yellow',
    tagDisplay: 'txConnectionOpenInitLabel',
  },
  '/ibc.core.connection.v1.MsgConnectionOpenTry': {
    model: MODELS.MsgConnectionOpenTry,
    content: COMPONENTS.ConnectionOpenTry,
    tagTheme: 'yellow',
    tagDisplay: 'txConnectionOpenTryLabel',
  },
  '/ibc.core.connection.v1.ConnectionEnd': {
    model: MODELS.MsgConnectionEnd,
    content: COMPONENTS.ConnectionEnd,
    tagTheme: 'yellow',
    tagDisplay: 'txConnectionEndLabel',
  },
  '/ibc.core.connection.v1.Counterparty': {
    model: MODELS.MsgCounterpartyConnection,
    content: COMPONENTS.CounterpartyConnection,
    tagTheme: 'yellow',
    tagDisplay: 'txCounterpartyLabel',
  },
  '/ibc.core.connection.v1.Version': {
    model: MODELS.MsgVersion,
    content: COMPONENTS.Version,
    tagTheme: 'yellow',
    tagDisplay: 'txVersionLabel',
  },
  // ========================
  // ibc transfer
  // ========================
  '/ibc.applications.transfer.v1.MsgTransfer': {
    model: MODELS.MsgTransfer,
    content: COMPONENTS.Transfer,
    tagTheme: 'orange',
    tagDisplay: 'txTransferLabel',
  },
  // ========================
  // authz
  // ========================
  '/cosmos.authz.v1beta1.MsgGrant': {
    model: MODELS.MsgGrant,
    content: COMPONENTS.Grant,
    tagTheme: 'purple',
    tagDisplay: 'MsgGrant',
  },
  '/cosmos.authz.v1beta1.MsgRevoke': {
    model: MODELS.MsgRevoke,
    content: COMPONENTS.Revoke,
    tagTheme: 'purple',
    tagDisplay: 'MsgRevoke',
  },
  '/cosmos.authz.v1beta1.MsgExec': {
    model: MODELS.MsgExec,
    content: COMPONENTS.Exec,
    tagTheme: 'purple',
    tagDisplay: 'MsgExec',
  },
  // ========================
  // feegrant
  // ========================
  '/cosmos.feegrant.v1beta1.MsgGrantAllowance': {
    model: MODELS.MsgGrantAllowance,
    content: COMPONENTS.GrantAllowance,
    tagTheme: 'blue',
    tagDisplay: 'MsgGrantAllowance',
  },
  '/cosmos.feegrant.v1beta1.MsgRevokeAllowance': {
    model: MODELS.MsgRevokeAllowance,
    content: COMPONENTS.RevokeAllowance,
    tagTheme: 'blue',
    tagDisplay: 'MsgRevokeAllowance',
  },
  // ========================
  // vesting
  // ========================
  '/cosmos.vesting.v1beta1.MsgCreateVestingAccount': {
    model: MODELS.MsgCreateVestingAccount,
    content: COMPONENTS.CreateVestingAccount,
    tagTheme: 'green',
    tagDisplay: 'MsgCreateVestingAccount',
  },
  '/cosmos.vesting.v1beta1.MsgCreatePeriodicVestingAccount': {
    model: MODELS.MsgCreatePeriodicVestingAccount,
    content: COMPONENTS.CreatePeriodicVestingAccount,
    tagTheme: 'green',
    tagDisplay: 'MsgCreatePeriodicVestingAccount',
  },
};
type DefaultTypeToModel = typeof defaultTypeToModel;

// =====================================
// Update your chain's message types here
// =====================================
const customTypeToModel = {
  // '/realionetwork.asset.v1.MsgAuthorizeAddress': {
  //   model: MODELS.MsgTransfer,
  //   content: COMPONENTS.Transfer,
  //   tagTheme: 'four',
  //   tagDisplay: 'txSaveProfileLabel',
  // },
  // '/realionetwork.asset.v1.MsgCreateToken': {
  //   model: MODELS.MsgTransfer,
  //   content: COMPONENTS.Transfer,
  //   tagTheme: 'four',
  //   tagDisplay: 'txDeleteProfileLabel',
  // },
  '/realionetwork.asset.v1.MsgTransferToken': {
    model: MODELS.MsgTransfer,
    content: COMPONENTS.Transfer,
    tagTheme: 'four',
    tagDisplay: 'txCreateRelationshipLabel',
  },
  // '/realionetwork.asset.v1.MsgUnAuthorizeAddress': {
  //   model: MODELS.MsgTransfer,
  //   content: COMPONENTS.Transfer,
  //   tagTheme: 'four',
  //   tagDisplay: 'txRequestDTagTransferLabel',
  // },
  // '/realionetwork.asset.v1.MsgUpdateToken': {
  //   model: MODELS.MsgTransfer,
  //   content: COMPONENTS.Transfer,
  //   tagTheme: 'four',
  //   tagDisplay: 'txAcceptDTagTransferLabel',
  // },
};
type CustomTypeToModel = typeof customTypeToModel;

type TypeToModel = DefaultTypeToModel & CustomTypeToModel extends infer R1
  ? { [K in keyof R1]: R1[K] }
  : never;

type Data = TypeToModel[keyof TypeToModel];

const getDataByType = (type: string): Data | null => {
  if (isKeyOf(type, defaultTypeToModel) && defaultTypeToModel[type])
    return defaultTypeToModel[type];

  if (isKeyOf(type, customTypeToModel) && customTypeToModel[type]) return customTypeToModel[type];

  return null;
};

/**
 * Helper function that helps get model by type
 * @param type Model type
 */
export const getMessageModelByType = (type: string): Data['model'] => {
  const data = getDataByType(type);
  if (data) {
    return data.model;
  }

  return MODELS.MsgUnknown as Data['model'];
};

/**
 * Helper function to correctly display the correct UI
 * @param type Model type
 */
export const getMessageByType = <TMessage,>(message: TMessage, viewRaw: boolean, t: TFunction) => {
  const { type } = (message as { type: string }) ?? {};

  type ResultType = {
    content: FC<{ message: TMessage }>;
    tagDisplay: Data['tagDisplay'];
    tagTheme: TagTheme;
  };

  let results: ResultType = {
    content: COMPONENTS.Unknown as unknown as FC<{ message: TMessage }>,
    tagDisplay: 'txUnknownLabel',
    tagTheme: 'gray',
  };

  const data = getDataByType(type);

  if (data) {
    results = {
      content: data?.content as unknown as FC<{ message: TMessage }>,
      tagDisplay: data.tagDisplay,
      tagTheme: data.tagTheme as ResultType['tagTheme'],
    };
  }

  // If user asks to view the raw data
  if (viewRaw || !results.content) {
    results.content = COMPONENTS.Unknown as unknown as FC<{ message: TMessage }>;
  }

  const Content = results.content;
  return {
    type: <Tag value={t(`message_labels:${results.tagDisplay}`)} theme={results.tagTheme} />,
    message: <Content message={message as unknown as ComponentProps<typeof Content>['message']} />,
  };
};

export const convertMsgsToModels = (
  transaction?: {
    messages?: Array<{
      '@type': string;
    }>;
    logs?: Array<Log>;
  } | null
) => {
  const messages =
    transaction?.messages?.map((msg: object, i: number) => {
      const model = getMessageModelByType(R.pathOr<string>('', ['@type'], msg));
      if (model === MODELS.MsgWithdrawDelegatorReward) {
        const log = transaction?.logs?.[i];
        return MODELS.MsgWithdrawDelegatorReward.fromJson(msg, log);
      }
      if (model === MODELS.MsgWithdrawValidatorCommission) {
        const log = transaction?.logs?.[i];
        return MODELS.MsgWithdrawValidatorCommission.fromJson(msg, log);
      }
      return model.fromJson(msg);
    }) ?? [];

  return messages;
};
