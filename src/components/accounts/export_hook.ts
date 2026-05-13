import { useState, useCallback } from 'react';
import * as R from 'ramda';

import {
  GetMessagesByAddressExportQuery,
  useGetMessagesByAddressExportQuery,
} from '@/graphql/types/general_types';

import { convertMsgsToModels } from '@/components/msg/utils';
import { convertMsgType } from '@/utils/convert_msg_type';
import { useRecoilValue } from 'recoil';
import { readFilter } from '@/recoil/transactions_filter';

const PAGE_SIZE = 100000;

const formatTransactions = (data: GetMessagesByAddressExportQuery): Transactions[] => {
  let formattedData = data.messagesByAddress;
  if (data.messagesByAddress.length === 51) {
    formattedData = data.messagesByAddress.slice(0, 51);
  }
  return formattedData.map((x) => {
    const { transaction } = x;
    const messages = convertMsgsToModels(transaction);
    const msgType = messages.map((eachMsg) => {
      const eachMsgType = eachMsg?.type ?? 'none type';
      return eachMsgType ?? '';
    });
    const convertedMsgType = convertMsgType(msgType);
    return {
      height: transaction?.height,
      hash: transaction?.hash ?? '',
      type: convertedMsgType,
      messages: {
        count: messages.length,
        items: messages,
      },
      success: transaction?.success ?? false,
      timestamp: transaction?.block.timestamp,
    };
  });
};

/**
 * Convert Date to a Hasura timestamp while preserving the selected time.
 * @param date - Date object to convert
 * @returns Date string in YYYY-MM-DDTHH:mm:ss.SSS format
 */
const dateToHasuraTimestamp = (date: Date | null): string | null => {
  if (!date) return null;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  const milliseconds = String(date.getMilliseconds()).padStart(3, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}`;
};



export interface ExportTransactionsState {
  data: Transactions[];
  rawData: any[] | null;
  isLoading: boolean;
  error: string | null;
  startDate: Date | null;
  endDate: Date | null;
}

export function useExportTransactions() {
  const [currentAddress, setCurrentAddress] = useState<string>('');

  const [state, setState] = useState<ExportTransactionsState>({
    data: [],
    rawData: null,
    isLoading: false,
    error: null,
    startDate: null,
    endDate: null,
  });

  const msgTypes = useRecoilValue(readFilter);

  const handleSetState = useCallback(
    (stateChange: (prevState: ExportTransactionsState) => ExportTransactionsState) => {
      setState((prevState) => {
        const newState = stateChange(prevState);
        return R.equals(prevState, newState) ? prevState : newState;
      });
    },
    []
  );

  // Query to fetch transactions for the address with date range filtering
  const startDateStr = dateToHasuraTimestamp(state.startDate);
  const endDateStr = dateToHasuraTimestamp(state.endDate);

  const queryVariables = {
    limit: PAGE_SIZE,
    offset: 0,
    address: `{${currentAddress ?? ''}}`,
    types: msgTypes,
    startDate: startDateStr,
    endDate: endDateStr,
  };

  const transactionQuery = useGetMessagesByAddressExportQuery({
    variables: queryVariables,
    skip: !currentAddress || (!state.startDate && !state.endDate),
    onCompleted: (data) => {
      const formattedData = formatTransactions(data);
      const rawTransactionData = data.messagesByAddress || [];

      handleSetState((prevState) => ({
        ...prevState,
        data: formattedData,
        rawData: rawTransactionData,
        isLoading: false,
        error: null,
      }));
    },
    onError: (error) => {
      console.error('❌ Export Query Error:', error);
      handleSetState((prevState) => ({
        ...prevState,
        isLoading: false,
        error: error.message || 'Failed to fetch transactions',
      }));
    },
  });

  /**
   * Query transactions with the specified date range and address
   */
  const queryTransactions = useCallback(
    (startDate: Date | null, endDate: Date | null, address: string) => {
      // Validate address
      if (!address || !address.trim()) {
        handleSetState((prevState) => ({
          ...prevState,
          error: 'Address is required',
        }));
        return;
      }

      // Validate date range
      if (startDate && endDate && startDate > endDate) {
        handleSetState((prevState) => ({
          ...prevState,
          error: 'Start date must be before end date',
        }));
        return;
      }

      // Update current address
      setCurrentAddress(address);

      handleSetState((prevState) => ({
        ...prevState,
        startDate,
        endDate,
        isLoading: true,
        rawData: null,
        error: null,
      }));

      // Refetch with new parameters
      transactionQuery.refetch({
        limit: PAGE_SIZE,
        offset: 0,
        address: `{${address}}`,
        types: msgTypes,
        startDate: dateToHasuraTimestamp(startDate),
        endDate: dateToHasuraTimestamp(endDate),
      });
    },
    [msgTypes, transactionQuery, handleSetState]
  );

  /**
   * Clear filters and reset state
   */
  const clearFilters = useCallback(() => {
    handleSetState((prevState) => ({
      ...prevState,
      startDate: null,
      endDate: null,
      data: [],
      rawData: null,
      error: null,
    }));
  }, [handleSetState]);

  return {
    state,
    queryTransactions,
    clearFilters,
    isLoading: transactionQuery.loading,
  };
}
