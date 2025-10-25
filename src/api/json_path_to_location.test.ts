import { json_path_to_location } from './json_path_to_location.js';

// Simple test runner
function test(name: string, fn: () => void) {
    try {
        fn();
        console.log(`✅ ${name}`);
    } catch (error) {
        console.error(`❌ ${name}: ${error instanceof Error ? error.message : error}`);
    }
}

function assert(condition: boolean, message: string = 'Assertion failed') {
    if (!condition) {
        throw new Error(message);
    }
}

function assertThrows(fn: () => void, expectedMessage?: string) {
    try {
        fn();
        throw new Error('Expected function to throw, but it did not');
    } catch (error) {
        if (expectedMessage && error instanceof Error) {
            assert(error.message.includes(expectedMessage), `Expected error message to contain "${expectedMessage}", but got: "${error.message}"`);
        }
    }
}

// Test data
const validJsonString = `{
  "name": "John Doe",
  "age": 30
}`;
const jsonObject = { name: "John Doe", age: 30 };

console.log('Running json_path_to_location tests...\n');

// Test 1: Valid string input should work
test('Valid JSON string input', () => {
    const result = json_path_to_location(['name'], validJsonString);
    assert(result !== null, 'Should return a location for valid path');
    assert(result?.line === 2, 'Should return correct line');
    assert(result?.column === 11, 'Should return correct column');
});

// Test 2: Non-string input should throw error
test('Non-string input should throw error', () => {
    assertThrows(
        () => json_path_to_location(['name'], jsonObject as any),
        'json parameter must be a string'
    );
});

// Test 3: JSON.stringify result passed to function should throw
test('JSON.stringify result passed to function should throw', () => {
    const stringifiedJson = JSON.stringify(jsonObject);
    // This should work fine since JSON.stringify returns a string
    const result = json_path_to_location(['name'], stringifiedJson);
    assert(result !== null, 'JSON.stringify result should work as it returns a string');
});

// Test 4: Actually test the scenario where someone passes an object instead of string
test('Object instead of string should throw', () => {
    assertThrows(
        () => json_path_to_location(['name'], jsonObject as any),
        'json parameter must be a string'
    );
});

// Test 5: Array instead of string should throw
test('Array instead of string should throw', () => {
    assertThrows(
        () => json_path_to_location(['name'], [1, 2, 3] as any),
        'json parameter must be a string'
    );
});

// Test 6: Number instead of string should throw
test('Number instead of string should throw', () => {
    assertThrows(
        () => json_path_to_location(['name'], 123 as any),
        'json parameter must be a string'
    );
});

// Test 7: Boolean instead of string should throw
test('Boolean instead of string should throw', () => {
    assertThrows(
        () => json_path_to_location(['name'], true as any),
        'json parameter must be a string'
    );
});

// Test 8: null instead of string should throw
test('null instead of string should throw', () => {
    assertThrows(
        () => json_path_to_location(['name'], null as any),
        'json parameter must be a string'
    );
});

// Test 9: undefined instead of string should throw
test('undefined instead of string should throw', () => {
    assertThrows(
        () => json_path_to_location(['name'], undefined as any),
        'json parameter must be a string'
    );
});

console.log('\nAll tests completed!');