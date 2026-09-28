import fs from 'fs';
import path from 'path';
import {
  Kind,
  OperationTypeNode,
  parse,
  print,
} from 'graphql';
import type {
  DefinitionNode,
  DocumentNode,
  FragmentDefinitionNode,
  OperationDefinitionNode,
} from 'graphql';
import { readOnlyGraphqlError } from './graphql_proxy';

const documentsDir = path.join(__dirname, '..', 'graphql', 'general');

function isFragment(definition: DefinitionNode): definition is FragmentDefinitionNode {
  return definition.kind === Kind.FRAGMENT_DEFINITION;
}

function isOperation(definition: DefinitionNode): definition is OperationDefinitionNode {
  return definition.kind === Kind.OPERATION_DEFINITION;
}

// Every operation the explorer ships, printed the way Apollo sends it: one
// operation plus the fragments defined alongside it.
const operations = fs
  .readdirSync(documentsDir)
  .filter((file) => file.endsWith('.graphql'))
  .flatMap((file) => {
    const { definitions } = parse(fs.readFileSync(path.join(documentsDir, file), 'utf8'));
    const fragments = definitions.filter(isFragment);
    return definitions.filter(isOperation).map((operation) => {
      const document: DocumentNode = {
        kind: Kind.DOCUMENT,
        definitions: [operation, ...fragments],
      };
      return {
        name: `${file}:${operation.name?.value ?? 'anonymous'}`,
        type: operation.operation,
        query: print(document),
      };
    });
  });

function table(type: OperationTypeNode) {
  return operations
    .filter((operation) => operation.type === type)
    .map((operation) => [operation.name, operation.query]);
}

const mutation = 'mutation { delete_block(where: {}) { affected_rows } }';
const refused = 'Only GraphQL queries are allowed';

describe('readOnlyGraphqlError', () => {
  it.each(table(OperationTypeNode.QUERY))('forwards explorer query %s', (_name, query) => {
    const body = {
      query,
      variables: {},
    };
    expect(readOnlyGraphqlError(body)).toBeNull();
  });

  it.each(table(OperationTypeNode.SUBSCRIPTION))('refuses subscription %s', (_name, query) => {
    expect(readOnlyGraphqlError({ query })).toBe(refused);
  });

  it('refuses mutations, including one placed beside a query', () => {
    const mixed = {
      query: `query A { block { height } } ${mutation}`,
      operationName: 'A',
    };
    expect(readOnlyGraphqlError({ query: mutation })).toBe(refused);
    expect(readOnlyGraphqlError(mixed)).toBe(refused);
  });

  it('checks every request in a batch', () => {
    const read = { query: '{ block { height } }' };
    expect(readOnlyGraphqlError([read])).toBeNull();
    expect(readOnlyGraphqlError([read, { query: mutation }])).toBe(refused);
  });

  it('refuses malformed bodies', () => {
    expect(readOnlyGraphqlError(undefined)).toBe('Missing GraphQL query');
    expect(readOnlyGraphqlError({ query: '   ' })).toBe('Missing GraphQL query');
    expect(readOnlyGraphqlError({ query: '{ block {' })).toBe('Invalid GraphQL query');
    expect(readOnlyGraphqlError({ query: 'fragment F on block { height }' }))
      .toBe('Missing GraphQL operation');
    expect(readOnlyGraphqlError([])).toBe('Empty GraphQL request');
  });
});
