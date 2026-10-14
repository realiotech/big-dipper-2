import { Box, Button, ButtonProps, Flex, Input, Popover, Portal, Text } from "@chakra-ui/react";
import { useEffect, useMemo, useRef, useState } from "react";
import numeral from "numeral";
import { LuCheck, LuChevronDown, LuChevronUp, LuSearch } from "react-icons/lu";
import { InputGroup } from "@/components/ui/input-group";
import { Tooltip } from "@/components/ui/tooltip";
import { TX_TYPE_GROUPS, txTypeOption } from "@/utils/tx_types";
import type { TxSource } from "./tx_filters";
import { EXPORT_LIMIT } from "./tx_export";

/** Bordered button used by the list toolbars ("All types", "Time range", "Export CSV"). */
export const toolbarButtonProps: ButtonProps = {
  variant: "outline",
  size: "sm",
  h: "32px",
  px: "3",
  gap: "2",
  fontSize: "sm",
  fontWeight: "400",
  color: "explorer.text",
  borderColor: "explorer.border",
  bg: "transparent",
  _hover: { bg: "explorer.inset" },
  _expanded: { borderColor: "explorer.accent" },
};

/** Shared surface for the toolbar's popovers. */
export const popoverContentProps = {
  bg: "explorer.card",
  borderWidth: "1px",
  borderColor: "explorer.border",
  borderRadius: "6px",
  boxShadow: "lg",
  maxW: "calc(100vw - 32px)",
} as const;

const SOURCES: { value: TxSource; label: string }[] = [
  { value: "all", label: "All" },
  { value: "evm", label: "EVM" },
  { value: "cosmos", label: "Cosmos" },
];

/** All / EVM / Cosmos segmented control. */
export const SourceTabs = ({ value, onChange }: { value: TxSource; onChange: (source: TxSource) => void }) => (
  <Flex role="tablist" aria-label="Transaction source" gap="2px" p="2px" borderWidth="1px" borderColor="explorer.border" borderRadius="6px">
    {SOURCES.map((source) => {
      const selected = source.value === value;
      return (
        <Button
          key={source.value}
          role="tab"
          aria-selected={selected}
          variant="ghost"
          size="xs"
          h="28px"
          px="3.5"
          fontSize="sm"
          fontWeight="400"
          color={selected ? "explorer.link" : "explorer.text"}
          bg={selected ? "explorer.accentSubtle" : "transparent"}
          _hover={{ bg: selected ? "explorer.accentSubtle" : "explorer.inset" }}
          onClick={() => onChange(source.value)}
        >
          {source.label}
        </Button>
      );
    })}
  </Flex>
);

