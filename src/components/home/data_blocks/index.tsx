import { GridItem, SimpleGrid, Text } from "@chakra-ui/react";
import { useDataBlocks } from "./hooks";
import numeral from 'numeral';
// import TokenPriceChart from "@/components/dashboard/price-chart";
// import Blocks from "@/components/dashboard/blocks";

export default function DataBlocks() {
    const { state } = useDataBlocks();

    return (
        <>
            <GridItem borderRadius='20px' bgColor='#F6F7F8' py='5' px='8'>
                <Text fontSize='14px' pb='3'>
                    Latest Block
                </Text>
                <Text fontSize='32px' fontWeight={600}>
                    {numeral(state.blockHeight).format('0,0')}
                </Text>
            </GridItem>
            <GridItem borderRadius='20px' bgColor='#F6F7F8' py='5' px='8'>
                <Text fontSize='14px' pb='3'>
                    Average Block Time
                </Text>
                <Text fontSize='32px' fontWeight={600}>
                    {numeral(state.blockTime).format('0.00')} s
                </Text>
            </GridItem>
            <GridItem borderRadius='20px' bgColor='#F6F7F8' py='5' px='8'>
                <Text fontSize='14px' pb='3'>
                    Price
                </Text>
                <Text fontSize='32px' fontWeight={600}>
                    {state.price !== null ? `$${numeral(state.price).format('0.00')}` : 'N/A'}
                </Text>
            </GridItem>
            <GridItem borderRadius='20px' bgColor='#F6F7F8' py='5' px='8'>
                <Text fontSize='14px' pb='3'>
                    Active Validators
                </Text>
                <Text fontSize='32px' fontWeight={600}>
                    {numeral(state.validators.active).format('0,0')}
                </Text>
            </GridItem>
        </>
    );
}
