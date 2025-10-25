#!/bin/bash

# Test script for JSON Path to Location application
# This script tests all the use cases demonstrated during development

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

echo -e "${BLUE}JSON Path to Location - Test Suite${NC}"
echo "======================================"
echo

# Function to run a test
run_test() {
    local test_name="$1"
    local input="$2"
    local expected_output="$3"
    local should_fail="${4:-false}"
    
    TESTS_RUN=$((TESTS_RUN + 1))
    
    echo -n "Test $TESTS_RUN: $test_name... "
    
    # Run the command and capture output and exit code
    if [[ "$should_fail" == "true" ]]; then
        # Test should fail (exit code != 0)
        set +e  # Don't exit on error for this command
        output=$(echo "$input" | $GLOBAL_CMD test-data.json 2>&1)
        exit_code=$?
        set -e  # Re-enable exit on error
        
        if [[ $exit_code -ne 0 ]] && [[ "$output" == *"$expected_output"* ]]; then
            echo -e "${GREEN}PASS${NC}"
            TESTS_PASSED=$((TESTS_PASSED + 1))
        else
            echo -e "${RED}FAIL${NC}"
            echo "  Expected failure with message containing: '$expected_output'"
            echo "  Got: '$output' (exit code: $exit_code)"
            TESTS_FAILED=$((TESTS_FAILED + 1))
        fi
    else
        # Test should succeed (exit code == 0)
        set +e  # Don't exit on error for this command
        output=$(echo "$input" | $GLOBAL_CMD test-data.json 2>&1)
        exit_code=$?
        set -e  # Re-enable exit on error
        
        # Extract just the location from output (last line that matches line:column pattern)
        location=$(echo "$output" | grep -o '[0-9]*:[0-9]*' | tail -1)
        
        if [[ $exit_code -eq 0 ]] && [[ "$location" == "$expected_output" ]]; then
            echo -e "${GREEN}PASS${NC}"
            TESTS_PASSED=$((TESTS_PASSED + 1))
        else
            echo -e "${RED}FAIL${NC}"
            echo "  Expected: '$expected_output'"
            echo "  Got: '$location' (exit code: $exit_code)"
            echo "  Full output: '$output'"
            TESTS_FAILED=$((TESTS_FAILED + 1))
        fi
    fi
}

# Function to test usage message
test_usage() {
    echo -n "Test: Usage message... "
    TESTS_RUN=$((TESTS_RUN + 1))
    
    set +e  # Don't exit on error for this command
    output=$($GLOBAL_CMD 2>&1)
    exit_code=$?
    set -e  # Re-enable exit on error
    
    if [[ $exit_code -ne 0 ]] && [[ "$output" == *"Usage: json-path-to-location <json-file>"* ]]; then
        echo -e "${GREEN}PASS${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "${RED}FAIL${NC}"
        echo "  Expected usage message with exit code != 0"
        echo "  Got: '$output' (exit code: $exit_code)"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
}

# Function to test file not found
test_file_not_found() {
    echo -n "Test: File not found error... "
    TESTS_RUN=$((TESTS_RUN + 1))
    
    set +e  # Don't exit on error for this command
    output=$(echo "[]" | $GLOBAL_CMD nonexistent.json 2>&1)
    exit_code=$?
    set -e  # Re-enable exit on error
    
    if [[ $exit_code -ne 0 ]] && [[ "$output" == *"does not exist"* ]]; then
        echo -e "${GREEN}PASS${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "${RED}FAIL${NC}"
        echo "  Expected file not found error"
        echo "  Got: '$output' (exit code: $exit_code)"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
}

echo -e "${YELLOW}Building application...${NC}"
npm run build > /dev/null 2>&1

# Check if global command is available (from npm link)
if command -v json-path-to-location >/dev/null 2>&1; then
    GLOBAL_CMD="json-path-to-location"
    echo -e "${YELLOW}Using global command: json-path-to-location${NC}"
else
    GLOBAL_CMD="node dist/bin/json_path_to_location.js"
    echo -e "${YELLOW}Using local command: node dist/bin/json_path_to_location.js${NC}"
fi

echo

echo -e "${YELLOW}Running tests...${NC}"
echo

# Test 1: Usage message
test_usage

# Test 2: File not found
test_file_not_found

echo

# Basic navigation tests
echo -e "${YELLOW}Basic Navigation Tests:${NC}"
run_test "Root object location" '[]' "1:1"
run_test "String property 'name'" '["name"]' "2:11"
run_test "Number property 'age'" '["age"]' "3:10"
run_test "Boolean property 'isActive'" '["isActive"]' "10:15"
run_test "Null property 'spouse'" '["spouse"]' "11:13"

echo

# Nested object tests
echo -e "${YELLOW}Nested Object Tests:${NC}"
run_test "Nested string 'address.street'" '["address", "street"]' "5:15"
run_test "Nested string 'address.city'" '["address", "city"]' "6:13"
run_test "Nested string 'address.zipcode'" '["address", "zipcode"]' "7:16"

echo

# Array navigation tests
echo -e "${YELLOW}Array Navigation Tests:${NC}"
run_test "Array element 'hobbies[0]'" '["hobbies", 0]' "9:15"
run_test "Array element 'hobbies[1]'" '["hobbies", 1]' "9:26"
run_test "Array element 'hobbies[2]'" '["hobbies", 2]' "9:36"

echo

# Complex navigation tests
echo -e "${YELLOW}Complex Navigation Tests:${NC}"
run_test "Array then object 'children[0].name'" '["children", 0, "name"]' "14:15"
run_test "Array then object 'children[0].age'" '["children", 0, "age"]' "15:14"
run_test "Array then object 'children[1].name'" '["children", 1, "name"]' "18:15"
run_test "Array then object 'children[1].age'" '["children", 1, "age"]' "19:14"

echo

# Error handling tests
echo -e "${YELLOW}Error Handling Tests:${NC}"
run_test "Non-existent property" '["nonexistent"]' "Path [nonexistent] not found" true
run_test "Invalid array index" '["hobbies", 10]' "Path [hobbies, 10] not found" true
run_test "Object access on array" '["hobbies", "name"]' "Path [hobbies, name] not found" true
run_test "Array access on object" '["address", 0]' "Path [address, 0] not found" true
run_test "Deep non-existent path" '["children", 0, "nonexistent"]' "Path [children, 0, nonexistent] not found" true

echo

# Number parsing tests
echo -e "${YELLOW}Number Parsing Tests:${NC}"
run_test "Zero index" '["children", 0, "age"]' "15:14"
run_test "Positive index" '["hobbies", 2]' "9:36"

echo

# JSON format validation tests
echo -e "${YELLOW}JSON Format Validation Tests:${NC}"
run_test "Invalid JSON syntax" 'invalid json' "Invalid JSON format" true
run_test "Non-array JSON" '"not an array"' "Input must be a JSON array" true
run_test "Array with invalid types" '[true, "test"]' "Array elements must be strings or numbers" true
run_test "Mixed valid types" '["address", "street"]' "5:15"
run_test "Numeric string as key" '["123"]' "Path [123] not found" true

echo

# Summary
echo "======================================"
echo -e "${BLUE}Test Results Summary:${NC}"
echo "Tests run: $TESTS_RUN"
echo -e "Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Failed: ${RED}$TESTS_FAILED${NC}"

if [[ $TESTS_FAILED -eq 0 ]]; then
    echo
    echo -e "${GREEN}All tests passed! 🎉${NC}"
    exit 0
else
    echo
    echo -e "${RED}Some tests failed! ❌${NC}"
    exit 1
fi