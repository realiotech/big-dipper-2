import {
  Text, Flex,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';

export default function PageHeader() {
  const { pathname } = useRouter();

  // Map routes to titles
  const getTitle = () => {
    switch (pathname) {
      case '/':
        return 'Dashboard';
      case '/blocks':
        return 'Blocks';
      case '/validators':
        return 'Validators';
      case '/transactions':
        return 'Transactions';
      case '/proposals':
        return 'Proposals';
      case '/params':
        return 'Parameters';
      default:
        if (pathname.startsWith('/blocks/')) return 'Block Details';
        if (pathname.startsWith('/validators/')) return 'Validator Details';
        if (pathname.startsWith('/transactions/')) return 'Transaction Details';
        if (pathname.startsWith('/proposals/')) return 'Proposal Details';
        return 'Dashboard';
    }
  };

  return (
    <Flex w="full" align="center" pb="10">
      <Text fontSize="32px" fontWeight={600}>
        {getTitle()}
      </Text>
    </Flex>
  );
}
