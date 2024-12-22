import React from 'react';
import { Box } from '@chakra-ui/react';

const CustomToolTip: React.FC<{
    className?: string;
    children: (data) => React.ReactNode;
    active?: boolean;
    payload?: any;
}> = (props) => {
    const {
        active,
        payload,
        children,
    } = props;
    if (payload && active && payload?.[0]) {
        const { payload: data } = payload?.[0];
        return (
            <Box>
                {children(data)}
            </Box>
        );
    }

    return null;
};

export default CustomToolTip;
