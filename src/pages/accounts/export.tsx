import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  VStack,
  HStack,
  Text,
  Input,
  Center,
  Spinner,
} from '@chakra-ui/react';
import { NextSeo } from 'next-seo';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import { useExportTransactions } from '@/components/accounts/export_hook';
import TxTable from '@/components/transactions/table';
import { exportTransactionsToCSV } from '@/utils/csv_export';

export default function ExportTransactionsPage() {
  const { t } = useTranslation('accounts');
  const router = useRouter();
  const { a: queryAddress } = router.query;
  
  const { state, queryTransactions, clearFilters, isLoading } = useExportTransactions();
  
  const [addressInput, setAddressInput] = useState('');
  const [startDateInput, setStartDateInput] = useState('');
  const [endDateInput, setEndDateInput] = useState('');

  // Pre-fill address from query parameter on mount
  useEffect(() => {
    if (queryAddress && typeof queryAddress === 'string') {
      setAddressInput(queryAddress);
    }
  }, [queryAddress]);

  const handleQuery = () => {
    if (!addressInput.trim()) {
      alert('Please enter an address');
      return;
    }

    const startDate = startDateInput ? new Date(startDateInput) : null;
    const endDate = endDateInput ? new Date(endDateInput) : null;

    // Set end date to end of day if provided
    if (endDate) {
      endDate.setHours(23, 59, 59, 999);
    }

    queryTransactions(startDate, endDate, addressInput);
  };

  const handleClear = () => {
    setStartDateInput('');
    setEndDateInput('');
    clearFilters();
  };

  const handleDownloadCSV = () => {
    try {
      if (!state.rawData || state.rawData.length === 0) {
        alert('No transactions to export');
        return;
      }

      exportTransactionsToCSV(state.rawData, addressInput, startDateInput || null, endDateInput || null);
    } catch (error) {
      console.error('❌ CSV export error:', error);
      alert(`Error exporting CSV: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <>
      <NextSeo
        title={t('exportTransactions') ?? undefined}
        openGraph={{
          title: t('exportTransactions') ?? undefined,
        }}
      />
      
      <Box minH="100vh">
        {/* Header */}
        <Box
          bg={{ base: '#FAFBFC', _dark: '#0F0F0F' }}
          p={6}
          borderRadius="md"
          boxShadow="sm"
          mb={8}
        >
          <Text fontSize="2xl" fontWeight="bold" mb={2}>
            {t('exportTransactions')}
          </Text>
          <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }}>
            Export transactions for any address with date range filtering
          </Text>
        </Box>

        {/* Filter Section */}
        <Box
          bg={{ base: '#FAFBFC', _dark: '#0F0F0F' }}
          p={6}
          borderRadius="md"
          boxShadow="sm"
          mb={8}
        >
          <Text fontSize="lg" fontWeight="bold" mb={4}>
            {t('overview')}
          </Text>
          
          <VStack align="stretch" gap={4}>
            {/* Address Input */}
            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={2}>
                {t('address')}
              </Text>
              <Input
                type="text"
                value={addressInput}
                onChange={(e) => setAddressInput(e.target.value)}
                placeholder="Enter account address (e.g., realio1xxx...)"
                bg={{ base: 'white', _dark: '#262626' }}
                borderColor={{ base: 'gray.200', _dark: 'gray.700' }}
              />
            </Box>

            {/* Date Range Inputs */}
            <HStack gap={4} flexWrap={{ base: 'wrap', md: 'nowrap' }}>
              <Box flex={1} minW={{ base: '100%', md: 'auto' }}>
                <Text fontSize="sm" fontWeight="medium" mb={2}>
                  {t('startDate')}
                </Text>
                <Input
                  type="date"
                  value={startDateInput}
                  onChange={(e) => setStartDateInput(e.target.value)}
                  placeholder="Select start date"
                  bg={{ base: 'white', _dark: '#262626' }}
                  borderColor={{ base: 'gray.200', _dark: 'gray.700' }}
                />
              </Box>

              <Box flex={1} minW={{ base: '100%', md: 'auto' }}>
                <Text fontSize="sm" fontWeight="medium" mb={2}>
                  {t('endDate')}
                </Text>
                <Input
                  type="date"
                  value={endDateInput}
                  onChange={(e) => setEndDateInput(e.target.value)}
                  placeholder="Select end date"
                  bg={{ base: 'white', _dark: '#262626' }}
                  borderColor={{ base: 'gray.200', _dark: 'gray.700' }}
                />
              </Box>
            </HStack>

            {/* Action Buttons */}
            <HStack gap={3} justifyContent="flex-start">
              <Button
                onClick={handleQuery}
                loading={isLoading}
                colorScheme="blue"
              >
                {t('query')}
              </Button>
              <Button
                onClick={handleDownloadCSV}
                disabled={state.data.length === 0}
                colorScheme="green"
                variant="outline"
              >
                Download CSV
              </Button>
              <Button
                onClick={handleClear}
                variant="outline"
              >
                Clear
              </Button>
            </HStack>

            {state.error && (
              <Box
                bg="red.50"
                _dark={{ bg: 'red.900' }}
                p={3}
                borderRadius="md"
                borderLeft="4px"
                borderColor="red.500"
              >
                <Text color="red.700" _dark={{ color: 'red.200' }} fontSize="sm">
                  {state.error}
                </Text>
              </Box>
            )}
          </VStack>
        </Box>

        {/* Results Section - Only show after query is executed */}
        {state.startDate || state.endDate ? (
          <Box
            bg={{ base: '#FAFBFC', _dark: '#0F0F0F' }}
            overflow="auto"
            py={6}
            px={2}
            borderRadius="md"
            boxShadow="sm"
            mb={8}
          >
            <Text fontSize="lg" px={4} fontWeight="bold" mb="4">
              {t('transactions')} ({state.data.length})
            </Text>

            {isLoading ? (
              <Center py={10}>
                <Spinner />
              </Center>
            ) : state.data.length > 0 ? (
              <TxTable transactions={state.data} isLoading={false} />
            ) : (
              <Center py={10}>
                <Text color="gray.500" _dark={{ color: 'gray.400' }}>
                  {t('noTransactionsFound')}
                </Text>
              </Center>
            )}
          </Box>
        ) : null}
      </Box>
    </>
  );
}

