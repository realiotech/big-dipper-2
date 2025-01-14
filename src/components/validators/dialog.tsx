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
  DialogActionTrigger,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { IoCloseOutline } from "react-icons/io5";

export const DelegateDialog = () => {
  return (
    <DialogRoot size="md" placement={"center"} motionPreset="slide-in-bottom">
      <DialogTrigger asChild>
        <Button bg={"#707D8A"} size="sm" colorScheme="blue">Delegate</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <Flex justify={'space-between'}>
            <DialogTitle>Delegate</DialogTitle>
            <DialogTrigger style={{cursor: "pointer"}}>
              <IoCloseOutline size={30} />
            </DialogTrigger>
          </Flex>
        </DialogHeader>
        <DialogBody>
          <VStack spacing={4} align="stretch">
            {/* Sender */}
            <Box>
              <Text fontSize="sm" mb={1}>
                Sender
              </Text>
              <Input
                placeholder="realio13zz4mvgwm..."
                defaultValue="realio13zz4mvgwmppzlnve09zshqlf4r2x4uqtwf6ckzk"
              />
            </Box>

            {/* Validator */}
            <Box>
              <Text fontSize="sm" mb={1}>
                Validator
              </Text>
              <Input
                readOnly
                placeholder="Validator"
                defaultValue="realioValoper"
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
                <Input placeholder="Enter amount" />
                <InputAddon>Denom</InputAddon>
              </Group>
            </Box>

            {/* Fees */}
            <Box>
              <Text fontSize="sm" mb={1}>
                Fees
              </Text>
              <Input placeholder="2000" />
            </Box>

            {/* Gas */}
            <Box>
              <Text fontSize="sm" mb={1}>
                Gas
              </Text>
              <Input placeholder="200000" />
            </Box>

            {/* Memo */}
            <Box>
              <Text fontSize="sm" mb={1}>
                Memo
              </Text>
              <Input placeholder="realio.network" />
            </Box>
          </VStack>
        </DialogBody>
        <DialogFooter>
          <Button bg={'#707D8A'} w={'full'} colorScheme="blue">Send</Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
};
