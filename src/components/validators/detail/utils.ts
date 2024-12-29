import { getValidatorStatus } from '@/utils/get_validator_status';

export const getStatusTheme = getValidatorStatus;

export const getCondition = (condition: number, status: number) => {
  let result = { condition: 'na', color: 'gray' };
  if (status === 3) {
    if (condition > 90) {
      result = { condition: 'good', color: 'green' };
    } else if (condition > 70 && condition < 90) {
      result = { condition: 'moderate', color: 'purple' };
    } else {
      result = { condition: 'bad', color: 'red' };
    }
  }
  return result;
};
