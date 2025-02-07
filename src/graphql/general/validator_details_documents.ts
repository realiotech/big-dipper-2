export const ValidatorDelegationsDocument = /* GraphQL */ `
  query ValidatorDelegations($validatorAddress: String!, $offset: Int = 0, $limit: Int = 10, $order: String! = "desc") {
    get_ms_locks_sorted(args: {p_order_direction: $order, p_limit: $limit, p_offset: $offset, p_val_addr: $validatorAddress}) {
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

export const ValidatorUndelegationsDocument = /* GraphQL */ `
  query ValidatorUndelegations($validatorAddress: String!, $offset: Int = 0, $limit: Int = 10, $order: String! = "desc") {
    get_ms_unlocks_sorted(args: {p_order_direction: $order, p_limit: $limit, p_offset: $offset, p_val_addr: $validatorAddress}) {
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
