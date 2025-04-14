import NextLink from 'next/link';
import { Avatar } from '../ui/avatar';
import { Tooltip } from '@/components/ui/tooltip';
import { Flex, Link, Text } from '@chakra-ui/react';
const Erc20 = ({
    address,
    name,
    image
}) => {
    return (
        <Link asChild colorPalette='blue'>
            <NextLink href={`/erc20/${address}`}>
                <Tooltip content={address}>
                    <Flex align={'center'} gap='2'>
                        <Avatar src={image} alt={name} size='xs' />
                        <Text>{name}</Text>
                    </Flex>
                </Tooltip>
            </NextLink>
        </Link>

    );
};

export default Erc20;
