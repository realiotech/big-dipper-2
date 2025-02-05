import { Image, Text, VStack, Center, HStack, StackSeparator } from "@chakra-ui/react";

const Custom404 = () => {
    return (
        <Center
            borderRadius="20px"
                     bgColor={{ base: "#FAFBFC", _dark: "#0F0F0F" }}
            py="5"
            px="8"
            h="60vh"
            w="full"
        >
            <VStack align={'center'} gap={10}>
                <Image src='/images/logo-white.png' w='100px' />
                <HStack separator={<StackSeparator />}>
                    <Text color={'gray'} fontSize={'24px'}>404</Text>
                    <Text color={'gray'} fontSize={'22px'}>Not Found</Text>
                </HStack> 
            </VStack>
        </Center>

    )
}

export default Custom404;
