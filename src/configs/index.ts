import chainConfigTestnet from './chain_config.testnet.json';
import chainConfigMainnet from './chain_config.mainnet.json';
import generalConfig from './general_config.json';
import searchDataTestnet from './search_data.testnet.json';
import searchDataMainnet from './search_data.mainnet.json';
/**
 * Helper function to return different configs based on the same chain
 * @returns config
 */
const getChainConfig = () => {
  const chainType = process.env.NEXT_PUBLIC_CHAIN_TYPE || process.env.NEXT_PUBLIC_CHAIN_STATUS;
  if (chainType === 'mainnet') {
    return chainConfigMainnet;
  }
  return chainConfigTestnet;
};

const chainConfig = getChainConfig();

const getSearchData = () => {
  const chainType = process.env.NEXT_PUBLIC_CHAIN_TYPE || process.env.NEXT_PUBLIC_CHAIN_STATUS;
  if (chainType === 'mainnet') {
    return searchDataMainnet;
  }
  return searchDataTestnet;
};

const searchData = getSearchData();

export {
  chainConfig,
  searchData,
  generalConfig,
};
