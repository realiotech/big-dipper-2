import { HStack } from "@chakra-ui/react"
import {
    PaginationItems,
    PaginationNextTrigger,
    PaginationPrevTrigger,
    PaginationRoot,
  } from "@/components/ui/pagination"
import { PageChangeDetails, PageSizeChangeDetails } from "@chakra-ui/react/dist/types/components/pagination/namespace";

type pageChangeFunc = (p: PageChangeDetails) => void;
type pageSizeChangeFunc = (p: PageSizeChangeDetails) => void;

export type PageInfo = {
    count: number;
    pageSize: number;
    currentPage: number;
}

export default function Pagination({pageInfo, pageChangeFunc, pageSizeChangeFunc}: 
    {pageInfo: PageInfo, pageChangeFunc: pageChangeFunc, pageSizeChangeFunc: pageSizeChangeFunc}) {

    return (
        <PaginationRoot 
            count={pageInfo.count} 
            pageSize={pageInfo.pageSize} 
            defaultPage={1}
            onPageChange={pageChangeFunc}
            onPageSizeChange={pageSizeChangeFunc}
        >
        <HStack>
          <PaginationPrevTrigger />
          <PaginationItems />
          <PaginationNextTrigger />
        </HStack>
      </PaginationRoot>
    )
}
