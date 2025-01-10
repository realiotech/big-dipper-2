import NextLink from 'next/link';
import { Avatar } from '../ui/avatar';
import { Tooltip } from '@/components/ui/tooltip';
import { Flex, Link, Text } from '@chakra-ui/react';
const Asset = ({
    denom,
    name,
    image
}) => {
    return (
        <Link asChild colorPalette='blue'>
            <NextLink href={`/assets/${denom}`}>
                <Tooltip content={denom}>
                    <Flex align={'center'} gap='2'>
                        <Avatar src={image} alt={name} size='xs' />
                        <Text>{name}</Text>
                    </Flex>
                </Tooltip>
            </NextLink>
        </Link>

    );
};

export default Asset;
