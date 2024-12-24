import { Box, Flex, Text, Table, Link, Stack, StackSeparator, For } from "@chakra-ui/react"
import { useState } from "react"
import { Switch } from "../ui/switch"
import useAppTranslation from "@/hooks/useAppTranslation";
import { getMessageByType } from "../msg/utils";

const MessageItem = ({ message, raw }) => {
    const { t } = useAppTranslation('transactions');
    const formattedItem = getMessageByType(message, raw, t);
    return (
        <Flex w='full' gap ='10'>
            <Box w='30%'>{formattedItem.type}</Box>
            <Box>{formattedItem.message}</Box>
        </Flex>
    )
}

export default function Messages({ messages }) {
    const [raw, setRaw] = useState(false)

    return (
        < Box bg="gray.50" p={6} borderRadius="md" boxShadow="sm" mb={8} border="1px solid #3182CE" >
            <Flex justify="space-between" align="center" mb={4}>
                <Text fontSize="lg" fontWeight="bold">
                    Messages
                </Text>
                <Switch checked={raw} onCheckedChange={(e) => setRaw(e.checked)}>Raw</Switch>
            </Flex>
            <Stack separator={<StackSeparator />} gap={3} w='full'>
                {messages?.items?.length &&
                    messages.items.map((item, index) =>
                        (<MessageItem message={item} raw={raw} key={`msg-${index}`} />)
                    )
                }
            </Stack>
        </Box >

    )
}