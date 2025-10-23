import { JsonValue, JsonObject, JsonArray, LocationInfo } from './types.js';

export class JsonNavigator {
  private tokens: Map<JsonValue, LocationInfo>;

  constructor(tokens: Map<JsonValue, LocationInfo>) {
    this.tokens = tokens;
  }

  navigate(root: JsonValue, path: (string | number)[]): JsonValue | undefined {
    let current: JsonValue = root;

    for (const segment of path) {
      if (current === null || current === undefined) {
        return undefined;
      }

      if (typeof segment === 'number') {
        // Array index
        if (Array.isArray(current)) {
          if (segment < 0 || segment >= current.length) {
            return undefined;
          }
          current = current[segment];
        } else {
          return undefined;
        }
      } else {
        // Object property
        if (typeof current === 'object' && current !== null && !Array.isArray(current)) {
          const obj = current as JsonObject;
          if (!(segment in obj)) {
            return undefined;
          }
          current = obj[segment];
        } else {
          return undefined;
        }
      }
    }

    return current;
  }

  getLocation(value: JsonValue): LocationInfo | undefined {
    return this.tokens.get(value);
  }

  findLocationForPath(root: JsonValue, path: (string | number)[]): LocationInfo | undefined {
    const value = this.navigate(root, path);
    if (value === undefined) {
      return undefined;
    }
    return this.getLocation(value);
  }
}