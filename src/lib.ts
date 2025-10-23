// Export main classes for programmatic usage
export { JsonParser } from './parser.js';
export { JsonNavigator } from './navigator.js';
export * from './types.js';

// Main CLI function for when used as a library
export { main as cli } from './index.js';