const MenuItem = ({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) => (
  <Button
    variant="ghost"
    size="sm"
    w="full"
    h="auto"
    justifyContent="space-between"
    px="2.5"
    py="1.5"
    borderRadius="4px"
    fontSize="sm"
    fontWeight="400"
    color="explorer.text"
    bg={selected ? "explorer.inset" : "transparent"}
    _hover={{ bg: "explorer.inset" }}
    onClick={onClick}
  >
    {label}
    {selected && <LuCheck />}
  </Button>
);

/** Searchable message type menu, grouped by module. */
export const TxTypeMenu = ({ value, onChange }: { value: string | null; onChange: (type: string | null) => void }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const selected = txTypeOption(value);

  const groups = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return TX_TYPE_GROUPS;
    return TX_TYPE_GROUPS.map((group) => ({
      ...group,
      options: group.label.toLowerCase().includes(term)
        ? group.options
        : group.options.filter((option) => option.label.toLowerCase().includes(term)),
    })).filter((group) => group.options.length > 0);
  }, [search]);

  const pick = (next: string | null) => {
    onChange(next);
    setOpen(false);
  };

  return (
    <Popover.Root
      open={open}
      onOpenChange={(e) => {
        setOpen(e.open);
        if (!e.open) setSearch("");
      }}
      positioning={{ placement: "bottom-end", gutter: 8 }}
      initialFocusEl={() => inputRef.current}
    >
      <Popover.Trigger asChild>
        <Button {...toolbarButtonProps} color={selected ? "explorer.link" : "explorer.text"}>
          {selected?.label ?? "All types"}
          {open ? <LuChevronUp /> : <LuChevronDown />}
        </Button>
      </Popover.Trigger>
      <Portal>
        <Popover.Positioner>
          <Popover.Content {...popoverContentProps} w="300px" p="2">
            <InputGroup w="full" startElement={<LuSearch />}>
              <Input
                ref={inputRef}
                size="sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search message types"
                borderColor="explorer.border"
                bg="explorer.inset"
                color="explorer.text"
                _placeholder={{ color: "explorer.muted" }}
              />
            </InputGroup>
            <Box maxH="340px" overflowY="auto" mt="2">
              {!search && <MenuItem label="All types" selected={!selected} onClick={() => pick(null)} />}
              {groups.map((group) => (
                <Box key={group.label}>
                  <Text px="2.5" pt="3" pb="1" fontSize="xs" letterSpacing="0.08em" textTransform="uppercase" color="explorer.muted">
                    {group.label}
                  </Text>
                  {group.options.map((option) => (
                    <MenuItem key={option.value} label={option.label} selected={option.value === value} onClick={() => pick(option.value)} />
                  ))}
                </Box>
              ))}
              {groups.length === 0 && (
                <Text px="2.5" py="4" fontSize="sm" color="explorer.muted">
                  No matching types
                </Text>
              )}
            </Box>
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  );
};

type Feedback = { tone: "muted" | "danger"; text: string } | null;

/**
 * "Export CSV" with its state: disabled with a reason until an export is
 * possible, busy while pages are read, then a short result line.
 */
export const ExportCsvButton = ({
  count,
  needsRange,
  onExport,
}: {
  /** Rows matching the filters, or null while unknown. */
  count: number | null;
  /** True while no time range is picked. */
  needsRange: boolean;
  /** Reads and saves the CSV; resolves to the number of rows written. */
  onExport: () => Promise<number>;
}) => {
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  useEffect(() => {
    if (!feedback) return undefined;
    const timer = setTimeout(() => setFeedback(null), 6000);
    return () => clearTimeout(timer);
  }, [feedback]);

  const tooMany = !needsRange && count !== null && count > EXPORT_LIMIT;
  let reason = "";
  if (needsRange) reason = "Pick a time range to export";
  else if (count === 0) reason = "No transactions match these filters";
  else if (tooMany) reason = `Exports hold up to ${numeral(EXPORT_LIMIT).format("0,0")} rows; narrow the time range`;

  const run = async () => {
    setBusy(true);
    setFeedback(null);
    try {
      const rows = await onExport();
      setFeedback({ tone: "muted", text: `Exported ${numeral(rows).format("0,0")} transactions` });
    } catch (error) {
      setFeedback({ tone: "danger", text: `Export failed: ${error instanceof Error ? error.message : "unknown error"}` });
    } finally {
      setBusy(false);
    }
  };

  const message = feedback ?? (tooMany ? { tone: "muted" as const, text: `${numeral(count).format("0,0")} match; narrow the time range` } : null);

  return (
    <Flex align="center" gap="3">
      {message && (
        <Text fontSize="xs" color={message.tone === "danger" ? "explorer.danger" : "explorer.muted"}>
          {message.text}
        </Text>
      )}
      <Tooltip content={reason} disabled={!reason || busy} openDelay={150}>
        <Box as="span" display="inline-flex">
          <Button {...toolbarButtonProps} disabled={Boolean(reason)} loading={busy} loadingText="Exporting" onClick={run}>
            Export CSV
          </Button>
        </Box>
      </Tooltip>
    </Flex>
  );
};
