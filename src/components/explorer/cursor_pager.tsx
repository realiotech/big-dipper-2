import { Flex, IconButton, Text } from "@chakra-ui/react";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";

/** Previous / next controls for cursor-paged lists, which have no page count. */
export const CursorPager = ({
  page,
  hasPrevious,
  hasNext,
  onPrevious,
  onNext,
}: {
  page: number;
  hasPrevious: boolean;
  hasNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
}) =>
  hasPrevious || hasNext ? (
    <Flex align="center" gap="1">
      <IconButton aria-label="Previous page" variant="ghost" size="xs" color="explorer.muted" disabled={!hasPrevious} onClick={onPrevious}>
        <LuChevronLeft />
      </IconButton>
      <Text fontSize="xs" color="explorer.text" px="2" py="1" borderRadius="4px" bg="explorer.accentSubtle">
        {page}
      </Text>
      <IconButton aria-label="Next page" variant="ghost" size="xs" color="explorer.muted" disabled={!hasNext} onClick={onNext}>
        <LuChevronRight />
      </IconButton>
    </Flex>
  ) : null;
