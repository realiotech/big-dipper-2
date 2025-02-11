import {
  HStack,
  Text,
  Link,
  Input,
  Center,
  Flex,
  useBreakpointValue,
  Image,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import { chainConfig } from '@/configs';
import { Search } from '../icons/search';
import { InputGroup } from '../ui/input-group';
import MenuDrawer from './menudrawer';
import SearchBar from './search';
import PageHeader from './page-header';
import WalletPopover from './wallet-popover';
import { useColorMode } from "../ui/color-mode";

export default function Header() {
  const isMobile = useBreakpointValue({
    base: true, lg: false,
  });
  const { colorMode } = useColorMode()

  return !isMobile ? (
    <Flex w="full" gap="20px" align="center" pb="10" direction="column">
      <HStack w="full">
        <PageHeader />
        <SearchBar />
        <Center
          w="250px"
          h="60px"
          borderRadius="60px"
          fontSize="16px"
          border={{base: '1px solid #707D8A', _dark: '1px solid white'}}
        >
          {chainConfig.network}
        </Center>
        {/* <IconButton
          aria-label="connect wallet"
          rounded="full"
          bgColor="#707D8A"
          w="60px"
          h="60px"
        >
          <Wallet />
        </IconButton> */}
        <WalletPopover/>
      </HStack>
    </Flex>
  ) : (
    <Flex flexDirection="column" w="full" gap="20px" align="center" pb="10">
      <Flex w="full" gap="10px" align="center" pb="2">
        <Link asChild outline="none">
          <NextLink href="/">
          {colorMode == 'light' ? <Image w='50px' src="/images/logo.svg" /> : <Image w='50px' src="/images/logo_white.svg" />}
          </NextLink>
        </Link>
        <Text fontSize="20px" fontWeight={600} flex="1">
          Realio
        </Text>

        <Center
          w="200px"
          h="45px"
          borderRadius="60px"
          fontSize="12px"
          border="1px solid #e4e4e7"
        >
          {chainConfig.network}
        </Center>
        <MenuDrawer />
      </Flex>
      <InputGroup
        w="full"
        maxW={{
          base: '100%', lg: '550px',
        }}
        startElement={<Search />}
      >
        <Input
          h="50px"
          borderRadius="60px"
          fontSize="12px"
          border={{base: '1px solid #707D8A', _dark: '1px solid white'}}
          
          w={{
            base: 'full', lg: '550px',
          }}
          placeholder="Search for validator / tx hash / block height / address"
        />
      </InputGroup>
    </Flex>
  );
}
