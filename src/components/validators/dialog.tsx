import { Button } from "@/components/ui/button";
import {
  Box,
  Input,
  Text,
  VStack,
  Flex,
  InputAddon,
  Group,
  PopoverRoot,
} from "@chakra-ui/react";
import {
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PopoverTrigger } from "@/components/ui/popover";
import { IoCloseOutline } from "react-icons/io5";
import { useState } from "react";
import { createDelegateTx } from "@/utils/delegate_transaction";
import { useRecoilValue } from "recoil";
import { atomState } from "@/recoil/wallet/atom";
import { useKeplrConnect } from "@/recoil/wallet/hooks";
import { AiOutlineLoading } from "react-icons/ai";
import styles from "../layout/wallet-popover.module.css";
import openNotification from "@/utils/notifications";
import { ToastContainer } from "react-toastify";


export const DelegateDialog = ({
  denom,
  denomSymbol,
  decimal,
  operatorName,
  operatorAddress,
}) => {
  const wallet = useRecoilValue(atomState);
  const { triggerWalletConnectPopover, reloadBalances } = useKeplrConnect();
  const [formData, setFormData] = useState({
    sender: wallet?.walletAddress || "",
    validator: operatorAddress || "",
    denom: denom || "",
    amount: "",
    fees: "2000",
    gas: "250000",
    memo: "realio.network",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
    //   console.log("Sending transaction with data:", formData);

      const txResult = await createDelegateTx({
        sender: wallet.walletAddress,
        validator: formData.validator,
        denom: denom,
        amount: formData.amount,
        fees: formData.fees,
        gas: formData.gas,
        memo: formData.memo,
        signer: wallet.signer, // Ensure signer is correctly passed
        decimal: decimal,
        chainId: "realionetwork_3301-1",
        rpcEndpoint: "https://realio.rpc.decentrio.ventures:443",
        apiEndpoint: "https://realio.api.decentrio.ventures:443",
      });
      reloadBalances();
      openNotification("success", `Transaction success: ${txResult.transactionHash}` )
      setLoading(false);
    } catch (err) {
        openNotification("error", `Transaction failed: ${err.message}` )
      setLoading(false);
    }
  };

  return (
    <DialogRoot size="md" placement={"center"} motionPreset="slide-in-bottom">
      <DialogTrigger asChild>
        <Button bg={"#707D8A"} size="sm" colorScheme="blue">
          Delegate
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <Flex justify={"space-between"}>
            <DialogTitle>Delegate</DialogTitle>
            <DialogTrigger style={{ cursor: "pointer" }}>
              <IoCloseOutline size={30} />
            </DialogTrigger>
          </Flex>
        </DialogHeader>
        {!wallet.walletAddress ? (
          <DialogBody>
            <VStack align="stretch" spacing={4}>
              <Text fontSize="md" textAlign="center">
                You need to connect your wallet to use this feature.
              </Text>
              <DialogTrigger style={{ cursor: "pointer" }}>
                <PopoverRoot>
                  <PopoverTrigger asChild>
                    <Button
                      onClick={triggerWalletConnectPopover}
                      w="full"
                      colorScheme="blue"
                      bg={"#707D8A"}
                      _hover={{ bg: "#505D6A" }}
                    >
                      Connect Wallet
                    </Button>
                  </PopoverTrigger>
                </PopoverRoot>
              </DialogTrigger>
            </VStack>
          </DialogBody>
        ) : (
          <form onSubmit={handleSubmit}>
            <DialogBody>
              <VStack align="stretch">
                {/* Sender */}
                <Box>
                  <Text fontSize="sm" mb={1}>
                    Sender
                  </Text>
                  <Input
                    readOnly
                    name="sender"
                    placeholder="realio13zz4mvgwm..."
                    value={wallet.walletAddress}
                  />
                </Box>

                {/* Validator */}
                <Box>
                  <Text fontSize="sm" mb={1}>
                    Validator
                  </Text>
                  <Input
                    name="validator"
                    readOnly
                    placeholder="Validator"
                    value={formData.validator}
                  />
                </Box>

                {/* Amount */}
                <Box>
                  <Flex justify="space-between" mb={1}>
                    <Text fontSize="sm" mb={1}>
                      Amount
                    </Text>
                    <Text fontSize="xs">
                      Available:{" "}
                      {(parseFloat(wallet.balances[`${denom}`]) / 10 ** decimal)
                        .toFixed(2)
                        .toString()}{" "}
                      {denomSymbol}
                    </Text>
                  </Flex>
                  <Group w={"full"} attached>
                    <Input
                      name="amount"
                      placeholder="Enter amount"
                      value={formData.amount}
                      onChange={handleChange}
                    />
                    <InputAddon>{denomSymbol}</InputAddon>
                  </Group>
                </Box>

                {/* Fees */}
                <Box>
                  <Text fontSize="sm" mb={1}>
                    Fees
                  </Text>
                  <Input
                    name="fees"
                    placeholder="2000"
                    value={formData.fees}
                    onChange={handleChange}
                  />
                </Box>

                {/* Gas */}
                <Box>
                  <Text fontSize="sm" mb={1}>
                    Gas
                  </Text>
                  <Input
                    name="gas"
                    placeholder="200000"
                    value={formData.gas}
                    onChange={handleChange}
                  />
                </Box>

                {/* Memo */}
                <Box>
                  <Text fontSize="sm" mb={1}>
                    Memo
                  </Text>
                  <Input
                    name="memo"
                    placeholder="realio.network"
                    value={formData.memo}
                    onChange={handleChange}
                  />
                </Box>
              </VStack>
            </DialogBody>
            <DialogFooter>
              <Button
                type="submit"
                bg={"#707D8A"}
                w={"full"}
                colorScheme="blue"
                disabled={loading}
              >
                {loading ? (
                  <AiOutlineLoading className={styles.spin} />
                ) : (
                  "Delegate"
                )}
              </Button>
            </DialogFooter>
            <ToastContainer closeOnClick={false} draggable={false} />
          </form>
        )}
      </DialogContent>
    </DialogRoot>
  );
};
