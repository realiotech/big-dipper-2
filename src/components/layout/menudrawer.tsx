import React, { useEffect, useState } from "react";
import { Box, Flex, IconButton, Link as ChakraLink, Stack, Text } from "@chakra-ui/react";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { LuMenu } from "react-icons/lu";
import {
  DrawerRoot,
  DrawerBackdrop,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerCloseTrigger,
  DrawerTrigger,
} from "@/components/ui/drawer";
import WalletPopover from "./wallet-popover";
import { MONITOR_ITEM, NAV_GROUPS, isActive } from "./nav";
import { Logo, SoonTag } from "./brand";

const groups = [...NAV_GROUPS, { label: "Monitor", items: [MONITOR_ITEM] }];

export default function MenuDrawer() {
  const { pathname, asPath } = useRouter();
  const [open, setOpen] = useState(false);

  // Close after navigating.
  useEffect(() => setOpen(false), [asPath]);

  return (
    <DrawerRoot open={open} onOpenChange={(e) => setOpen(e.open)} size="full">
      <DrawerTrigger asChild>
        <IconButton aria-label="Open menu" variant="ghost" size="sm" color="explorer.text">
          <LuMenu />
        </IconButton>
      </DrawerTrigger>
      <DrawerBackdrop />
      <DrawerContent bg="explorer.page">
        <DrawerHeader borderBottomWidth="1px" borderColor="explorer.border" py="3">
          <Flex w="full" justify="space-between" align="center">
            <DrawerTitle>
              <Logo />
            </DrawerTitle>
            <DrawerCloseTrigger position="static" color="explorer.text" />
          </Flex>
        </DrawerHeader>
        <DrawerBody py="6">
          <Stack gap="6">
            {groups.map((group) => (
              <Box key={group.label}>
                <Text fontSize="xs" letterSpacing="0.08em" textTransform="uppercase" color="explorer.muted" mb="2">
                  {group.label}
                </Text>
                <Stack gap="0">
                  {group.items.map((item) =>
                    item.ready ? (
                      <ChakraLink
                        key={item.href}
                        asChild
                        py="2"
                        color={isActive(item.href, pathname) ? "explorer.link" : "explorer.text"}
                      >
                        <NextLink href={item.href}>{item.label}</NextLink>
                      </ChakraLink>
                    ) : (
                      <Flex key={item.href} py="2" gap="2" align="center" color="explorer.muted">
                        {item.label}
                        <SoonTag />
                      </Flex>
                    )
                  )}
                </Stack>
              </Box>
            ))}
          </Stack>
        </DrawerBody>
        <DrawerFooter borderTopWidth="1px" borderColor="explorer.border" justifyContent="stretch">
          <WalletPopover fullWidth />
        </DrawerFooter>
      </DrawerContent>
    </DrawerRoot>
  );
}
