
import { Box, Flex, VStack } from "@chakra-ui/react"
import Sidebar from "./sidebar";
import Header from "./header";
import Footer from "./footer";
import { useMarketRecoil } from '@recoil/market';

export default function Layout({ children }) {
    useMarketRecoil();

    return (
        <Flex
            bgColor='white'
            minH='100vh'
            color='black'
            pt='50px'
            px='50px'
        >
            <Sidebar />
            <VStack w='full'>
                <Header />
                <Box w='full'>
                    {children}
                </Box>
                <Footer />
            </VStack>
        </Flex>
    )
}