import { Center, Image, VStack } from "@chakra-ui/react";
import { ProgressBar, ProgressRoot } from "@/components/ui/progress"
import { useState, useEffect } from "react";
import { useColorMode } from "../ui/color-mode";

export default function Loading({size = '80px'}) {
  const { colorMode, toggleColorMode } = useColorMode();
  const [logoSrc, setLogoSrc] = useState("/images/logo.svg");

  useEffect(() => {
    setLogoSrc(
      colorMode === "dark" ? "/images/logo_white.svg" : "/images/logo.svg"
    );
  }, [colorMode]);
    return (
        <Center w='full' p={4} h='full'>
            <VStack align={'center'} gap='2'>
                <Image src={logoSrc} key={logoSrc} w={size}/>
                <ProgressRoot w={size} value={null} size='xs'>
                    <ProgressBar />
                </ProgressRoot>
            </VStack>
        </Center>
    )
}