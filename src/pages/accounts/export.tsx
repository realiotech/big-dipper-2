import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  VStack,
  HStack,
  Text,
  Input,
} from '@chakra-ui/react';
import { NextSeo } from 'next-seo';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import { useExportTransactions } from '@/components/accounts/export_hook';
import { exportTransactionsToCSV } from '@/utils/csv_export';

type ExportFeedback = {
  type: 'error' | 'info';
  message: string;
} | null;

const parseDateInput = (dateInput: string, endOfDay = false): Date | null => {
  if (!dateInput) return null;

  const [year, month, day] = dateInput.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  if (endOfDay) {
    date.setHours(23, 59, 59, 999);
  } else {
    date.setHours(0, 0, 0, 0);
  }

  return date;
};

export default function ExportTransactionsPage() {
  const { t } = useTranslation('accounts');
  const router = useRouter();
  const { a: queryAddress } = router.query;
  
  const { state, queryTransactions, clearFilters, isLoading } = useExportTransactions();
  
  const [addressInput, setAddressInput] = useState('');
  const [startDateInput, setStartDateInput] = useState('');
  const [endDateInput, setEndDateInput] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [feedback, setFeedback] = useState<ExportFeedback>(null);

  // Pre-fill address from query parameter on mount (only once)
  useEffect(() => {
    if (queryAddress && typeof queryAddress === 'string' && !addressInput) {
      setAddressInput(queryAddress);
    }
  }, []);

  // Auto-download when data is ready
  useEffect(() => {
    if (isDownloading && state.error && !isLoading) {
      setIsDownloading(false);
      return;
    }

    if (isDownloading && state.rawData !== null && !isLoading) {
      if (state.rawData.length === 0) {
        setFeedback({
          type: 'info',
          message: 'No transactions found for the selected date range.',
        });
        setIsDownloading(false);
        setStartDateInput('');
        setEndDateInput('');
        clearFilters();
        return;
      }

      try {
        exportTransactionsToCSV(state.rawData, addressInput, startDateInput || null, endDateInput || null);
        setIsDownloading(false);
        setStartDateInput('');
        setEndDateInput('');
        clearFilters();
      } catch (error) {
        console.error('❌ CSV export error:', error);
        setFeedback({
          type: 'error',
          message: `Error exporting CSV: ${error instanceof Error ? error.message : 'Unknown error'}`,
        });
        setIsDownloading(false);
      }
    }
  }, [
    isDownloading,
    state.error,
    state.rawData,
    isLoading,
    addressInput,
    startDateInput,
    endDateInput,
    clearFilters,
  ]);

  const handleDownloadCSV = () => {
    if (!addressInput.trim()) {
      setFeedback({
        type: 'error',
        message: 'Please enter an address.',
      });
      return;
    }

    setFeedback(null);

    const startDate = parseDateInput(startDateInput);
    const endDate = parseDateInput(endDateInput, true);

    // Set flag to trigger download after query completes
    setIsDownloading(true);

    // Execute query
    queryTransactions(startDate, endDate, addressInput);
  };

  const handleClear = () => {
    setAddressInput('');
    setStartDateInput('');
    setEndDateInput('');
    setIsDownloading(false);
    setFeedback(null);
    clearFilters();
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
                onClick={handleDownloadCSV}
                loading={isDownloading || isLoading}
                colorScheme="green"
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

            {feedback && (
              <Box
                bg={feedback.type === 'error' ? 'red.50' : 'blue.50'}
                _dark={{ bg: feedback.type === 'error' ? 'red.900' : 'blue.900' }}
                p={3}
                borderRadius="md"
                borderLeft="4px"
                borderColor={feedback.type === 'error' ? 'red.500' : 'blue.500'}
              >
                <Text
                  color={feedback.type === 'error' ? 'red.700' : 'blue.700'}
                  _dark={{ color: feedback.type === 'error' ? 'red.200' : 'blue.200' }}
                  fontSize="sm"
                >
                  {feedback.message}
                </Text>
              </Box>
            )}

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


      </Box>
    </>
  );
}
