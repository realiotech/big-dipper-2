import {
  Text
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { useMemo } from 'react';

// Redesigned pages render their own title and breadcrumbs.
const REDESIGNED = new Set(['/', '/blocks', '/blocks/[height]']);

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
        return 'Governance';
      case '/chart':
        return 'Charts and stats';
      case '/params':
        return 'Chain parameters';
      default:
        if (pathname.startsWith('/blocks/')) return 'Block Details';
        if (pathname.startsWith('/validators/')) return 'Validator Details';
        if (pathname.startsWith('/transactions/')) return 'Transaction Details';
        if (pathname.startsWith('/proposals/')) return 'Proposal Details';
        if (pathname.startsWith('/accounts/')) return 'Account Details';
        if (pathname.startsWith('/assets/')) return 'Assets Details';
        return '';
    }
  }, [pathname]);

  if (!getTitle || REDESIGNED.has(pathname)) return null;

  return (
    <Text as="h1" fontSize={{ base: "24px", md: "28px" }} fontWeight={600} letterSpacing="-0.02em" color="explorer.text" mb="6">
      {getTitle}
    </Text>
  );
}
