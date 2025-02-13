import {
  Text
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { useMemo } from 'react';

export default function PageHeader() {
  const { pathname } = useRouter();

  // Map routes to titles
  const getTitle = useMemo(() => {
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
        if (pathname.startsWith('/accounts/')) return 'Account Details';
        if (pathname.startsWith('/assets/')) return 'Assets Details';
        return 'Dashboard';
    }
  }, [pathname]);

  return (
    <Text fontSize="32px" fontWeight={600} flex="1">
      {getTitle}
    </Text>
  );
}
