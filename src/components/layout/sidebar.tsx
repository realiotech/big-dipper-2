import { useState, useEffect } from "react";
import { Center, Image, Link, VStack } from "@chakra-ui/react";
import NextLink from "next/link";
import NavLink from "./navlink";
import { Home } from "../icons/home";
import { Block } from "../icons/block";
import { Stake } from "../icons/stake";
import { Transaction } from "../icons/transaction";
import { Proposal } from "../icons/proposal";
import { useRouter } from "next/router";
import { useColorMode } from "../ui/color-mode";
import { Switch } from "@/components/ui/switch";
import { MdDarkMode, MdLightMode } from "react-icons/md";

export default function Sidebar() {
  const { pathname } = useRouter();
  const { colorMode, toggleColorMode } = useColorMode();

  // Default logo for SSR (avoids hydration mismatch)
  const [logoSrc, setLogoSrc] = useState("/images/logo.svg");

  useEffect(() => {
    setLogoSrc(
      colorMode === "dark" ? "/images/logo_white.svg" : "/images/logo.svg"
    );
  }, [colorMode]);

  return (
    <VStack hideBelow="lg" pr="50px">
      <Link asChild outline="none">
        <NextLink href="/">
          <Image key={logoSrc} w="60px" src={logoSrc} alt="Logo" />
        </NextLink>
      </Link>
      <Center position="relative" top="200px">
        <VStack gap="20px">
          <NavLink href="/" selected={pathname == "/"} children={<Home />} />
          <NavLink
            href="/blocks"
            selected={pathname.includes("blocks")}
            children={<Block />}
          />
          <NavLink
            href="/validators"
            selected={pathname.includes("validators")}
            children={<Stake />}
          />
          <NavLink
            href="/transactions"
            selected={pathname.includes("transactions")}
            children={<Transaction />}
          />
          <NavLink
            href="/proposals"
            selected={pathname.includes("proposals")}
            children={<Proposal />}
          />
          <Switch
            theme="light"
            colorPalette="gray"
            checked={colorMode === "dark"}
            onCheckedChange={() => toggleColorMode()}
            size="lg"
            thumbLabel={{ on: <MdDarkMode />, off: <MdLightMode /> }}
          />
        </VStack>
      </Center>
    </VStack>
  );
}
