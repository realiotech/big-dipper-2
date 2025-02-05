import { VStack, Image, SimpleGrid, GridItem, Text, Link, HStack } from "@chakra-ui/react";
import { LinkedIn } from "../icons/linkedin";
import { Telegram } from "../icons/telegram";
import { Twitter } from "../icons/twitter";
import { Github } from "../icons/github";
import { useColorMode } from "../ui/color-mode";
import { FaDiscord, FaDochub } from "react-icons/fa";
export default function Footer() {
    const { colorMode } = useColorMode()

    return (
        <SimpleGrid 
            w='full'
            columns={{ base: 1, lg: 6 }}
            my='10'
            px='10'
            py='10'
            divideY={{ base: '2px', lg: '0px'}}
            boxShadow={{base: '0px 0px 10px 2px #0000001A' , lg: '0px 0px 10px 2px #0000001A'}}
            borderRadius={'20px'}
            bg={{base: 'white', _dark: '#0F0F0F'}}
            >
            <GridItem colSpan={{ base: 1, lg: 3 }} pb='15px'>
                <VStack align='left' gap='20px'>
                    {colorMode == 'light' ? <Image  src='/images/logo-full.svg' h='50px' fit='contain' w='min-content' /> : <Image  src='/images/logo-full-white.svg' h='50px' fit='contain' w='min-content' />}
                    <Text>
                        Realio Network Explorer
                    </Text>
                </VStack>
            </GridItem>
            <GridItem py={{ base: '15px', lg: '0px' }}>
                <VStack color={{base: "#707D8A", _dark: "#9DA7B0"}} align='left' gap='20px'>
                    <Text color={{base: "#707D8A", _dark: "#9DA7B0"}} fontSize='16px' fontWeight={600}>Realio Tokens</Text>
                    <Link color={{base: 'black', _dark: 'white'}} href="" _hover={{ color: "#173DA6" }} fontWeight={400} fontSize={'14px'}>Liquid Mining Fund</Link>
                    <Link href="" _hover={{ color: "#173DA6" }} fontWeight={400} color={{base: 'black', _dark: 'white'}} fontSize={'14px'}>Realio Network Token</Link>
                    <Link href="" _hover={{ color: "#173DA6" }} fontWeight={400} color={{base: 'black', _dark: 'white'}} fontSize={'14px'}>Realio Network, LTD</Link>
                </VStack>
            </GridItem>
            <GridItem py={{ base: '15px', lg: '0px' }}>
                <VStack align='left' gap='20px'>
                    <Text color={{base: "#707D8A", _dark: "#9DA7B0"}} fontSize='16px' fontWeight={600}>Realio Websites</Text>
                    <Link href="https://realio.network" _hover={{ color: "#173DA6" }} fontWeight={400} color={{base: 'black', _dark: 'white'}} fontSize={'14px'}>Realio Network</Link>
                    <Link href="https://realio.fund/" _hover={{ color: "#173DA6" }} fontWeight={400} color={{base: 'black', _dark: 'white'}} fontSize={'14px'}>Realio Fund</Link>
                    <Link href="https://liquidmining.fund/" _hover={{ color: "#173DA6" }} fontWeight={400} color={{base: 'black', _dark: 'white'}} fontSize={'14px'}>Liquid Mining Fund</Link>
                    <Link href="https://freehold.finance/" _hover={{ color: "#173DA6" }} fontWeight={400} color={{base: 'black', _dark: 'white'}} fontSize={'14px'}>Freehold</Link>
                    <Link href="https://districts.xyz/" _hover={{ color: "#173DA6" }} fontWeight={400} color={{base: 'black', _dark: 'white'}} fontSize={'14px'}>Districts</Link>
                </VStack>
            </GridItem>
            <GridItem py={{ base: '15px', lg: '0px' }}>
                <VStack align='left' gap='20px'>
                    <Text color={{base: "#707D8A", _dark: "#9DA7B0"}} fontSize='16px' fontWeight={600}>Community</Text>
                    <HStack  gap='4' color={{base: "white", _dark: "black"}} >
                        <Link href="https://www.linkedin.com/company/realio" fontSize={'20px'}><LinkedIn /></Link>
                        <Link href="https://discord.com/invite/WhRgHEfDF4" fontSize={'20px'}><FaDiscord /></Link>
                        <Link href="https://x.com/realio_network" fontSize={'20px'}><Twitter /></Link>
                        <Link href="https://github.com/realiotech" fontSize={'20px'}><Github /></Link>
                        <Link href="https://docs.realio.network/" fontSize={'20px'}><FaDochub /></Link>
                    </HStack>
                </VStack>
            </GridItem>
        </SimpleGrid>
    )
}