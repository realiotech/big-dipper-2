const REALIO_URL = 'https://www.realio.fund';
const REALIO_APP_URL = 'https://app.realio.fund/login';
const REALIO_NETWORK_URL = 'https://realio.network';
const REALIO_GENESIS_URL = 'https://genesis.realio.network';
const REALIOVERSE_URL = 'https://metaverse.realio.network';

export const donateLink = {
  key: 'donate',
  url: `${REALIO_APP_URL}/donate`,
};

export const footerLinks = [
  {
    key: 'company',
    links: [
      {
        key: 'realio',
        url: REALIO_URL,
      },
      {
        key: 'rst',
        url: `${REALIO_URL}/rst`,
      },
      {
        key: 'contact',
        url: `${REALIO_URL}/#contact`,
      },
      {
        key: 'blog',
        url: `${REALIO_URL}/blog`,
      },
    ],
  },
  {
    key: 'applicationLinks',
    links: [
      {
        key: 'realioPlatform',
        url: `${REALIO_APP_URL}`,
      },
      {
        key: 'realioNetwork',
        url: `${REALIO_NETWORK_URL}`,
      },
      {
        key: 'realioDefi',
        url: `${REALIO_GENESIS_URL}`,
      },
      {
        key: 'realioVerse',
        url: `${REALIOVERSE_URL}`,
      },
    ],
  },
];
