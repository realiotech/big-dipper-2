import { Text } from '@chakra-ui/react';
import AppTrans from '@/components/AppTrans';
import { FC } from 'react';
import Name from '@/components/name';
import { type MsgReceivePacket } from '@/models';
import { useProfileRecoil } from '@/recoil/profiles/hooks';

const ReceivePacket: FC<{ message: MsgReceivePacket }> = (props) => {
  const { message } = props;

  const signer = useProfileRecoil(message.signer);
  const signerMoniker = signer ? signer?.name : message.signer;

  return (
    <Text>
      <AppTrans
        i18nKey="message_contents:txReceivePacketContent"
        components={[<Name address={message.signer} name={signerMoniker} />, <b />]}
        values={{
          sourceChannel: message.sourceChannel,
          destinationChannel: message.destinationChannel,
        }}
      />
    </Text>
  );
};

export default ReceivePacket;
