import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parse } from 'yaml';
import { describe, expect, it } from 'vitest';

interface Operation {
  security: Array<Record<string, unknown>>;
  'x-teralya-api-code': string;
}

interface Contract {
  openapi: string;
  paths: Record<string, Record<string, Operation>>;
}

const HTTP_METHODS = new Set(['get', 'post', 'put', 'patch', 'delete']);

function contractPath(): string {
  const candidates = [
    resolve(import.meta.dirname, '../../../docs/INF/openapi/teralya-openapi-v1.1.yaml'),
    resolve(import.meta.dirname, '../../../teralya-openapi-v1.1.yaml'),
  ];
  const found = candidates.find((candidate) => existsSync(candidate));
  if (found === undefined) {
    throw new Error('No se encontró el OpenAPI aprobado de Teralya.');
  }
  return found;
}

function operations(contract: Contract): Operation[] {
  return Object.values(contract.paths).flatMap((pathItem) =>
    Object.entries(pathItem)
      .filter(([method]) => HTTP_METHODS.has(method))
      .map(([, operation]) => operation),
  );
}

describe('approved OpenAPI contract', () => {
  const contract = parse(readFileSync(contractPath(), 'utf8')) as Contract;
  const allOperations = operations(contract);

  it('keeps the approved surface unchanged', () => {
    expect(contract.openapi).toBe('3.1.0');
    expect(Object.keys(contract.paths)).toHaveLength(42);
    expect(allOperations).toHaveLength(51);
    expect(new Set(allOperations.map((operation) => operation['x-teralya-api-code'])).size).toBe(51);
    expect(contract.paths['/health']).toBeUndefined();
    expect(contract.paths['/metrics']).toBeUndefined();
  });

  it('keeps the approved security boundary', () => {
    const publicCodes = new Set(['API-001', 'API-002', 'API-003', 'API-004', 'API-005', 'API-009', 'API-010', 'API-029', 'API-030']);
    for (const operation of allOperations) {
      if (publicCodes.has(operation['x-teralya-api-code'])) {
        expect(operation.security).toEqual([]);
      } else {
        expect(operation.security).toEqual([{ BearerOpaque: [] }]);
      }
    }
  });
});
