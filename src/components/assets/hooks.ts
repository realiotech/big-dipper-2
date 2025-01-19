import { useState } from "react";
import { useAssetOverviewQuery } from "@/graphql/types/general_types";
import { useRouter } from "next/router";
import { OverviewState } from "./type";

export function useOverview() {
    const router = useRouter()
    const denom = router?.query?.denom as string
    const [state, setState] = useState<OverviewState>({ denom, supply: '0', holders: 0})

    useAssetOverviewQuery({
        variables: {
            denom
        },
        onCompleted: (data) => {
            setState({
                denom,
                supply: data.supply_by_denom?.[0].amount,
                holders: data.token_holder?.[0].num_holder
            })
        },
    })
    return state
}