import { Center, Image, Text, VStack } from "@chakra-ui/react";

export default function NoData() {
    return (
        <Center w='full' p={4}>
            <VStack align={'center'}>
                <Image src='/images/logo-white.png' w='100px'/>
                <Text color={'#9DA7B0'} fontSize={'15px'}>Nothing to show</Text>
            </VStack>
        </Center>
    )
}