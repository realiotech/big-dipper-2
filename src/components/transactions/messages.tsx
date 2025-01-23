import { Box, Flex, Text, Table, Link, Stack, StackSeparator, For, useBreakpointValue } from "@chakra-ui/react"
import { useState } from "react"
import { Switch } from "../ui/switch"
import useTranslation from "next-translate/useTranslation";
import { getMessageByType } from "../msg/utils";


const MessageItem = ({ message, raw }) => {
    const { t } = useTranslation('transactions');
    const formattedItem = getMessageByType(message, raw, t);
    const isMobile = useBreakpointValue({ base: true, md: false });

    return (
        <Flex w='full' gap='10' direction={isMobile? 'column' : 'row'}>
            <Box w='30%'>{formattedItem.type}</Box>
            <Box overflow={'auto'}>{formattedItem.message}</Box>
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