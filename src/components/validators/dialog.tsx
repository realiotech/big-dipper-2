import { Button } from "@/components/ui/button";
import {
  Box,
  Input,
  Text,
  VStack,
  Flex,
  InputAddon,
  Group,
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
import { IoCloseOutline } from "react-icons/io5";
import { useState } from "react";
import { createDelegateTx } from "@/utils/delegate_transaction";
import {
    createSignerInfo,
    createAuthInfo,
    createFee,
  } from "@injectivelabs/sdk-ts";
import { useRecoilValue } from "recoil";
import { atomState } from "@/recoil/wallet/atom";

export const DelegateDialog = ({
  denom,
  denomSymbol,
  decimal,
  operatorName,
  operatorAddress,
}) => {
  const wallet = useRecoilValue(atomState); // Access wallet state
  const [formData, setFormData] = useState({
    sender: wallet.walletAddress,
    validator: operatorAddress || "",
    denom: denom || "",
    amount: "",
    fees: "2000",
    gas: "200000",
    memo: "realio.network",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!wallet.signer) {
      console.error("No signer found. Please connect your wallet.");
      return;
    }
  
    try {
      setLoading(true);
      console.log("Sending transaction with data:", formData);
  
      const txResult = await createDelegateTx({
        sender: formData.sender,
        validator: formData.validator,
        denom: denom,
        amount: formData.amount,
        fees: formData.fees,
        gas: formData.gas,
        memo: formData.memo,
        signer: wallet.signer, // Ensure signer is correctly passed
        decimal: decimal,
      });
      console.log("Signer Info:", wallet.signer);
      console.log("Transaction Result:", txResult);
      setLoading(false);
    } catch (err) {
      console.error("Transaction failed:", err);
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
                  value={formData.sender}
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
                  <Text fontSize="xs">Available: ${wallet.balance} RIO1</Text>
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
              isLoading={loading}
            >
              Send
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </DialogRoot>
  );
};
