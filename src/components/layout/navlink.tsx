import { Center, Link } from "@chakra-ui/react";
import NextLink from "next/link";

export default function NavLink({ children, href, selected }) {
    return (
        <Link asChild outline='none'>
            <NextLink href={href}>
                <Center
                    w='60px'
                    h='60px'
                    borderRadius='60px'
                    border='1px solid #707D8A'
                    fontSize='25px'
                    bgColor={selected ? '#707D8A' : 'white'}
                    color={selected ? 'white' : '#707D8A'}
                >
                    {children}
                </Center>
            </NextLink>
        </Link>
    )
}