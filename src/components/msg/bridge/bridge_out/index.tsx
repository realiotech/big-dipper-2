import { Text } from '@chakra-ui/react';
import AppTrans from '@/components/AppTrans';
import { FC } from 'react';
import Name from '@/components/name';
import { type MsgBridgeOut } from '@/models';
import { useProfileRecoil } from '@/recoil/profiles/hooks';
import { formatNumber, formatToken } from '@/utils/format_token';

const BridgeOut: FC<{ message: MsgBridgeOut }> = (props) => {
  const { message } = props;
  const signer = useProfileRecoil(message.signer);
  const signerMoniker = signer ? signer?.name : message.signer;

  const amount = formatToken(message.coin?.amount, message.coin?.denom);

  const parsedAmount = `${formatNumber(
    amount.value,
    amount.exponent
  )} ${amount.displayDenom.toUpperCase()}`;

  return (
    <Text>
      <AppTrans
        i18nKey="message_contents:txBridgeOutContent"
        components={[
          <Name address={message.signer} name={signerMoniker} />,
        ]}
        values={{
          coin: parsedAmount,
        }}
      />
    </Text>
  );
};

export default BridgeOut;
