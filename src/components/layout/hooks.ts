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
import { ASSET_SEARCH } from '@/utils/utils';
const { extra, prefix } = chainConfig;
const consensusRegex = new RegExp(`^(${prefix.consensus})`);
const validatorRegex = new RegExp(`^(${prefix.validator})`);
const userRegex = new RegExp(`^(${prefix.account})`);
const assetRegex = new RegExp(`^(a)`);

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

    const handleOnSubmit = useRecoilCallback(
        ({ snapshot }) =>
            async (value: string, clear?: () => void) => {
                const parsedValue = value.replace(/\s+/g, '');

                if (consensusRegex.test(parsedValue)) {
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
                } else if (ASSET_SEARCH.includes(parsedValue.toLocaleLowerCase())){
                    let valueLower = parsedValue.toLocaleLowerCase()
                    if (assetRegex.test(valueLower)) {
                        router.push(`/assets/${valueLower}`);
                    } else {
                        router.push(`/assets/a${valueLower}`);
                    }

                } else if (/^@/.test(parsedValue)) {
                    const configProfile = extra.profile;
                    if (!configProfile) {
                        toast<string>(t('common:profilesNotEnabled'));
                    } else if (parsedValue === '@') {
                        toast<string>(t('common:insertValidDtag'));
                    } else {
                        router.push(PROFILE_DETAILS(parsedValue));
                    }
                } else if (/^-?\d+$/.test(String(numeral(parsedValue).value()))) {
                    router.push(BLOCK_DETAILS(String(numeral(parsedValue).value())));
                } else {
                    router.push(TRANSACTION_DETAILS(parsedValue));
                }

                if (clear) {
                    clear();
                }
            },
        [router, t]
    );

    return {
        handleOnSubmit,
    };
};
