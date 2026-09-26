import { Avatar, Box, Flex, Text } from "@chakra-ui/react";
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

export type StatusTone = "success" | "danger" | "neutral" | "accent";

const STATUS_COLOR: Record<StatusTone, string> = {
  success: "explorer.success",
  danger: "explorer.danger",
  neutral: "explorer.muted",
  accent: "explorer.link",
};

/** Small bordered label such as "Active", "Jailed" or "Rank #27". */
export const StatusTag = ({ tone, children }: { tone: StatusTone; children: React.ReactNode }) => (
  <Tag color={STATUS_COLOR[tone]}>{children}</Tag>
);

/** Validator state as shown across the explorer. */
export const validatorStatus = (status: number, jailed: boolean, tombstoned = false): { label: string; tone: StatusTone } => {
  if (tombstoned) return { label: "Tombstoned", tone: "danger" };
  if (jailed) return { label: "Jailed", tone: "danger" };
  if (status === 3) return { label: "Active", tone: "success" };
  if (status === 2) return { label: "Unbonding", tone: "neutral" };
  return { label: "Inactive", tone: "neutral" };
};

export const TxStatus =({ success }: { success: boolean }) => (
  <Flex align="center" gap="1.5" fontSize="sm" color={success ? "explorer.success" : "explorer.danger"}>
    <Box w="5px" h="5px" borderRadius="full" bg="currentColor" />
    {success ? "Success" : "Failed"}
  </Flex>
);

const initial = (name?: string) => (name?.match(/[A-Za-z0-9]/)?.[0] ?? "?").toUpperCase();

/** Validator picture, falling back to the name's first letter when there is none or it fails to load. */
export const ValidatorAvatar = ({ name, src, size = "20px" }: { name?: string; src?: string; size?: string }) => (
  <Avatar.Root boxSize={size} flexShrink={0} bg="explorer.accentSubtle" color="explorer.link">
    <Avatar.Fallback fontSize="11px">{initial(name)}</Avatar.Fallback>
    {src && <Avatar.Image src={src} alt="" />}
  </Avatar.Root>
);
