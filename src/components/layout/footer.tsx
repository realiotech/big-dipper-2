import { VStack, Image, SimpleGrid, GridItem, Text, Link, HStack } from "@chakra-ui/react";
import { LinkedIn } from "../icons/linkedin";
import { Telegram } from "../icons/telegram";
import { Twitter } from "../icons/twitter";
import { Github } from "../icons/github";

export default function Footer() {
    return (
        <SimpleGrid 
            w='full'
            columns={{ base: 1, lg: 6 }}
            my='10'
            px='10'
            py='10'
            divideY={{ base: '2px', lg: '0px'}}
            boxShadow={{ lg: '0px 0px 10px 2px #0000001A'}}
            borderRadius={'20px'}
            >
            <GridItem colSpan={{ base: 1, lg: 3 }} pb='15px'>
                <VStack align='left' gap='20px'>
                    <Image src='/images/logo-full.svg' h='50px' fit='contain' w='min-content' />
                    <Text>
                        Realio Network Explorer
                    </Text>
                </VStack>
            </GridItem>
            <GridItem py={{ base: '15px', lg: '0px' }}>
                <VStack align='left' gap='20px'>
                    <Text color="#707D8A" fontSize='16px' fontWeight={600}>Company</Text>
                    <Link href="https://www.realio.fund" _hover={{ color: "red.700" }} fontWeight={400} color={'black'} fontSize={'14px'}>Realio</Link>
                    <Link href="https://www.realio.fund/rst" _hover={{ color: "red.700" }} fontWeight={400} color={'black'} fontSize={'14px'}>RST</Link>
                    <Link href="https://www.realio.fund/rst/#contact" _hover={{ color: "red.700" }} fontWeight={400} color={'black'} fontSize={'14px'}>Contact Us</Link>
                    <Link href="https://www.realio.fund/blog" _hover={{ color: "red.700" }} fontWeight={400} color={'black'} fontSize={'14px'}>Blog</Link>
                </VStack>
            </GridItem>
            <GridItem py={{ base: '15px', lg: '0px' }}>
                <VStack align='left' gap='20px'>
                    <Text color="#707D8A" fontSize='16px' fontWeight={600}>Application Links</Text>
                    <Link href="https://app.realio.fund/login" _hover={{ color: "red.700" }} fontWeight={400} color={'black'} fontSize={'14px'}>Realio Platform</Link>
                    <Link href="https://realio.network" _hover={{ color: "red.700" }} fontWeight={400} color={'black'} fontSize={'14px'}>Realio Network</Link>
                    <Link href="https://defi.realio.network" _hover={{ color: "red.700" }} fontWeight={400} color={'black'} fontSize={'14px'}>Realio DeFi</Link>
                    <Link href="https://districts.xyz/" _hover={{ color: "red.700" }} fontWeight={400} color={'black'} fontSize={'14px'}>Districts</Link>
                </VStack>
            </GridItem>
            <GridItem py={{ base: '15px', lg: '0px' }}>
                <VStack align='left' gap='20px'>
                    <Text color="#707D8A" fontSize='16px' fontWeight={600}>Community</Text>
                    <HStack gap='4'>
                        <Link href="https://t.me/realio_fund" fontSize={'20px'}><LinkedIn /></Link>
                        <Link href="https://www.linkedin.com/company/realio/" fontSize={'20px'}><Telegram /></Link>
                        <Link href="https://x.com/realio_network" fontSize={'20px'}><Twitter /></Link>
                        <Link href="https://github.com/realiotech" fontSize={'20px'}><Github /></Link>
                    </HStack>
                </VStack>
            </GridItem>
        </SimpleGrid>
    )
}