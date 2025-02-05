import { Center, Image, Link, VStack } from "@chakra-ui/react";
import NextLink from "next/link"
import NavLink from "./navlink";
import { Home } from "../icons/home";
import { Block } from "../icons/block";
import { Stake } from "../icons/stake";
import { Transaction } from "../icons/transaction";
import { Proposal } from "../icons/proposal";
import { Params } from "../icons/params";
import { useRouter } from "next/router";
import { ColorModeButton } from "../ui/color-mode";
import { useColorMode } from "../ui/color-mode";

export default function Sidebar() {
    const { pathname } = useRouter()
    const { colorMode } = useColorMode()

    return (
        <VStack hideBelow='lg' pr='50px'>
            <Link asChild outline='none'>
                <NextLink href="/">
                {colorMode == 'light' ? <Image w='60px' src="/images/logo.svg" /> : <Image w='60px' src="/images/logo_white.svg" />}
                </NextLink>
            </Link>
            <Center position='relative' top='200px'>
                <VStack gap='20px'>
                    <NavLink href="/" selected={pathname == "/"} children={<Home />} />
                    <NavLink href="/blocks" selected={pathname.includes("blocks")} children={<Block />} />
                    <NavLink href="/validators" selected={pathname.includes("validators")} children={<Stake />} />
                    <NavLink href="/transactions" selected={pathname.includes("transactions")} children={<Transaction />} />
                    <NavLink href="/proposals" selected={pathname.includes("proposals")} children={<Proposal />} />
                    <NavLink href="/params" selected={pathname.includes("params")} children={<Params />} />
                    <ColorModeButton />
                </VStack>
            </Center>
        </VStack>
    )
}