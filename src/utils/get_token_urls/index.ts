import { searchData } from '@/configs';
import { ERC20_DETAILS } from '@/utils/go_to_page';

/**
 * Get the URL for Districts Token based on current environment
 * @returns Districts Token URL
 */
export const getDistrictsTokenUrl = (): string => {
  const tokenData = searchData.dstrx;
  if (tokenData?.value) {
    return ERC20_DETAILS(tokenData.value);
  }
  // Fallback to mainnet address if search data is not available
  return ERC20_DETAILS('0xb841F365D5221Bed66d60E69094418D8C2aa5A44');
};
