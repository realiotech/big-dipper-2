const REALIO_URL = 'https://www.realio.fund';
const BIG_DIPPER_URL = 'https://bigdipper.live';

export const donateLink = {
  key: 'donate',
  url: `${BIG_DIPPER_URL}/donate`,
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
    key: 'bigDipper',
    links: [
      {
        key: 'about',
        url: `${BIG_DIPPER_URL}/#about`,
      },
      {
        key: 'faq',
        url: `${BIG_DIPPER_URL}/faq`,
      },
      {
        key: 'termsAndConditions',
        url: `${BIG_DIPPER_URL}/terms-and-conditions`,
      },
      {
        key: 'privacyPolicy',
        url: `${BIG_DIPPER_URL}/privacy-policy`,
      },
    ],
  },
];
