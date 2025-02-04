import { useSearch, useSearchBar } from "./hooks";
import { InputGroup } from "../ui/input-group";
import { Search } from "@/components/icons/search";
import { Input } from "@chakra-ui/react";
import useTranslation from "next-translate/useTranslation";

export default function SearchBar() {
    const { t } = useTranslation('common');
    const { handleOnSubmit: submitCallback } = useSearchBar(t);
    const { handleOnSubmit, handleOnChange, handleKeyDown, value } = useSearch(submitCallback);

    return (
        <form onSubmit={handleOnSubmit}>
            <InputGroup startElement={<Search />}>
                <Input
                    h="60px"
                    borderRadius="60px"
                    border={{base: '1px solid #707D8A', _dark: '1px solid white'}}
                    fontSize={"16px"}
                    w={{ base: "full", lg: "550px" }}
                    onChange={e => handleOnChange(e)}
                    onKeyDown={e => handleKeyDown(e)}
                    value={value}
                    placeholder="Search for validator / tx hash / block height / address"
                />
            </InputGroup>
        </form>
    )
}