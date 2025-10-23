# JSON Path to Location 🎯

[![npm version](https://badge.fury.io/js/json-path-to-location.svg)](https://badge.fury.io/js/json-path-to-location)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?logo=node.js&logoColor=white)](https://nodejs.org/)

> 🔍 **Find exact line:column locations of JSON values with surgical precision**

A convenient command-line tool that parses JSON files while preserving complete location information, then navigates through the structure to pinpoint the exact position of any value. Perfect for editors, linters, debugging tools, and automated workflows.

## ✨ Key Features

- 🎯 **Precise Location Tracking** - Line and column numbers for every JSON token
- 🚀 **JSON Array Navigation** - Structured path input with `["property", 0, "nested"]` syntax
- 🔧 **Editor Integration Ready** - Perfect for VS Code extensions, linters, and IDEs
- 📦 **Zero Dependencies** - Pure TypeScript implementation with no external deps
- 🛡️ **Type Safe** - Full TypeScript support with comprehensive error handling
- ⚡ **Fast & Lightweight** - Efficient parsing with minimal memory footprint
- 🔄 **Automation Friendly** - Pipe support for scripting and CI/CD workflows
- 🎨 **Developer Experience** - Clear error messages and intuitive API

## 🚀 Quick Start

```bash
# Install globally
npm install -g json-path-to-location

# Use immediately
echo '["user", "profile", "name"]' | json-path-to-location data.json
# Output: 15:12
```

## 💡 Use Cases

- **🔧 Editor Extensions**: Build precise navigation features
- **🐛 Debugging Tools**: Pinpoint exact error locations  
- **📋 Linters**: Report issues with exact line:column positions
- **🤖 Code Generation**: Generate source maps and references
- **📊 Analysis Tools**: Navigate large JSON configurations
- **🔍 Search & Replace**: Find and modify specific JSON values

## 📦 Installation

### Global Installation
```bash
npm install -g json-path-to-location
```

### Local Development
```bash
git clone <repository-url>
cd json-path-to-location
npm install
npm run build
npm link  # Create global symlink
```

### Programmatic Usage
```bash
npm install json-path-to-location
```

```typescript
import { JsonParser, JsonNavigator } from 'json-path-to-location';

const parser = new JsonParser(jsonString);
const parsed = parser.parse();
const navigator = new JsonNavigator(parsed.tokens);
const location = navigator.findLocationForPath(parsed.value, ["user", "name"]);
// location: { start: { line: 5, column: 12 }, end: { line: 5, column: 24 } }
```

## Usage

### Legacy Usage

**Local Usage**
```bash
node dist/index.js <json-file>
```

**Global Usage (after installation)**
```bash
json-path-to-location <json-file>
```

The application will prompt you to enter the path interactively via stdin.

### Arguments

- `<json-file>`: Path to the JSON file to parse

### Interactive Path Input

After running the command, you'll be prompted to enter the path as a JSON array:
- Use string elements for object property navigation
- Use numeric elements for array index navigation
- Elements must be strings or numbers only
- Use empty array `[]` to get the root location
- Can be mixed for complex navigation

**Format:** `["property", 0, "nested"]`
- Strings for object keys: `"property"`, `"name"`, `"address"`
- Numbers for array indices: `0`, `1`, `2`
- Mixed navigation: `["users", 0, "profile", "name"]`

### Examples

Given a JSON file `test-data.json`:
```json
{
  "name": "John Doe",
  "age": 30,
  "address": {
    "street": "123 Main St",
    "city": "Anytown",
    "zipcode": "12345"
  },
  "hobbies": ["reading", "coding", "gaming"],
  "isActive": true,
  "spouse": null,
  "children": [
    {
      "name": "Alice",
      "age": 8
    },
    {
      "name": "Bob",
      "age": 12
    }
  ]
}
```

#### Basic Usage

```bash
# Get location of the root object
json-path-to-location test-data.json
# Prompt: Enter path as JSON array (e.g., ["property", 0, "nested"] or [] for root):
# Input: []
# Output: 1:1

# Get location of the "name" property value
json-path-to-location test-data.json
# Prompt: Enter path as JSON array (e.g., ["property", 0, "nested"] or [] for root):
# Input: ["name"]
# Output: 2:11

# Get location of the "age" property value
json-path-to-location test-data.json
# Prompt: Enter path as JSON array (e.g., ["property", 0, "nested"] or [] for root):
# Input: ["age"]
# Output: 3:10
```

#### Nested Object Navigation

```bash
# Navigate to address.street
json-path-to-location test-data.json
# Input: ["address", "street"]
# Output: 5:15

# Navigate to address.city
json-path-to-location test-data.json
# Input: ["address", "city"]
# Output: 6:13
```

#### Array Navigation

```bash
# Get the second hobby (index 1)
json-path-to-location test-data.json
# Input: ["hobbies", 1]
# Output: 9:26

# Get the first hobby (index 0)
json-path-to-location test-data.json
# Input: ["hobbies", 0]
# Output: 9:15
```

#### Complex Navigation

```bash
# Navigate to the first child's name
json-path-to-location test-data.json
# Input: ["children", 0, "name"]
# Output: 14:15

# Navigate to the second child's age
json-path-to-location test-data.json
# Input: ["children", 1, "age"]
# Output: 19:14
```

#### Special Values

```bash
# Boolean value
json-path-to-location test-data.json
# Input: ["isActive"]
# Output: 10:15

# Null value
json-path-to-location test-data.json
# Input: ["spouse"]
# Output: 11:13
```

#### Using with Pipes

You can also use the application with pipes for automation:

```bash
# Using echo to provide input
echo '["name"]' | json-path-to-location test-data.json
# Output: 2:11

echo '["address", "street"]' | json-path-to-location test-data.json
# Output: 5:15

echo '["children", 0, "name"]' | json-path-to-location test-data.json
# Output: 14:15

# Empty array for root
echo '[]' | json-path-to-location test-data.json
# Output: 1:1
```

## 🎬 Demo

```json
{
  "users": [
    {
      "name": "Alice",
      "profile": {
        "email": "alice@example.com"
      }
    }
  ]
}
```

```bash
# Find Alice's email location
echo '["users", 0, "profile", "email"]' | json-path-to-location users.json
# Output: 6:17

# Find the users array
echo '["users"]' | json-path-to-location users.json  
# Output: 2:12
```

## 🔧 API Reference

## 🔧 API Reference

### CLI Usage

```bash
json-path-to-location <json-file>
```

### Programmatic API

```typescript
import { JsonParser, JsonNavigator, LocationInfo } from 'json-path-to-location';

// Parse JSON with location tracking
const parser = new JsonParser(jsonString);
const { value, tokens } = parser.parse();

// Navigate to specific path
const navigator = new JsonNavigator(tokens);
const location: LocationInfo | undefined = navigator.findLocationForPath(
  value, 
  ["users", 0, "name"]
);

console.log(location);
// { start: { line: 4, column: 14 }, end: { line: 4, column: 21 } }
```

### Path Format

Paths are JSON arrays where:
- **Strings** navigate object properties: `"name"`, `"address"`  
- **Numbers** navigate array indices: `0`, `1`, `2`
- **Mixed** for complex navigation: `["users", 0, "profile", "settings", 2]`

### Legacy Usage
```

## Output Format

The application outputs the location in the format `line:column`, where:
- `line`: 1-based line number
- `column`: 1-based column number

This corresponds to the starting position of the value in the JSON file.

## Error Handling

The application handles various error conditions:

- **File not found**: If the specified JSON file doesn't exist
- **Invalid JSON**: If the file contains malformed JSON
- **Path not found**: If the specified path doesn't exist in the JSON structure
- **Invalid navigation**: If you try to use object keys on arrays or array indices on non-arrays
- **Invalid input format**: If the input is not a valid JSON array
- **Invalid array elements**: If the JSON array contains elements other than strings or numbers

Example errors:
```bash
json-path-to-location test-data.json
# Input: ["nonexistent"]
# Output: Error: Path [nonexistent] not found in JSON.

# Input: "not an array"
# Output: Error: Input must be a JSON array

# Input: [true, "test"]
# Output: Error: Array elements must be strings or numbers
```

## ⚡ Performance

- **Fast**: Parses large JSON files efficiently with O(n) complexity
- **Memory Efficient**: Minimal memory overhead for location tracking
- **Zero Dependencies**: No external dependencies means faster installs
- **TypeScript Native**: Full type safety without runtime overhead

## 🆚 Why This Tool?

| Feature | json-path-to-location | Standard JSON.parse | JSONPath libraries |
|---------|----------------------|--------------------|--------------------|
| 📍 Location tracking | ✅ Line:column precision | ❌ No location info | ❌ No location info |
| 🎯 Exact positioning | ✅ Character-level accuracy | ❌ Not available | ❌ Not available |
| 🔧 Editor integration | ✅ Perfect for IDEs | ❌ Not suitable | ❌ Limited |
| 🚀 Zero dependencies | ✅ Lightweight | ✅ Built-in | ❌ Heavy deps |
| 📦 CLI + Library | ✅ Both included | ❌ Parse only | ❌ Library only |

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Run tests (`npm test`)
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## 📊 Type Support

The application correctly handles all JSON types:
- **Objects**: Navigate using property names
- **Arrays**: Navigate using numeric indices (0-based)
- **Strings**: Terminal values with location tracking
- **Numbers**: Terminal values with location tracking (integers and floats)
- **Booleans**: Terminal values with location tracking (`true` or `false`)
- **Null**: Terminal values with location tracking

## 🛠️ Development

### Build
```bash
npm run build
```

### Test
```bash
npm test
# or
./test.sh
```

The test suite includes 29 comprehensive tests covering:
- ✅ Basic navigation (root, properties, different data types)
- ✅ Nested object navigation
- ✅ Array navigation with numeric indices
- ✅ Complex mixed navigation (arrays containing objects)
- ✅ Error handling (non-existent paths, invalid operations)
- ✅ JSON format validation (invalid syntax, non-arrays, invalid element types)
- ✅ Edge cases and number parsing

## 📄 License

MIT © 2025