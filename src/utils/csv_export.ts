/**
 * Utility functions for exporting data to CSV format
 */

/**
 * Escape CSV field values to handle commas, quotes, and newlines
 * @param field - The field value to escape
 * @returns Escaped field value
 */
const escapeCSVField = (field: any): string => {
  if (field === null || field === undefined) {
    return '';
  }

  const stringValue = String(field);

  // If the field contains comma, quote, or newline, wrap it in quotes and escape internal quotes
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
};

/**
 * Format timestamp to readable date/time string
 * @param timestamp - ISO timestamp string
 * @returns Formatted date/time string
 */
const formatTimestamp = (timestamp: string | null | undefined): string => {
  if (!timestamp) return '';

  try {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  } catch (error) {
    return timestamp;
  }
};

/**
 * Format fee amount from array of coins
 * @param fee - Fee array from transaction
 * @returns Formatted fee string
 */
const formatFee = (fee: any): string => {
  if (!fee || fee.length === 0) {
    return '';
  }

  return fee.amount.map((coin: any) => {
    const amount = coin?.amount || '0';
    const denom = coin?.denom || '';
    return `${amount}${denom}`;
  }).join(', ');
};

/**
 * Format gas information
 * @param gasUsed - Gas used
 * @param gasWanted - Gas wanted/limit
 * @returns Formatted gas string
 */
const formatGas = (gasUsed: any, gasWanted: any): string => {
  const used = gasUsed || '0';
  const wanted = gasWanted || '0';
  return `${used}/${wanted}`;
};

/**
 * Format messages array to string
 * @param messages - Messages array from transaction
 * @returns Formatted messages string
 */
const formatMessages = (messages: any): string => {
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return '';
  }

  return messages
    .map((msg: any) => {
      if (typeof msg === 'string') {
        try {
          const parsed = JSON.parse(msg);
          return parsed['@type'] || 'Unknown';
        } catch {
          return msg;
        }
      }
      return msg['@type'] || 'Unknown';
    })
    .join('; ');
};

/**
 * Format logs to string
 * @param logs - Logs array from transaction
 * @returns Formatted logs string
 */
const formatLogs = (logs: any): string => {
  if (!logs) return '';

  if (Array.isArray(logs)) {
    return logs
      .map((log: any) => {
        if (typeof log === 'string') {
          return log;
        }
        return JSON.stringify(log);
      })
      .join('; ');
  }

  return String(logs);
};

/**
 * Export transactions to CSV format
 * @param transactions - Array of transaction objects with raw data
 * @param address - Account address for filename
 * @param startDate - Start date for filename
 * @param endDate - End date for filename
 */
export const exportTransactionsToCSV = (
  transactions: any[],
  address: string,
  startDate: string | null,
  endDate: string | null
): void => {
  try {
    if (!transactions || transactions.length === 0) {
      throw new Error('No transactions to export');
    }

    // CSV Header
    const headers = [
      'Hash',
      'Height',
      'Time',
      'Fee',
      'Gas',
      'Message',
      'Code',
      'Raw Log',
    ];

    // CSV Rows
    const rows = transactions.map((tx: any, index: number) => {
      try {
        const transaction = tx.transaction || tx;
        return [
          escapeCSVField(transaction.hash),
          escapeCSVField(transaction.height),
          escapeCSVField(formatTimestamp(transaction.block?.timestamp)),
          formatFee(transaction.fee),
          formatGas(transaction.gasUsed, transaction.gasWanted),
          formatMessages(transaction.messages),
          escapeCSVField(transaction.success ? '0' : '1'),
          escapeCSVField(formatLogs(transaction.rawLog)),
        ];
      } catch (error) {
        console.error(`Error processing transaction ${index}:`, error);
        throw error;
      }
    });

    // Combine headers and rows
    const csvContent = [
      headers.map(escapeCSVField).join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n');

    // Generate filename
    const cleanAddress = address.replace(/[{}]/g, '');
    const startDateStr = startDate || 'all';
    const endDateStr = endDate || 'all';
    const filename = `transactions_${cleanAddress}_${startDateStr}_to_${endDateStr}.csv`;

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();

    // Clean up
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
  } catch (error) {
    console.error('❌ CSV export error:', error);
    throw error;
  }
};

