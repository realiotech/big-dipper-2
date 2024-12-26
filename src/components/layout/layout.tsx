
import { Box, Flex, VStack } from "@chakra-ui/react"
import Sidebar from "./sidebar";
import Header from "./header";
import Footer from "./footer";
import { Skeleton } from "../ui/skeleton";
import { useMarketRecoil } from "@/recoil/market";
import { useValidatorRecoil } from "@/recoil/validators/hooks";

export default function Layout({ children }) {
    useMarketRecoil
    const { loading } = useValidatorRecoil()
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
                {loading ?
                    <Skeleton height={400} /> :
                    <Box w='full'>
                        {children}
                    </Box>
                }
                <Footer />
            </VStack>
        </Flex>
    )
}