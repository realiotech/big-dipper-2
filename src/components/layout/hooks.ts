import { ChangeEventHandler, KeyboardEventHandler, useState } from 'react';

import { chainConfig } from '@/configs';
import { readValidator } from '@/recoil/validators';
import {
    ACCOUNT_DETAILS,
    BLOCK_DETAILS,
    PROFILE_DETAILS,
    TRANSACTION_DETAILS,
    VALIDATOR_DETAILS,
} from '@/utils/go_to_page';
import { isValidAddress } from '@/utils/prefix_convert';
import type { TFunction } from '@/hooks/useAppTranslation';
import { useRouter } from 'next/router';
import numeral from 'numeral';
import { toast } from 'react-toastify';
import { useRecoilCallback } from 'recoil';
import { ethToRealionetwork } from '@realiotech/address-generator';
import { searchData } from '@/configs';

const { extra, prefix } = chainConfig;
// Full bech32 shape (prefix, separator "1", data), so names such as
// "Realio Italy" are not mistaken for addresses.
const bech32 = (hrp: string) => new RegExp(`^${hrp}1[02-9ac-hj-np-z]{38,}$`);
const consensusRegex = bech32(prefix.consensus);
const validatorRegex = bech32(prefix.validator);
const userRegex = bech32(prefix.account);
const evmRegex = new RegExp(`^(0x)`);
import {
    ValidatorSearchDocument,
    ValidatorSearchQuery,
} from '@/graphql/types/general_types';
import { useApolloClient } from '@apollo/client';

export const useSearch = (callback: (value: string, clear?: () => void) => void) => {
    const [value, setValue] = useState('');
    const handleOnChange: ChangeEventHandler<HTMLInputElement> = (e) => {
        const newValue = e?.target?.value ?? '';
        setValue(newValue);
    };

    const handleOnSubmit = () => {
        callback(value, clear);
    };

    const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = (e) => {
        const shift = e?.shiftKey;
        const isEnter = e?.keyCode === 13 || e?.key === 'Enter';
        if (isEnter && !shift) {
            e.preventDefault();
            callback(value, clear);
        }
    };

    const clear = () => {
        setValue('');
    };

    return {
        handleOnChange,
        handleOnSubmit,
        value,
        handleKeyDown,
    };
};

export const useSearchBar = (t: TFunction) => {
    const router = useRouter();
    const apollo = useApolloClient();

    const handleOnSubmit = useRecoilCallback(
        ({ snapshot }) =>
            async (value: string, clear?: () => void) => {
                const parsedValue = value.replace(/\s+/g, '')
                if (searchData.seeds.includes(parsedValue.toLowerCase())) {
                    router.push(`/${searchData[parsedValue.toLowerCase()].path}/${searchData[parsedValue.toLowerCase()].value}`)
                } else if (consensusRegex.test(parsedValue)) {
                    const validatorAddress = await snapshot.getPromise(readValidator(parsedValue));
                    if (validatorAddress) {
                        router.push(VALIDATOR_DETAILS(validatorAddress.validator));
                    } else {
                        toast<string>(t('common:useValidatorAddress'));
                    }
                } else if (validatorRegex.test(parsedValue)) {
                    if (isValidAddress(parsedValue)) {
                        router.push(VALIDATOR_DETAILS(parsedValue));
                    } else {
                        toast<string>(t('common:invalidAddress'));
                    }
                } else if (userRegex.test(parsedValue)) {
                    if (isValidAddress(parsedValue)) {
                        router.push(ACCOUNT_DETAILS(parsedValue));
                    } else {
                        toast<string>(t('common:invalidAddress'));
                    }
                } else if (parsedValue.length === 42 && evmRegex.test(parsedValue)) {
                    let realioAddr = ethToRealionetwork(parsedValue)
                    if (isValidAddress(realioAddr)) {
                        router.push(ACCOUNT_DETAILS(realioAddr));
                    } else {
                        toast<string>(t('common:invalidAddress'));
                    }
                } else if (parsedValue.length === 66 && evmRegex.test(parsedValue)) {
                    // The EVM page reads Blockscout, which also has transactions older than the indexer.
                    router.push(TRANSACTION_DETAILS(parsedValue.toLowerCase()));
                } else if (/^@/.test(parsedValue)) {
                    const configProfile = extra.profile;
                    if (!configProfile) {
                        toast<string>(t('common:profilesNotEnabled'));
                    } else if (parsedValue === '@') {
                        toast<string>(t('common:insertValidDtag'));
                    } else {
                        router.push(PROFILE_DETAILS(parsedValue));
                    }
                } else if (/^\d[\d,]*$/.test(parsedValue)) {
                    router.push(BLOCK_DETAILS(String(numeral(parsedValue).value())));
                } else if (/^[0-9a-fA-F]{64}$/.test(parsedValue)) {
                    router.push(TRANSACTION_DETAILS(parsedValue));
                } else {
                    // Anything else is treated as part of a validator's name.
                    const { data } = await apollo.query<ValidatorSearchQuery>({
                        query: ValidatorSearchDocument,
                        variables: { query: `%${value.trim()}%`, limit: 2 },
                    });
                    const matches = data?.matches ?? [];
                    const operator = matches[0]?.validator?.validatorInfo?.operatorAddress;
                    if (matches.length === 1 && operator) {
                        router.push(VALIDATOR_DETAILS(operator));
                    } else {
                        router.push({ pathname: '/search', query: { q: value.trim() } });
                    }
                }

                if (clear) {
                    clear();
                }
            },
        [apollo, router, t]
    );

    return {
        handleOnSubmit,
    };
};
