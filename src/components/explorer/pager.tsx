import { Button, HStack, IconButton, Pagination, Text } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useCallback } from "react";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";

/** Current page from `?page=`, so pages can be linked and survive reloads. */
export const usePageParam = () => {
  const router = useRouter();
  const page = Math.max(parseInt(String(router.query.page ?? "1"), 10) || 1, 1);
  const setPage = useCallback(
    (next: number) => {
      const query = { ...router.query };
      if (next > 1) query.page = String(next);
      else delete query.page;
      router.push({ pathname: router.pathname, query }, undefined, { shallow: true, scroll: false });
    },
    [router]
  );
  return { page, setPage };
};

export const Pager = ({
  count,
  pageSize,
  page,
  onPageChange,
}: {
  count: number;
  pageSize: number;
  page: number;
  onPageChange: (page: number) => void;
}) => (
  <Pagination.Root
    count={count}
    pageSize={pageSize}
    page={page}
    siblingCount={1}
    onPageChange={(e) => onPageChange(e.page)}
  >
    <HStack gap="1">
      <Pagination.PrevTrigger asChild>
        <IconButton aria-label="Previous page" variant="ghost" size="xs" color="explorer.muted">
          <LuChevronLeft />
        </IconButton>
      </Pagination.PrevTrigger>
      <Pagination.Context>
        {({ pages }) =>
          pages.map((item, index) =>
            item.type === "page" ? (
              <Pagination.Item key={index} {...item} asChild>
                <Button
                  variant="ghost"
                  size="xs"
                  minW="28px"
                  fontWeight="400"
                  color={item.value === page ? "explorer.text" : "explorer.muted"}
                  bg={item.value === page ? "explorer.accentSubtle" : "transparent"}
                >
                  {item.value}
                </Button>
              </Pagination.Item>
            ) : (
              <Pagination.Ellipsis key={index} index={index} asChild>
                <Text as="span" px="1" color="explorer.muted" fontSize="xs">
                  …
                </Text>
              </Pagination.Ellipsis>
            )
          )
        }
      </Pagination.Context>
      <Pagination.NextTrigger asChild>
        <IconButton aria-label="Next page" variant="ghost" size="xs" color="explorer.muted">
          <LuChevronRight />
        </IconButton>
      </Pagination.NextTrigger>
    </HStack>
  </Pagination.Root>
);
