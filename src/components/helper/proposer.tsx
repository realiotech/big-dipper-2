import NextLink from 'next/link';
import { Avatar } from '../ui/avatar';
import { Tooltip } from '@/components/ui/tooltip';
import { Flex, Link, Text } from '@chakra-ui/react';
import { shortenString } from '@/utils/shorten';
import { ADDRESS_DETAILS } from '@/utils';
const Proposer = ({
    address,
    name,
    image
}) => {
    return (
        <Link asChild colorPalette='blue'>
            <NextLink href={ADDRESS_DETAILS(address)}>
                <Tooltip content={address}>
                    <Flex align={'center'} gap='2'>
                        <Avatar src={image} alt={name} size='xs' />
                        <Text>{shortenString(name, 20)}</Text>
                    </Flex>
                </Tooltip>
            </NextLink>
        </Link>

    );
};

export default Proposer;
