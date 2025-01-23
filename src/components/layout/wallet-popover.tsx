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
  import { AiOutlineLoading } from "react-icons/ai";
  import { useState } from "react";
  import { useKeplrConnect } from "@/recoil/wallet/hooks";
  import { useRecoilValue } from "recoil";
  import { atomState } from "@/recoil/wallet/atom";
  import styles from './wallet-popover.module.css'; 
  
  const WalletPopover = () => {
    const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { connectKeplr, disconnectKeplr, triggerWalletConnectPopover } = useKeplrConnect(); 
    const wallet = useRecoilValue(atomState);
  
    const wallets = [
      { id: "keplr", label: "Keplr", iconBg: "blue.500", shortName: "K" },
      { id: "leap", label: "Leap Wallet", iconBg: "green.500", shortName: "L", disabled: true },
      { id: "ledger", label: "Ledger", iconBg: "black", shortName: "L", disabled: true },
    ];
  
    const handleWalletSelect = (walletId: string) => {
      setSelectedWallet(walletId);
    };
  
    const handleConnect = async () => {
      if (selectedWallet === "keplr") {
        setIsLoading(true);
        await connectKeplr();
        setIsLoading(false);
      } else {
        console.log("Selected wallet not supported:", selectedWallet);
      }
    };
  
    return (
      <PopoverRoot open={wallet.openWalletConnectPopover} onOpenChange={triggerWalletConnectPopover} lazyMount unmountOnExit>
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
                {wallet?.walletSelection ? wallet.walletSelection : "Connect Wallet"}
              </Text>
              <PopoverTrigger style={{ cursor: "pointer" }}>
                <IoCloseOutline size={30} />
              </PopoverTrigger>
            </Flex>
            <StackSeparator />
  
            {/* Wallet Options */}
            {wallet?.walletAddress ? (
              <VStack align="stretch" mt={4}>
                <Box>
                  <Text fontSize="sm" color="gray.600">
                    Cosmos Address:
                  </Text>
                  <Text fontSize="sm" fontWeight="bold">
                    {wallet.walletAddress}
                  </Text>
                </Box>
                <HStack>
                  <Button size="sm" bg={"#707D8A"} onClick={disconnectKeplr} variant="solid" w="full">
                    Disconnect
                  </Button>
                </HStack>
              </VStack>
            ) : (
              <>
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
                      cursor={wallet.disabled ? "not-allowed" : "pointer"}
                      opacity={wallet.disabled ? 0.5 : 1}
                      onClick={() => !wallet.disabled && handleWalletSelect(wallet.id)}
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
                        <FaCheckCircle className="spin"  color="green" />
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
                  isDisabled={selectedWallet !== "keplr"}
                  cursor={selectedWallet === "keplr" ? "pointer" : "not-allowed"}
                >
                      {isLoading ? <AiOutlineLoading className={styles.spin} /> : "Connect Wallet"}
                </Button>
              </>
            )}
          </PopoverBody>
        </PopoverContent>
      </PopoverRoot>
    );
  };
  
  export default WalletPopover;
