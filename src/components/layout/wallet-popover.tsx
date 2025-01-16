import {
    Box,
    Flex,
    Text,
    VStack,
    Button,
    HStack,
    IconButton,
    StackSeparator,
  } from "@chakra-ui/react";
  import {
    PopoverRoot,
    PopoverTrigger,
    PopoverContent,
    PopoverArrow,
    PopoverBody,
  } from "@/components/ui/popover";
  import { Wallet } from "../icons/wallet";
  import { IoCloseOutline } from "react-icons/io5";
  import { FaCheckCircle } from "react-icons/fa";
  import { useState } from "react";
  import { useKeplrConnect } from "@/recoil/wallet/hooks";
  
  const WalletPopover = () => {
    const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
    const { connectKeplr } = useKeplrConnect(); // Use the Keplr connection hook
  
    const wallets = [
      { id: "keplr", label: "Keplr", iconBg: "blue.500", shortName: "K" },
      { id: "leap", label: "Leap Wallet", iconBg: "green.500", shortName: "L" },
      { id: "ledger", label: "Ledger", iconBg: "black", shortName: "L" },
    ];
  
    const handleWalletSelect = (walletId: string) => {
      setSelectedWallet(walletId);
    };
  
    const handleConnect = async () => {
      if (selectedWallet === "keplr") {
        await connectKeplr();
      } else {
        console.log("Selected wallet not supported:", selectedWallet);
      }
    };
  
    return (
      <PopoverRoot lazyMount unmountOnExit>
        <PopoverTrigger asChild>
          <IconButton
            aria-label="connect wallet"
            rounded="full"
            bgColor="#707D8A"
            w="60px"
            h="60px"
          >
            <Wallet />
          </IconButton>
        </PopoverTrigger>
        <PopoverContent w="400px">
          <PopoverArrow />
          <PopoverBody>
            {/* Header */}
            <Flex justify="space-between" align="center" mb={4}>
              <Text fontSize="lg" fontWeight="bold">
                Connect Wallet
              </Text>
              <PopoverTrigger style={{ cursor: "pointer" }}>
                <IoCloseOutline size={30} />
              </PopoverTrigger>
            </Flex>
            <StackSeparator />
  
            {/* Wallet Options */}
            <VStack align="stretch" mt={4}>
              {wallets.map((wallet) => (
                <HStack
                  key={wallet.id}
                  p={4}
                  border="1px solid"
                  borderColor={
                    selectedWallet === wallet.id ? "black" : "#E2E8F0"
                  }
                  borderRadius="md"
                  justify="space-between"
                  align="center"
                  cursor="pointer"
                  onClick={() => handleWalletSelect(wallet.id)}
                >
                  <HStack>
                    <Box
                      bg={wallet.iconBg}
                      w="30px"
                      h="30px"
                      borderRadius="full"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      color="white"
                      fontWeight="bold"
                    >
                      {wallet.shortName}
                    </Box>
                    <Text fontSize="md" fontWeight="medium">
                      {wallet.label}
                    </Text>
                  </HStack>
                  {selectedWallet === wallet.id && (
                    <FaCheckCircle color="green" />
                  )}
                </HStack>
              ))}
            </VStack>
  
            {/* Connect Button */}
            <Button
              mt={6}
              w="full"
              bg="#707D8A"
              color="white"
              _hover={{ bg: "#505D6A" }}
              onClick={handleConnect}
            >
              Connect Wallet
            </Button>
          </PopoverBody>
        </PopoverContent>
      </PopoverRoot>
    );
  };
  
  export default WalletPopover;
  
  

{
  /* Wallet Info */
}
{
  /* <VStack align="stretch" >
                  <Text fontSize="lg" fontWeight="bold">
                    Keplr
                  </Text>
                  <Box>
                    <Text fontSize="sm" color="gray.600">
                      Cosmos Address:
                    </Text>
                    <Text fontSize="sm" fontWeight="bold">
                      realio13zz4mvgwmppzlnve09zshqlf4r2x4uqtwf6ckzk
                    </Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.600">
                      EVM Address:
                    </Text>
                    <Text fontSize="sm" fontWeight="bold">
                      0xF728E158B7F00bB2B3A140D125C5a45E54b64aDB
                    </Text>
                  </Box>
                  <HStack >
                    <Button size="sm" variant="outline" w="full">
                      Profile
                    </Button>
                    <Button
                      size="sm"
                      colorScheme="red"
                      variant="solid"
                      w="full"
                    //   leftIcon={<FiLogOut />}
                    >
                      Disconnect
                    </Button>
                  </HStack>
                </VStack> */
}
