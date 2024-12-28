import React from "react";
import {
    TableColumnHeader
} from "@chakra-ui/react";
import useTranslation from "next-translate/useTranslation";
import { FaCaretDown, FaCaretUp } from "react-icons/fa";
import { Button } from "../ui/button";

const ColumnHeader = ({ column, handleSort, sortKey, sortDirection }) => {
    const { t } = useTranslation('validators');
    const { key, align, sort, sortKey: sortingKey } = column;
    return (
        <TableColumnHeader textAlign={align} onClick={() => handleSort(sortingKey ?? '')}>
            <Button variant='plain' w='150px' textAlign={align} p={0} justifyContent={align}>
                {t(key)} {!!sort && sortKey == sortingKey ?
                    sortDirection == 'asc' ? <FaCaretUp /> : <FaCaretDown /> : ''
                }
            </Button>
        </TableColumnHeader>
    )    
};

export default ColumnHeader;
