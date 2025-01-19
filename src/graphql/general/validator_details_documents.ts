export const ValidatorDelegationsDocument = /* GraphQL */ `
  query ValidatorDelegations($validatorAddress: String!, $offset: Int = 0, $limit: Int = 10) {
    ms_locks(limit: $limit, offset: $offset, where: {val_addr: {_eq: $validatorAddress}}) {
      bond_weight
      amount
      denom
      staker_addr
      val_addr
    }
    locks_count_by_val(args: {address: $validatorAddress}) {
      count
    }
  }
`;

export const ValidatorRedelegationsDocument = /* GraphQL */ `
  query ValidatorRedelegations(
    $validatorAddress: String!
    $offset: Int = 0
    $limit: Int = 10
    $pagination: Boolean! = true
  ) {
    redelegations: action_validator_redelegations_from(
      address: $validatorAddress
      limit: $limit
      offset: $offset
      count_total: $pagination
    ) {
      redelegations
      pagination
    }
  }
`;

export const ValidatorUndelegationsDocument = /* GraphQL */ `
  query ValidatorUndelegations($validatorAddress: String!, $offset: Int = 0, $limit: Int = 10) {
    ms_unlocks(limit: $limit, offset: $offset, where: {val_addr: {_eq: $validatorAddress}}) {
      bond_weight
      amount
      denom
      creation_height
      staker_addr
      val_addr
    }
    unlocks_count_by_val(args: {address: $validatorAddress}) {
      count
    }
  }
`;
