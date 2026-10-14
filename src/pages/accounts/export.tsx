import type { GetServerSideProps } from 'next';
import { ACCOUNT_DETAILS } from '@/utils/go_to_page';

/**
 * The old standalone export page. Exports now live on each account's Activity
 * tab, so `/accounts/export?a=<address>` forwards there.
 */
export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const address = typeof query.a === 'string' ? query.a.trim() : '';
  return {
    redirect: { destination: address ? ACCOUNT_DETAILS(address) : '/accounts', permanent: false },
  };
};

export default function ExportTransactionsRedirect() {
  return null;
}
