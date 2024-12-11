import { useMemo } from 'react';

const AddressEllipsis = ({ content, ...rest }) => {
    const beginning = useMemo(() => {
        const midIndex = (content?.length ?? 0) / 2;

        if (!content) return '';

        const index = (() => {
            if (content.length < 10) return midIndex - 3;
            if (content.length < 30) return midIndex + 3;
            return midIndex + 9;
        })();

        return (content ?? '').substring(0, Math.max(0, index));
    }, [content]);

    const ending = (content ?? '').substring(beginning.length);
    return (
        <Text {...rest}>
        </Text>
    );
};

export default AddressEllipsis;
