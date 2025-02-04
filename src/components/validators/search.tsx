import { Input } from "@chakra-ui/react"
import { useSearch } from "./hooks";

export default function SearchValidator({ callback }) {
    const { handleOnSubmit, handleOnChange, handleKeyDown, value } = useSearch(callback);

    return (
        <form style={{width:'100%', textAlign:'right'}} onSubmit={handleOnSubmit}>
            <Input
                placeholder="Search Validator"
                w={{ base: "full", lg: '300px' }}
                bg={{ base: "white", _dark: "black" }}
                borderRadius="full"
                onChange={handleOnChange}
                onKeyDown={handleKeyDown}
                value={value}
            />
        </form>
    )
}