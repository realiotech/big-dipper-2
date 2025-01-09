export type StakeValueMap = {
    [key: string]: string
}
export type HeroState = {
    bonded: StakeValueMap;
    unbonding: StakeValueMap;
    loading: boolean;
}