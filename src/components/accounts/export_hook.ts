import { useRouter } from 'next/router';
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
 * Convert Date to YYYY-MM-DD format (matching Hasura timestamp format)
 * @param date - Date object to convert
 * @returns Date string in YYYY-MM-DD format
 */
const dateToISOString = (date: Date | null): string | null => {
  if (!date) return null;
  // Format: YYYY-MM-DD (e.g., "2025-09-24")
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};



export interface ExportTransactionsState {
  data: Transactions[];
  rawData: any[];
  isLoading: boolean;
  error: string | null;
  startDate: Date | null;
  endDate: Date | null;
}

export function useExportTransactions() {
  const router = useRouter();
  const address = router?.query?.address as string;
  
  const [state, setState] = useState<ExportTransactionsState>({
    data: [],
    rawData: [],
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
  const startDateStr = dateToISOString(state.startDate);
  const endDateStr = dateToISOString(state.endDate);

  const queryVariables = {
    limit: PAGE_SIZE,
    offset: 0,
    address: `{${address ?? ''}}`,
    types: msgTypes,
    startDate: startDateStr,
    endDate: endDateStr,
  };

  // Log the query when it's about to be executed
  if (!(!address || (!state.startDate && !state.endDate))) {
    console.log('📊 Export Query Variables:', queryVariables);
    console.log('📊 Start Date (YYYY-MM-DD):', startDateStr);
    console.log('📊 End Date (YYYY-MM-DD):', endDateStr);
    console.log('📊 Export GraphQL Query:', `
      query GetMessagesByAddressExport(
        $address: _text
        $limit: bigint = 50
        $offset: bigint = 0
        $types: _text = "{}"
        $startDate: timestamp
        $endDate: timestamp
      ) {
        messagesByAddress: messages_by_address(
          args: {addresses: $address, types: $types, limit: $limit, offset: $offset}
          where: {transaction: {block: {timestamp: {_gte: $startDate, _lt: $endDate}}}}
        ) {
          transaction {
            height
            hash
            success
            messages
            logs
            block {
              height
              timestamp
            }
          }
        }
      }
    `);
  }

  const transactionQuery = useGetMessagesByAddressExportQuery({
    variables: queryVariables,
    skip: !address || (!state.startDate && !state.endDate),
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
   * Query transactions with the specified date range
   */
  const queryTransactions = useCallback(
    (startDate: Date | null, endDate: Date | null) => {
      // Validate date range
      if (startDate && endDate && startDate > endDate) {
        handleSetState((prevState) => ({
          ...prevState,
          error: 'Start date must be before end date',
        }));
        return;
      }

      handleSetState((prevState) => ({
        ...prevState,
        startDate,
        endDate,
        isLoading: true,
        error: null,
      }));

      // Refetch with new parameters
      transactionQuery.refetch({
        limit: PAGE_SIZE,
        offset: 0,
        address: `{${address ?? ''}}`,
        types: msgTypes,
      });
    },
    [address, msgTypes, transactionQuery, handleSetState]
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
      rawData: [],
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

