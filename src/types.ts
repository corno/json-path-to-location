export interface Position {
  line: number;
  column: number;
}

export interface LocationInfo {
  start: Position;
  end: Position;
}

export interface JsonToken {
  type: 'string' | 'number' | 'boolean' | 'null' | 'object' | 'array';
  value: any;
  location: LocationInfo;
}

export interface JsonObject {
  [key: string]: JsonValue;
}

export interface JsonArray extends Array<JsonValue> {}

export type JsonValue = string | number | boolean | null | JsonObject | JsonArray;

export interface ParsedJson {
  value: JsonValue;
  tokens: Map<JsonValue, LocationInfo>;
}