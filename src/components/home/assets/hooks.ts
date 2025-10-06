import { useState } from 'react';
import {
    useSuppliesQuery,
} from '@/graphql/types/general_types';
import { searchData } from '@/configs';

export const useSupplies = () => {
    const [state, setState] = useState({
        loading: true,
        items: [],
    });

    useSuppliesQuery({
        onCompleted: (data) => {
            setState({
                loading: false,
                items: data.supply?.[0].coins.filter(item => searchData.seeds.includes(item?.denom) && item?.denom != 'almx'),
            });
        },
    });

    return state;
};
