import { Text } from '@chakra-ui/react';
import AppTrans from '@/components/AppTrans';
import { FC } from 'react';
import Name from '@/components/name';
import { MsgTransfer } from '@/models';
import { useProfileRecoil } from '@/recoil/profiles/hooks';
import { formatNumber, formatToken } from '@/utils/format_token';

const Transfer: FC<{ message: MsgTransfer }> = (props) => {
  const { message } = props;

  const sender = useProfileRecoil(message.sender);
  const senderMoniker = sender ? sender?.name : message.sender;
  const receiver = useProfileRecoil(message.receiver);
  const receiverMoniker = receiver ? receiver?.name : message.receiver;
  const tokenFormatDenom = formatToken(message.token?.amount, message.token?.denom);
  const token = `${formatNumber(
    tokenFormatDenom.value,
    tokenFormatDenom.exponent
  )} ${tokenFormatDenom.displayDenom.toUpperCase()}`;

  return (
    <Text>
      <AppTrans
        i18nKey="message_contents:txTransferContent"
        components={[
          <Name address={message.sender} name={senderMoniker} />,
          <Name address={message.receiver} name={receiverMoniker} />,
          <b />,
        ]}
        values={{
          token,
          sourceChannel: message.sourceChannel,
        }}
      />
    </Text>
  );
};

export default Transfer;
