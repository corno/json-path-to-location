#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import * as readline from 'readline';
import { JsonParser } from './parser.js';
import { JsonNavigator } from './navigator.js';

function parsePathFromInput(input: string): (string | number)[] {
  if (!input.trim()) {
    return [];
  }
  
  try {
    // Parse as JSON array
    const parsed = JSON.parse(input.trim());
    
    // Validate that it's an array
    if (!Array.isArray(parsed)) {
      throw new Error('Input must be a JSON array');
    }
    
    // Validate that all elements are strings or numbers
    for (const item of parsed) {
      if (typeof item !== 'string' && typeof item !== 'number') {
        throw new Error('Array elements must be strings or numbers');
      }
    }
    
    return parsed;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('Invalid JSON format. Please provide a valid JSON array like ["property", 0, "nested"]');
    }
    throw error;
  }
}

async function readPathFromStdin(): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question('Enter path as JSON array (e.g., ["property", 0, "nested"] or [] for root): ', (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

export async function main() {
  const args = process.argv.slice(2);
  
  if (args.length !== 1) {
    console.error('Usage: json-path-to-location <json-file>');
    console.error('');
    console.error('The application will prompt for the path as a JSON array.');
    console.error('');
    console.error('Examples:');
    console.error('  json-path-to-location data.json');
    console.error('  Then enter: ["user", "name"]');
    console.error('  Or enter: ["items", 0, "id"]');
    console.error('  Or enter: ["users", 2, "address", "street"]');
    console.error('  Or enter: [] for root location');
    process.exit(1);
  }

  const filePath = args[0];

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    console.error(`Error: File '${filePath}' does not exist.`);
    process.exit(1);
  }

  try {
    // Read and parse the JSON file
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const parser = new JsonParser(fileContent);
    const parsed = parser.parse();
    
    // Get path from stdin
    const pathInput = await readPathFromStdin();
    const pathSegments = parsePathFromInput(pathInput);
    
    // Navigate to the specified path
    const navigator = new JsonNavigator(parsed.tokens);
    
    if (pathSegments.length === 0) {
      // If no path segments, return location of root
      const location = navigator.getLocation(parsed.value);
      if (location) {
        console.log(`${location.start.line}:${location.start.column}`);
      } else {
        console.error('Error: Could not find location information for root value.');
        process.exit(1);
      }
    } else {
      // Navigate to the specified path
      const location = navigator.findLocationForPath(parsed.value, pathSegments);
      
      if (location) {
        console.log(`${location.start.line}:${location.start.column}`);
      } else {
        console.error(`Error: Path [${pathSegments.join(', ')}] not found in JSON.`);
        process.exit(1);
      }
    }
    
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error: ${error.message}`);
    } else {
      console.error('Error: Unknown error occurred.');
    }
    process.exit(1);
  }
}

if (typeof require !== 'undefined' && require.main === module) {
  main().catch(console.error);
}