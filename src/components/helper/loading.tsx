import { Center, Image, VStack } from "@chakra-ui/react";
import { ProgressBar, ProgressRoot } from "@/components/ui/progress"

export default function Loading({size = '80px'}) {
    return (
        <Center w='full' p={4} h='full'>
            <VStack align={'center'} gap='2'>
                <Image src='/images/logo.svg' w={size}/>
                <ProgressRoot w={size} value={null} size='xs'>
                    <ProgressBar />
                </ProgressRoot>
            </VStack>
        </Center>
    )
}