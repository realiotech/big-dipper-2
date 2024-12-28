/**
 * Util to get the validator status and theme
 * @param status 0-3
 * @param jailed boolean
 * @returns an object with status and theme
 */
export const getValidatorStatus = (status: number, jailed: boolean, tombstoned: boolean) => {
  const results: { status: string; theme: TagTheme } = {
    status: 'na',
    theme: 'gray',
  };

  // jailed and tombstone statuses are prioritised over their unbonding state
  if (tombstoned) {
    results.status = 'tombstoned';
    results.theme = 'gray';
    return results;
  }

  if (jailed) {
    results.status = 'jailed';
    results.theme = 'gray';
    return results;
  }

  if (status === 3) {
    results.status = 'active';
    results.theme = 'green';
  } else if (status === 2) {
    results.status = 'unbonding';
    results.theme = 'yellow';
  } else if (status === 1) {
    results.status = 'unbonded';
    results.theme = 'red';
  } else {
    results.status = 'unknown';
    results.theme = 'cyan';
  }

  return results;
};
