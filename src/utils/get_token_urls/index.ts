import { chainConfig, searchData } from '@/configs';
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
  // Fall back to this network's DSTRX contract if search data is not available.
  return ERC20_DETAILS(chainConfig.dstrxAddress);
};
