import { HStack, Text, Link, Input, Center, IconButton, Flex } from "@chakra-ui/react";
import { InputGroup } from "../ui/input-group";
import { Search } from "../icons/search";
import { Wallet } from "../icons/wallet";
import { useRecoilValue } from 'recoil';
import { readMarket } from '@/recoil/market';
import { chainConfig } from "@/configs";
import { formatMarket } from "@/utils/format_market";

export default function Header() {
    const marketState = useRecoilValue(readMarket);
    const market = formatMarket(marketState);

    return (
        <Flex w='full' gap='20px' align={'center'} pb='10'>
            <Text fontSize={'32px'} fontWeight={600} flex='1'>Dashboard</Text>
            <HStack divideX={'2px'}>
                <Text fontSize={'16px'}>Supply: {" "}
                    <Link fontWeight={600} color='black' textDecor={'none'}>
                        {market.supply}
                    </Link>{" "}
                </Text>
                <Text fontSize={'16px'} pl='2'>Community Pool: {" "}
                    <Link fontWeight={600} color='black' textDecor={'none'}>
                        {market.communityPool}
                    </Link>{" "}
                </Text>
            </HStack>
            <InputGroup startElement={<Search />} >
                <Input h='60px' borderRadius='60px' fontSize={'16px'} w={{ base: 'full', lg: '550px' }}
                    placeholder="Search for validator / tx hash / block height / address" />
            </InputGroup>
            <Center w='250px' h='60px' borderRadius='60px' fontSize={'16px'} border='1px solid #e4e4e7'>
                {chainConfig.network}
            </Center>
            <IconButton aria-label="connect wallet" rounded='full' bgColor={'#707D8A'} w='60px' h='60px'>
                <Wallet />
            </IconButton>
        </Flex>
    )
}