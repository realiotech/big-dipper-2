import { Link } from "@chakra-ui/react";
import NextLink from "next/link"

export default function HelpLink({ href, value }) {
    return (
        <Link asChild colorPalette={'blue'}>
            <NextLink href={href}>{value}</NextLink>
        </Link>
    )
}