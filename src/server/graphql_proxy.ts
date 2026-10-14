import {
  Kind,
  OperationTypeNode,
  parse,
} from 'graphql';
import type {
  DefinitionNode,
  OperationDefinitionNode,
} from 'graphql';

function isOperation(definition: DefinitionNode): definition is OperationDefinitionNode {
  return definition.kind === Kind.OPERATION_DEFINITION;
}

const requestError = (request: unknown): string | null => {
  const query = (request as { query?: unknown } | null)?.query;
  if (typeof query !== 'string' || !query.trim()) return 'Missing GraphQL query';

  let operations: OperationDefinitionNode[];
  try {
    operations = parse(query).definitions.filter(isOperation);
  } catch {
    return 'Invalid GraphQL query';
  }

  if (!operations.length) return 'Missing GraphQL operation';
  return operations.every((operation) => operation.operation === OperationTypeNode.QUERY)
    ? null
    : 'Only GraphQL queries are allowed';
};

/**
 * The browser proxy attaches the Hasura admin secret, so it may only forward
 * read-only documents. Returns a rejection message, or null when every
 * request in the (possibly batched) body contains nothing but queries.
 */
export function readOnlyGraphqlError(body: unknown): string | null {
  const requests = Array.isArray(body) ? body : [body];
  if (!requests.length) return 'Empty GraphQL request';
  return requests.map(requestError).find((error) => error !== null) ?? null;
}
