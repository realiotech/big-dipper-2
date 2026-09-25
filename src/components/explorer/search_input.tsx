import { Input } from "@chakra-ui/react";
import useTranslation from "next-translate/useTranslation";
import { LuSearch } from "react-icons/lu";
import { InputGroup } from "@/components/ui/input-group";
import { useSearch, useSearchBar } from "@/components/layout/hooks";

export const SearchInput = ({ height = "44px" }: { height?: string }) => {
  const { t } = useTranslation("common");
  const { handleOnSubmit: submitCallback } = useSearchBar(t);
  const { handleOnSubmit, handleOnChange, handleKeyDown, value } = useSearch(submitCallback);

  return (
    <form onSubmit={handleOnSubmit} style={{ width: "100%" }}>
      <InputGroup w="full" startElement={<LuSearch />} startElementProps={{ color: "explorer.muted" }}>
        <Input
          h={height}
          w="full"
          fontSize="sm"
          bg="explorer.card"
          color="explorer.text"
          borderColor="explorer.border"
          borderRadius="6px"
          _placeholder={{ color: "explorer.muted" }}
          _focusVisible={{ borderColor: "explorer.accent", outline: "none" }}
          onChange={handleOnChange}
          onKeyDown={handleKeyDown}
          value={value}
          placeholder="Search by block height, tx hash, address or validator"
        />
      </InputGroup>
    </form>
  );
};
