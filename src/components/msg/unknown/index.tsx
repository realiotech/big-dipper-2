import { FC } from 'react';
import { type MsgUnknown } from '@/models';
import { Box } from '@chakra-ui/react';

const Unknown: FC<{ message: MsgUnknown }> = (props) => {
  const { message } = props;

  return (
    <Box
      bg={{ base: 'white', _dark: '#262626' }}
      p={4}
      borderRadius="md"
      overflow="auto"
      maxW="100%"
      whiteSpace="pre-wrap"
      wordBreak="break-word"
      fontFamily="monospace"
      fontSize={{ base: 'xs', md: 'sm' }}
    >
      <code>{JSON.stringify(message.json, null, '\t')}</code>
    </Box>
  );
};

export default Unknown;
