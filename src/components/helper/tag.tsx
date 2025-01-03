import { Button } from "@/components/ui/button"
const HelpTag = ({ value, theme }) => {
    return (
        <Button colorPalette={theme} variant='surface' fontWeight={600}>{value}</Button>
    );
};

export default HelpTag;
