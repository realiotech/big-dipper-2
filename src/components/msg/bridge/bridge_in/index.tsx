import { Text } from '@chakra-ui/react';
import AppTrans from '@/components/AppTrans';
import { FC } from 'react';
import Name from '@/components/name';
import { type MsgBridgeIn } from '@/models';
import { useProfileRecoil } from '@/recoil/profiles/hooks';
import { formatNumber, formatToken } from '@/utils/format_token';

const BridgeIn: FC<{ message: MsgBridgeIn }> = (props) => {
  const { message } = props;
  const authority = useProfileRecoil(message.authority);
  const authorityMoniker = authority ? authority?.name : message.authority;

  const receiver = useProfileRecoil(message.receiver);
  const receiverMoniker = receiver ? receiver?.name : message.receiver;

  const amount = formatToken(message.coin?.amount, message.coin?.denom);

  const parsedAmount = `${formatNumber(
    amount.value,
    amount.exponent
  )} ${amount.displayDenom.toUpperCase()}`;

  return (
    <Text>
      <AppTrans
        i18nKey="message_contents:txBridgeInContent"
        components={[
          <Name address={message.authority} name={authorityMoniker} />,
          <b />,
          <Name address={message.receiver} name={receiverMoniker} />,
        ]}
        values={{
          authority: message.authority,
          receiver: message.receiver,
          coin: parsedAmount,
        }}
      />
    </Text>
  );
};

export default BridgeIn;
