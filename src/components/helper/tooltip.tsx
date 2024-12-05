import { Box } from '@chakra-ui/react';
import React from 'react';

const CustomToolTip: React.FC<{
    children: (data) => React.ReactNode;
    active?: boolean;
    payload?: any;
}> = (props) => {
    const {
        active,
        payload,
        children,
    } = props;
    if (payload && active) {
        const { payload: data } = payload?.[0];
        return (
            <Box bgColor={'red.400'} p={2}>
                {children(data)}
            </Box>
        );
    }

    return null;
};

export default CustomToolTip;
