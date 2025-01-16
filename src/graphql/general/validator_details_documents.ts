export const ValidatorDelegationsDocument = /* GraphQL */ `
query ValidatorDelegations($validatorAddress: String!, $offset: Int = 0, $limit: Int = 10) {
  ms_locks(limit: $limit, offset: $offset, where: {val_addr: {_eq: $validatorAddress}}) {
    bond_weight
    amount
    denom
    staker_addr
    val_addr
  }
  ms_locks_count(args: {val_addr: $validatorAddress}) {
    total
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
  ms_unlocks(limit: $limit, offset: $offset, where: {val_addr: {_eq: $validatorAddress}}) {
    bond_weight
    amount
    denom
    creation_height
    staker_addr
    val_addr
  }
  ms_unlocks_count(args: {val_addr: $validatorAddress}) {
    total
  }
`;
