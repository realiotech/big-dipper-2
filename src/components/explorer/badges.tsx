import { Box, Flex, Text } from "@chakra-ui/react";
import { TxLabel, TxTone } from "@/utils/tx_label";

const TONE_COLOR: Record<TxTone, string> = {
  accent: "explorer.link",
  success: "explorer.successMuted",
  evm: "explorer.evm",
  neutral: "explorer.muted",
};

export const Tag = ({ children, color = "explorer.muted" }: { children: React.ReactNode; color?: string }) => (
  <Flex
    as="span"
    align="center"
    gap="1"
    fontSize="xs"
    lineHeight="18px"
    px="2"
    borderWidth="1px"
    borderColor="explorer.border"
    borderRadius="4px"
    bg="explorer.inset"
    color={color}
    whiteSpace="nowrap"
  >
    {children}
  </Flex>
);

export const TxTypeTag = ({ kind }: { kind: TxLabel["kind"] }) => (
  <Tag color={kind === "evm" ? "explorer.link" : "explorer.muted"}>
    {kind === "evm" ? "Ethereum Tx" : "Cosmos Tx"}
  </Tag>
);

export const TxNameTag = ({ label }: { label: TxLabel }) => (
  <Tag color={TONE_COLOR[label.tone]}>
    {label.name}
    {label.extraCount > 0 && (
      <Text as="span" color="explorer.muted">
        +{label.extraCount}
      </Text>
    )}
  </Tag>
);

export const TxStatus = ({ success }: { success: boolean }) => (
  <Flex align="center" gap="1.5" fontSize="sm" color={success ? "explorer.success" : "explorer.danger"}>
    <Box w="5px" h="5px" borderRadius="full" bg="currentColor" />
    {success ? "Success" : "Failed"}
  </Flex>
);

export const InitialAvatar = ({ name }: { name?: string }) => (
  <Flex
    align="center"
    justify="center"
    flexShrink={0}
    w="20px"
    h="20px"
    borderRadius="full"
    bg="explorer.accentSubtle"
    color="explorer.link"
    fontSize="11px"
  >
    {(name?.match(/[A-Za-z0-9]/)?.[0] ?? "?").toUpperCase()}
  </Flex>
);
