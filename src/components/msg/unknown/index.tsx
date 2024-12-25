import { FC } from 'react';
import { type MsgUnknown } from '@/models';

const Unknown: FC<{ message: MsgUnknown }> = (props) => {
  const { message } = props;

  return (
    <pre>
      <code>{JSON.stringify(message.json, null, '\t')}</code>
    </pre>
  );
};

export default Unknown;
