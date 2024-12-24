import { Box, Flex, Text, Table, Link } from "@chakra-ui/react"
import NextLink from "next/link"

export default function Messages({messages}) {
    return (
        < Box bg = "gray.50" p = { 6} borderRadius = "md" boxShadow = "sm" mb = { 8} border = "1px solid #3182CE" >
                <Flex justify="space-between" align="center" mb={4}>
                    <Text fontSize="lg" fontWeight="bold">
                        Messages
                    </Text>
                    <Box
                        as="button"
                        bg="green.100"
                        color="green.700"
                        px={4}
                        py={1}
                        borderRadius="md"
                        fontWeight="medium"
                    >
                        Send
                    </Box>
                </Flex>
                <Table.Root>
                    <Table.Body>
                        <Table.Row>
                            <Table.Cell fontWeight="semibold">From Address:</Table.Cell>
                            <Table.Cell textAlign="end" color="blue.500">
                                <Link href="#" >
                                    reallio147fluvqhgr65mj63r2wvts58qmmhrs79j4juw
                                </Link>
                            </Table.Cell>
                        </Table.Row>
                        <Table.Row>
                            <Table.Cell fontWeight="semibold">To Address:</Table.Cell>
                            <Table.Cell textAlign="end" color="blue.500">
                                <Link href="#" >
                                    reallio15es4lw9hcvf4na3v2a2lnntdqhvqtae5p57
                                </Link>
                            </Table.Cell>
                        </Table.Row>
                        <Table.Row>
                            <Table.Cell fontWeight="semibold">Amount:</Table.Cell>
                            <Table.Cell textAlign="end" fontWeight="bold">
                                100 RIO
                            </Table.Cell>
                        </Table.Row>
                    </Table.Body>
                </Table.Root>
            </Box >

    )
}