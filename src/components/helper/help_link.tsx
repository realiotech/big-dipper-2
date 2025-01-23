import { Link } from "@chakra-ui/react";
import NextLink from "next/link"
import { getMiddleEllipsis } from "@/utils";
import { useBreakpointValue } from "@chakra-ui/react";

export default function HelpLink({ href, value }) {
    const isMobile = useBreakpointValue({ base: true, lg: false });
    return (
        <Link asChild colorPalette={'blue'}>
            <NextLink href={href}>{isMobile ? getMiddleEllipsis(value, {beginning:9, ending:2}): value}</NextLink>
        </Link>
    )
}