import { Text } from '@chakra-ui/react';
import AppTrans from '@/components/AppTrans';
import { FC } from 'react';
import Name from '@/components/name';
import { type MsgConnectionOpenAck } from '@/models';
import { useProfileRecoil } from '@/recoil/profiles/hooks';

const ConnectionOpenAck: FC<{ message: MsgConnectionOpenAck }> = (props) => {
  const { message } = props;

  const signer = useProfileRecoil(message.signer);
  const signerMoniker = signer ? signer?.name : message.signer;

  return (
    <Text>
      <AppTrans
        i18nKey="message_contents:txConnectionOpenAckContent"
        components={[<Name address={message.signer} name={signerMoniker} />, <b />]}
        values={{
          connectionId: message.connectionId,
          counterpartyConnectionId: message.counterpartyConnectionId,
        }}
      />
    </Text>
  );
};

export default ConnectionOpenAck;
