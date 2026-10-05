import { Box, Button, Flex, Grid, IconButton, Input, Popover, Portal, Text } from "@chakra-ui/react";
import { useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import { LuCalendar, LuChevronLeft, LuChevronRight, LuChevronsLeft, LuChevronsRight } from "react-icons/lu";
import type { TimeRange } from "./tx_filters";
import { popoverContentProps, toolbarButtonProps } from "./tx_toolbar";

const PRESETS: { label: string; start: (today: Dayjs) => Dayjs }[] = [
  { label: "Last 7 days", start: (today) => today.subtract(6, "day") },
  { label: "Last 14 days", start: (today) => today.subtract(13, "day") },
  { label: "Last 30 days", start: (today) => today.subtract(29, "day") },
  { label: "Last 3 months", start: (today) => today.subtract(3, "month").add(1, "day") },
  { label: "Last 6 months", start: (today) => today.subtract(6, "month").add(1, "day") },
  { label: "Last year", start: (today) => today.subtract(1, "year").add(1, "day") },
];

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];
const TIME = /^([01]\d|2[0-3]):([0-5]\d)$/;

const withTime = (day: Dayjs, time: string) => {
  const [, hours, minutes] = TIME.exec(time) ?? [];
  return day.hour(Number(hours)).minute(Number(minutes)).second(0).millisecond(0);
};

/** "Sep 29 – Oct 5", with times when they are not the whole days, and years when not this year. */
const rangeLabel = ({ from, to }: TimeRange) => {
  const start = dayjs(from);
  const end = dayjs(to);
  const wholeDays = start.format("HH:mm") === "00:00" && end.format("HH:mm") === "23:59";
  const thisYear = start.year() === dayjs().year() && end.year() === dayjs().year();
  const format = `MMM D${thisYear ? "" : ", YYYY"}${wholeDays ? "" : " HH:mm"}`;
  return `${start.format(format)} – ${end.format(format)}`;
};

const TimeInput = ({ label, value, onChange }: { label: string; value: string; onChange: (time: string) => void }) => (
  <Flex align="center" gap="2.5">
    <Text fontSize="sm" color="explorer.muted">
      {label}
    </Text>
    <Input
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      size="sm"
      w="58px"
      px="2"
      textAlign="center"
      inputMode="numeric"
      maxLength={5}
      borderColor={TIME.test(value) ? "explorer.border" : "explorer.danger"}
      color="explorer.text"
    />
  </Flex>
);

