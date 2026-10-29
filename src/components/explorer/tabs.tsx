import { Flex, Tabs, Text } from "@chakra-ui/react";
import { ReactNode } from "react";

export type TabItem = { value: string; label: string; count?: number };

/** Underlined tabs with count chips, as used by the explorer's list panels. */
export const ExplorerTabs = ({
  items,
  value,
  onChange,
  actions,
  children,
}: {
  items: TabItem[];
  value: string;
  onChange: (value: string) => void;
  actions?: ReactNode;
  children?: ReactNode;
}) => (
  <Tabs.Root value={value} onValueChange={(e) => onChange(e.value)} variant="line" lazyMount>
    <Flex
      justify="space-between"
      align="center"
      gap="4"
      wrap="wrap"
      borderBottomWidth="1px"
      borderColor="explorer.border"
      mb="2"
    >
      <Tabs.List borderBottomWidth="0" gap="2">
        {items.map((item) => (
          <Tabs.Trigger
            key={item.value}
            value={item.value}
            px="3"
            fontSize="sm"
            fontWeight="400"
            color="explorer.muted"
            _selected={{ color: "explorer.text" }}
          >
            {item.label}
            {item.count !== undefined && (
              <Text as="span" fontSize="xs" px="1.5" borderRadius="4px" bg="explorer.inset" color="explorer.muted">
                {item.count.toLocaleString("en-US")}
              </Text>
            )}
          </Tabs.Trigger>
        ))}
        <Tabs.Indicator h="2px" bottom="-1px" bg="explorer.accent" boxShadow="none" />
      </Tabs.List>
      {actions}
    </Flex>
    {children}
  </Tabs.Root>
);

export const TabPanel = Tabs.Content;
