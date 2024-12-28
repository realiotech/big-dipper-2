import { Input } from "@chakra-ui/react"
import { useSearch } from "./hooks";

export default function SearchValidator({ callback }) {
    const { handleOnSubmit, handleOnChange, handleKeyDown, value } = useSearch(callback);

    return (
        <form onSubmit={handleOnSubmit}>
            <Input
                placeholder="Search Validator"
                maxW="300px"
                bg="white"
                borderRadius="md"
                onChange={handleOnChange}
                onKeyDown={handleKeyDown}
                value={value}
            />
        </form>
    )
}