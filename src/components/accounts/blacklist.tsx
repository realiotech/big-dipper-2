import { useEffect, useState } from "react";
import { Flex, Text } from "@chakra-ui/react";
import { StatusTag } from "@/components/explorer/badges";

/** Whether the chain blocks this account, asked of the server one address at a time. */
export const useBlacklisted = (address?: string) => {
  const [blacklisted, setBlacklisted] = useState(false);

  useEffect(() => {
    setBlacklisted(false);
    if (!address?.startsWith("realio1")) return;
    const controller = new AbortController();
    fetch(`/api/blacklist/${address}`, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : { blacklisted: false }))
      .then((body: { blacklisted?: boolean }) => setBlacklisted(Boolean(body.blacklisted)))
      .catch(() => undefined);
    return () => controller.abort();
  }, [address]);

  return blacklisted;
};

/** Which of a page of accounts are blacklisted, in one request per page. */
export const useBlacklistCheck = (addresses: string[]) => {
  const [blacklisted, setBlacklisted] = useState<Set<string>>(new Set());
  const key = addresses.filter((address) => address.startsWith("realio1")).slice(0, 100).join(",");

  useEffect(() => {
    if (!key) {
      setBlacklisted(new Set());
      return;
    }
    const controller = new AbortController();
    fetch(`/api/blacklist/check?addresses=${key}`, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : { blacklisted: [] }))
      .then((body: { blacklisted?: string[] }) => setBlacklisted(new Set(body.blacklisted ?? [])))
      .catch(() => undefined);
    return () => controller.abort();
  }, [key]);

  return blacklisted;
};

export const BlacklistBanner = () => (
  <Flex
    align={{ base: "start", md: "center" }}
    direction={{ base: "column", md: "row" }}
    gap="3"
    px="4"
    py="3"
    borderWidth="1px"
    borderColor="explorer.warning"
    borderRadius="6px"
    bg="explorer.warning/10"
    fontSize="sm"
  >
    <StatusTag tone="warning">Blacklisted</StatusTag>
    <Text color="explorer.text">
      Transactions from this account are blocked by the chain. Validators blocked the wallets compromised in the August 2026
      incident with a chain upgrade. Existing balances stay visible.
    </Text>
  </Flex>
);
