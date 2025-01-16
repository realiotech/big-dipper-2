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

export const DelegateDialog = ({
  denom,
  denomSymbol,
  decimal,
  operatorName,
  operatorAddress,
}) => {
  const [formData, setFormData] = useState({
    sender: "realio13zz4mvgwmppzlnve09zshqlf4r2x4uqtwf6ckzk",
    validator: operatorAddress || "",
    denom: denom || "",
    amount: "",
    fees: "2000",
    gas: "200000",
    memo: "realio.network",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Data Submitted:", formData);
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
                  name="sender"
                  placeholder="realio13zz4mvgwm..."
                  value={formData.sender}
                  onChange={handleChange}
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
                  <Text fontSize="xs">Available: 1000 RIO</Text>
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
            <DialogTrigger w={"full"}>

            <Button type="submit" bg={"#707D8A"} w={"full"} colorScheme="blue">
              Send
            </Button>
            </DialogTrigger>
          </DialogFooter>
        </form>
      </DialogContent>
    </DialogRoot>
  );
};