const NavButton = ({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) => (
  <IconButton aria-label={label} variant="ghost" size="xs" minW="24px" h="24px" color="explorer.muted" _hover={{ color: "explorer.text", bg: "explorer.inset" }} onClick={onClick}>
    {children}
  </IconButton>
);

/** "Time range" button with presets, a range calendar and start/end times. */
export const TimeRangePicker = ({ value, onChange }: { value: TimeRange | null; onChange: (range: TimeRange | null) => void }) => {
  const [open, setOpen] = useState(false);
  const [start, setStart] = useState<Dayjs | null>(null);
  const [end, setEnd] = useState<Dayjs | null>(null);
  const [startTime, setStartTime] = useState("00:00");
  const [endTime, setEndTime] = useState("23:59");
  const [month, setMonth] = useState(() => dayjs().startOf("month"));
  const [preset, setPreset] = useState<string | null>(null);

  // Each opening starts from the applied range.
  const reset = () => {
    const from = value ? dayjs(value.from) : null;
    const to = value ? dayjs(value.to) : null;
    setStart(from?.startOf("day") ?? null);
    setEnd(to?.startOf("day") ?? null);
    setStartTime(from?.format("HH:mm") ?? "00:00");
    setEndTime(to?.format("HH:mm") ?? "23:59");
    setMonth((to ?? dayjs()).startOf("month"));
    setPreset(null);
  };

  const pickDay = (day: Dayjs) => {
    setPreset(null);
    if (!start || end) {
      setStart(day);
      setEnd(null);
    } else if (day.isBefore(start)) {
      setEnd(start);
      setStart(day);
    } else {
      setEnd(day);
    }
  };

  const pickPreset = (item: (typeof PRESETS)[number]) => {
    const today = dayjs().startOf("day");
    setStart(item.start(today));
    setEnd(today);
    setStartTime("00:00");
    setEndTime("23:59");
    setMonth(today.startOf("month"));
    setPreset(item.label);
  };

  const last = end ?? start;
  const from = start ? withTime(start, startTime) : null;
  const to = last ? withTime(last, endTime) : null;
  const valid = Boolean(from && to && TIME.test(startTime) && TIME.test(endTime) && !to.isBefore(from));

  const apply = () => {
    if (!valid || !from || !to) return;
    onChange({ from: from.toDate(), to: to.toDate() });
    setOpen(false);
  };

  const clear = () => {
    onChange(null);
    setOpen(false);
  };

  const gridStart = month.startOf("week");
  const days = Array.from({ length: 42 }, (_, index) => gridStart.add(index, "day"));
  const today = dayjs().startOf("day");

  return (
    <Popover.Root
      open={open}
      onOpenChange={(e) => {
        if (e.open) reset();
        setOpen(e.open);
      }}
      positioning={{ placement: "bottom-end", gutter: 8 }}
    >
      <Popover.Trigger asChild>
        <Button {...toolbarButtonProps} color={value ? "explorer.link" : "explorer.text"}>
          <LuCalendar />
          {value ? rangeLabel(value) : "Time range"}
        </Button>
      </Popover.Trigger>
      <Portal>
        <Popover.Positioner>
          <Popover.Content {...popoverContentProps} w="auto">
            <Flex direction={{ base: "column", sm: "row" }}>
              <Flex
                direction={{ base: "row", sm: "column" }}
                wrap="wrap"
                gap="1"
                p="2"
                w={{ base: "auto", sm: "150px" }}
                borderColor="explorer.border"
                borderRightWidth={{ base: "0", sm: "1px" }}
                borderBottomWidth={{ base: "1px", sm: "0" }}
              >
                {PRESETS.map((item) => (
                  <Button
                    key={item.label}
                    variant="ghost"
                    size="sm"
                    justifyContent="flex-start"
                    fontWeight="400"
                    color={preset === item.label ? "explorer.link" : "explorer.text"}
                    bg={preset === item.label ? "explorer.accentSubtle" : "transparent"}
                    _hover={{ bg: preset === item.label ? "explorer.accentSubtle" : "explorer.inset" }}
                    onClick={() => pickPreset(item)}
                  >
                    {item.label}
                  </Button>
                ))}
              </Flex>

              <Box p="3" w={{ base: "full", sm: "300px" }}>
                <Flex align="center" justify="space-between" mb="2">
                  <Flex>
                    <NavButton label="Previous year" onClick={() => setMonth(month.subtract(1, "year"))}>
                      <LuChevronsLeft />
                    </NavButton>
                    <NavButton label="Previous month" onClick={() => setMonth(month.subtract(1, "month"))}>
                      <LuChevronLeft />
                    </NavButton>
                  </Flex>
                  <Text fontSize="sm" fontWeight="600" color="explorer.text">
                    {month.format("MMMM YYYY")}
                  </Text>
                  <Flex>
                    <NavButton label="Next month" onClick={() => setMonth(month.add(1, "month"))}>
                      <LuChevronRight />
                    </NavButton>
                    <NavButton label="Next year" onClick={() => setMonth(month.add(1, "year"))}>
                      <LuChevronsRight />
                    </NavButton>
                  </Flex>
                </Flex>

                <Grid templateColumns="repeat(7, 1fr)" rowGap="1">
                  {WEEKDAYS.map((day, index) => (
                    <Text key={index} textAlign="center" fontSize="xs" color="explorer.muted" py="1">
                      {day}
                    </Text>
                  ))}
                  {days.map((day) => {
                    const isStart = Boolean(start?.isSame(day, "day"));
                    const isEnd = Boolean(last?.isSame(day, "day"));
                    const inRange = Boolean(start && last && !day.isBefore(start) && !day.isAfter(last));
                    const outside = day.month() !== month.month();
                    const weekday = day.day();
                    return (
                      <Box
                        key={day.valueOf()}
                        bg={inRange && start !== last ? "explorer.accentSubtle" : "transparent"}
                        borderLeftRadius={isStart || weekday === 0 ? "full" : "0"}
                        borderRightRadius={isEnd || weekday === 6 ? "full" : "0"}
                      >
                        <Button
                          variant="ghost"
                          aria-label={day.format("MMMM D, YYYY")}
                          aria-pressed={isStart || isEnd}
                          display="flex"
                          w="32px"
                          minW="32px"
                          h="32px"
                          p="0"
                          mx="auto"
                          borderRadius="full"
                          fontSize="sm"
                          bg={isStart || isEnd ? "explorer.accent" : "transparent"}
                          color={isStart || isEnd ? "white" : outside ? "explorer.muted" : "explorer.text"}
                          opacity={outside && !inRange ? 0.5 : 1}
                          fontWeight={day.isSame(today, "day") ? "600" : "400"}
                          _hover={isStart || isEnd ? undefined : { bg: "explorer.inset" }}
                          onClick={() => pickDay(day)}
                        >
                          {day.date()}
                        </Button>
                      </Box>
                    );
                  })}
                </Grid>

                <Flex justify="space-between" align="center" gap="3" wrap="wrap" mt="3" pt="3" borderTopWidth="1px" borderColor="explorer.border">
                  <TimeInput label="Start time" value={startTime} onChange={setStartTime} />
                  <TimeInput label="End time" value={endTime} onChange={setEndTime} />
                </Flex>
                <Flex justify="flex-end" gap="2" mt="3" pt="3" borderTopWidth="1px" borderColor="explorer.border">
                  <Button variant="ghost" size="sm" fontWeight="400" color="explorer.link" onClick={clear}>
                    Clear
                  </Button>
                  <Button size="sm" fontWeight="500" bg="explorer.accent" color="white" _hover={{ opacity: 0.9 }} disabled={!valid} onClick={apply}>
                    Apply
                  </Button>
                </Flex>
              </Box>
            </Flex>
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  );
};
