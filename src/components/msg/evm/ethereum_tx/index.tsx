import AppTrans from '@/components/AppTrans';
import { FC } from 'react';
import Name from '@/components/name';
import { MsgEthereumTx } from '@/models';
import { useProfileRecoil } from '@/recoil/profiles/hooks';

const EthereumTx: FC<{ message: MsgEthereumTx }> = (props) => {
  const { message } = props;

  const from = useProfileRecoil(message.from);
  const fromMoniker = from ? from?.name : message.from;
  
  return (
    <AppTrans
      i18nKey="message_contents:txExecuteEthereumTx"
      components={[<Name address={message.from} name={fromMoniker} />, <b />]}
      values={{
        user: message.from,
        hash: message.hash,
      }}
    />
  );
};

export default EthereumTx;
