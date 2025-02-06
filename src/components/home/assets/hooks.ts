import { useState } from 'react';
import {
    useSuppliesQuery,
} from '@/graphql/types/general_types';
import { ASSET_SEARCH } from '@/utils/utils';

export const useSupplies = () => {
    const [state, setState] = useState({
        loading: true,
        items: [],
    });

    useSuppliesQuery({
        onCompleted: (data) => {
            setState({
                loading: false,
                items: data.supply?.[0].coins.filter(item => ASSET_SEARCH.includes(item?.denom)),
            });
        },
    });

    return state;
};
