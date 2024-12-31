import { Box, Flex, VStack, useBreakpointValue } from "@chakra-ui/react";
import Sidebar from "./sidebar";
import Header from "./header";
import Footer from "./footer";
import { Skeleton } from "../ui/skeleton";
import { useMarketRecoil } from "@/recoil/market";
import { useValidatorRecoil } from "@/recoil/validators/hooks";

export default function Layout({ children }) {
  useMarketRecoil();
  const { loading } = useValidatorRecoil();
  const isCompact = useBreakpointValue({ base: true, sm: false });
  return (
    <Flex
      bgColor="white"
      minH="100vh"
      color="black"
      pt={{ base: "15px", md: "50px" }}
      px={{ base: "15px", md: "50px" }}
    >
      {!isCompact ? (
        <>
          <Sidebar />
          <VStack w="full">
            <Header />
            {loading ? (
              <Skeleton height={400} />
            ) : (
              <Box w="full">{children}</Box>
            )}
            <Footer />
          </VStack>
          )
        </>
      ) : (
        <VStack w="full">
          <Header />
          {loading ? <Skeleton height={400} /> : <Box w="full">{children}</Box>}
          <Footer />
        </VStack>
      )}
    </Flex>
  );
}
