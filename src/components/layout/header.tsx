import { Box, Button, Flex, Link as ChakraLink, Menu, Portal } from "@chakra-ui/react";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { LuChevronDown } from "react-icons/lu";
import { SearchInput } from "../explorer/search_input";
import MenuDrawer from "./menudrawer";
import { Logo, SoonTag, ThemeToggle } from "./brand";
import WalletPopover from "./wallet-popover";
import { MONITOR_ITEM, NAV_GROUPS, NavItem, isActive } from "./nav";

const NavMenu = ({ label, items, pathname }: { label: string; items: NavItem[]; pathname: string }) => {
  const active = items.some((item) => item.ready && isActive(item.href, pathname));

  return (
    <Menu.Root positioning={{ placement: "bottom-start", gutter: 12 }}>
      <Menu.Trigger asChild>
        <Button
          variant="ghost"
          size="sm"
          px="2"
          fontWeight="400"
          color={active ? "explorer.text" : "explorer.muted"}
          _hover={{ color: "explorer.text", bg: "transparent" }}
          _expanded={{ color: "explorer.text", bg: "transparent" }}
        >
          {label}
          <LuChevronDown />
        </Button>
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content minW="200px" bg="explorer.card" borderWidth="1px" borderColor="explorer.border" boxShadow="lg" p="1">
            {items.map((item) =>
              item.ready ? (
                <Menu.Item key={item.href} value={item.href} asChild color={isActive(item.href, pathname) ? "explorer.link" : "explorer.text"}>
                  <NextLink href={item.href}>{item.label}</NextLink>
                </Menu.Item>
              ) : (
                <Menu.Item key={item.href} value={item.href} disabled justifyContent="space-between" color="explorer.muted">
                  {item.label}
                  <SoonTag />
                </Menu.Item>
              )
            )}
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  );
};

export default function Header() {
  const { pathname } = useRouter();
  // The overview has its own large search box.
  const showSearch = pathname !== "/";

  return (
    <Box as="header" position="sticky" top="0" zIndex="sticky" bg="explorer.page" borderBottomWidth="1px" borderColor="explorer.border">
      <Flex maxW="1440px" mx="auto" h="56px" px={{ base: "4", md: "12" }} align="center" gap={{ base: "3", lg: "6" }}>
        <Logo />
        {showSearch && (
          <Box flex="1" maxW="440px" hideBelow="lg">
            <SearchInput height="34px" />
          </Box>
        )}
        <Flex as="nav" align="center" gap="1" ml="auto" hideBelow="lg">
          {NAV_GROUPS.map((group) => (
            <NavMenu key={group.label} label={group.label} items={group.items} pathname={pathname} />
          ))}
          {MONITOR_ITEM.ready ? (
            <ChakraLink asChild px="2" fontSize="sm" color={isActive(MONITOR_ITEM.href, pathname) ? "explorer.text" : "explorer.muted"}>
              <NextLink href={MONITOR_ITEM.href}>Monitor</NextLink>
            </ChakraLink>
          ) : (
            <Flex align="center" gap="1.5" px="2" fontSize="sm" color="explorer.muted">
              Monitor
              <SoonTag />
            </Flex>
          )}
        </Flex>
        <Flex align="center" gap="3" ml={{ base: "auto", lg: "2" }}>
          <ThemeToggle />
          <Box hideBelow="lg">
            <WalletPopover />
          </Box>
          <Box hideFrom="lg">
            <MenuDrawer />
          </Box>
        </Flex>
      </Flex>
      {showSearch && (
        <Box hideFrom="lg" px="4" pb="3">
          <SearchInput height="38px" />
        </Box>
      )}
    </Box>
  );
}
