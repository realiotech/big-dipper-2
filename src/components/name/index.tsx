import NextLink from 'next/link';
import { FC } from 'react';
import { ADDRESS_DETAILS } from '@/utils/go_to_page';
import { Link } from '@chakra-ui/react';

type NameProps = {
  className?: string;
  address: string;
  name: string;
  href?: (address: string) => string;
};

const Name: FC<NameProps> = ({ address, name, href = ADDRESS_DETAILS }) => {
  return (
    <Link asChild colorPalette={'blue'}>
      <NextLink shallow href={href(address)}>
        {name}
      </NextLink>
    </Link>
  );
};

export default Name;
