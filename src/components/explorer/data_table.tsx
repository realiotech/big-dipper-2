import { Skeleton, Table, Text } from "@chakra-ui/react";
import { ReactNode } from "react";

export type Column<T> = {
  key: string;
  header: string;
  align?: "start" | "end";
  width?: string;
  render: (row: T) => ReactNode;
};

/** The explorer's list table: muted headers, divider rows, scrolls sideways on small screens. */
export function DataTable<T>({
  columns,
  rows,
  rowKey,
  loading = false,
  skeletonRows = 10,
  emptyText = "Nothing to show",
}: {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string | number;
  loading?: boolean;
  skeletonRows?: number;
  emptyText?: string;
}) {
  const cell = { borderColor: "explorer.border", px: "0", pr: "4", _last: { pr: "0" } } as const;

  if (!loading && rows.length === 0) {
    return (
      <Text py="6" textAlign="center" fontSize="sm" color="explorer.muted">
        {emptyText}
      </Text>
    );
  }

  return (
    <Table.ScrollArea>
      <Table.Root size="sm" variant="line" minW="720px" fontSize="sm">
        <Table.Header>
          <Table.Row bg="transparent">
            {columns.map((column) => (
              <Table.ColumnHeader
                key={column.key}
                {...cell}
                py="3"
                w={column.width}
                textAlign={column.align ?? "start"}
                color="explorer.muted"
                fontWeight="400"
                fontSize="sm"
              >
                {column.header}
              </Table.ColumnHeader>
            ))}
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {loading
            ? Array.from({ length: skeletonRows }).map((_, index) => (
                <Table.Row key={index} bg="transparent">
                  <Table.Cell colSpan={columns.length} {...cell} py="3">
                    <Skeleton h="20px" />
                  </Table.Cell>
                </Table.Row>
              ))
            : rows.map((row) => (
                <Table.Row key={rowKey(row)} bg="transparent">
                  {columns.map((column) => (
                    <Table.Cell key={column.key} {...cell} py="3.5" textAlign={column.align ?? "start"} color="explorer.text">
                      {column.render(row)}
                    </Table.Cell>
                  ))}
                </Table.Row>
              ))}
        </Table.Body>
      </Table.Root>
    </Table.ScrollArea>
  );
}
