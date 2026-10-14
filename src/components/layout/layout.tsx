import { Box, Flex, Skeleton, Stack } from "@chakra-ui/react";
import Header from "./header";
import Footer from "./footer";
import PageHeader from "./page-header";
import { useValidatorRecoil } from "@/recoil/validators/hooks";
import { useAssetRecoil } from "@/recoil/asset";
import { useTokenRecoil } from "@/recoil/erc20";

export default function Layout({ children }) {
  useAssetRecoil();
  useTokenRecoil();
  const { loading } = useValidatorRecoil();

  return (
    <Flex direction="column" minH="100vh" bg="explorer.page" color="explorer.text">
      <Header />
      <Box as="main" flex="1" w="full" maxW="1440px" mx="auto" px={{ base: "4", md: "12" }} py={{ base: "6", md: "10" }}>
        {/* Pages that are not redesigned yet have no title of their own. */}
        <PageHeader />
        {loading ? (
          <Stack gap="4">
            <Skeleton h="160px" />
            <Skeleton h="320px" />
          </Stack>
        ) : (
          children
        )}
      </Box>
      <Footer />
    </Flex>
  );
}
