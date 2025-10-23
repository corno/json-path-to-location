import { Position, LocationInfo, JsonValue, JsonObject, JsonArray, ParsedJson } from './types.js';

export class JsonParser {
  private text: string;
  private pos: number = 0;
  private line: number = 1;
  private column: number = 1;
  private tokens: Map<JsonValue, LocationInfo> = new Map();

  constructor(text: string) {
    this.text = text;
  }

  parse(): ParsedJson {
    this.pos = 0;
    this.line = 1;
    this.column = 1;
    this.tokens = new Map();
    
    this.skipWhitespace();
    const value = this.parseValue();
    
    return {
      value,
      tokens: this.tokens
    };
  }

  private getCurrentPosition(): Position {
    return { line: this.line, column: this.column };
  }

  private advance(): string {
    const char = this.text[this.pos];
    this.pos++;
    
    if (char === '\n') {
      this.line++;
      this.column = 1;
    } else {
      this.column++;
    }
    
    return char;
  }

  private peek(): string {
    return this.text[this.pos] || '';
  }

  private skipWhitespace(): void {
    while (this.pos < this.text.length && /\s/.test(this.peek())) {
      this.advance();
    }
  }

  private parseValue(): JsonValue {
    this.skipWhitespace();
    
    const char = this.peek();
    
    if (char === '"') {
      return this.parseString();
    } else if (char === '{') {
      return this.parseObject();
    } else if (char === '[') {
      return this.parseArray();
    } else if (char === 't' || char === 'f') {
      return this.parseBoolean();
    } else if (char === 'n') {
      return this.parseNull();
    } else if (char === '-' || /\d/.test(char)) {
      return this.parseNumber();
    } else {
      throw new Error(`Unexpected character '${char}' at line ${this.line}, column ${this.column}`);
    }
  }

  private parseString(): string {
    const start = this.getCurrentPosition();
    
    this.advance(); // consume opening quote
    let value = '';
    
    while (this.peek() !== '"' && this.pos < this.text.length) {
      if (this.peek() === '\\') {
        this.advance(); // consume backslash
        const escaped = this.advance();
        switch (escaped) {
          case '"':
          case '\\':
          case '/':
            value += escaped;
            break;
          case 'b':
            value += '\b';
            break;
          case 'f':
            value += '\f';
            break;
          case 'n':
            value += '\n';
            break;
          case 'r':
            value += '\r';
            break;
          case 't':
            value += '\t';
            break;
          case 'u':
            // Parse unicode escape sequence
            let unicode = '';
            for (let i = 0; i < 4; i++) {
              unicode += this.advance();
            }
            value += String.fromCharCode(parseInt(unicode, 16));
            break;
          default:
            value += escaped;
        }
      } else {
        value += this.advance();
      }
    }
    
    if (this.peek() !== '"') {
      throw new Error(`Unterminated string at line ${this.line}, column ${this.column}`);
    }
    
    this.advance(); // consume closing quote
    const end = this.getCurrentPosition();
    
    this.tokens.set(value, { start, end });
    return value;
  }

  private parseNumber(): number {
    const start = this.getCurrentPosition();
    let numStr = '';
    
    if (this.peek() === '-') {
      numStr += this.advance();
    }
    
    if (this.peek() === '0') {
      numStr += this.advance();
    } else if (/[1-9]/.test(this.peek())) {
      while (/\d/.test(this.peek())) {
        numStr += this.advance();
      }
    } else {
      throw new Error(`Invalid number at line ${this.line}, column ${this.column}`);
    }
    
    if (this.peek() === '.') {
      numStr += this.advance();
      if (!/\d/.test(this.peek())) {
        throw new Error(`Invalid number at line ${this.line}, column ${this.column}`);
      }
      while (/\d/.test(this.peek())) {
        numStr += this.advance();
      }
    }
    
    if (this.peek() === 'e' || this.peek() === 'E') {
      numStr += this.advance();
      if (this.peek() === '+' || this.peek() === '-') {
        numStr += this.advance();
      }
      if (!/\d/.test(this.peek())) {
        throw new Error(`Invalid number at line ${this.line}, column ${this.column}`);
      }
      while (/\d/.test(this.peek())) {
        numStr += this.advance();
      }
    }
    
    const end = this.getCurrentPosition();
    const value = parseFloat(numStr);
    
    this.tokens.set(value, { start, end });
    return value;
  }

  private parseBoolean(): boolean {
    const start = this.getCurrentPosition();
    
    if (this.text.substr(this.pos, 4) === 'true') {
      for (let i = 0; i < 4; i++) {
        this.advance();
      }
      const end = this.getCurrentPosition();
      this.tokens.set(true, { start, end });
      return true;
    } else if (this.text.substr(this.pos, 5) === 'false') {
      for (let i = 0; i < 5; i++) {
        this.advance();
      }
      const end = this.getCurrentPosition();
      this.tokens.set(false, { start, end });
      return false;
    } else {
      throw new Error(`Invalid boolean at line ${this.line}, column ${this.column}`);
    }
  }

  private parseNull(): null {
    const start = this.getCurrentPosition();
    
    if (this.text.substr(this.pos, 4) === 'null') {
      for (let i = 0; i < 4; i++) {
        this.advance();
      }
      const end = this.getCurrentPosition();
      this.tokens.set(null, { start, end });
      return null;
    } else {
      throw new Error(`Invalid null at line ${this.line}, column ${this.column}`);
    }
  }

  private parseObject(): JsonObject {
    const start = this.getCurrentPosition();
    const obj: JsonObject = {};
    
    this.advance(); // consume '{'
    this.skipWhitespace();
    
    if (this.peek() === '}') {
      this.advance(); // consume '}'
      const end = this.getCurrentPosition();
      this.tokens.set(obj, { start, end });
      return obj;
    }
    
    while (true) {
      this.skipWhitespace();
      
      if (this.peek() !== '"') {
        throw new Error(`Expected string key at line ${this.line}, column ${this.column}`);
      }
      
      const key = this.parseString();
      
      this.skipWhitespace();
      
      if (this.peek() !== ':') {
        throw new Error(`Expected ':' after key at line ${this.line}, column ${this.column}`);
      }
      
      this.advance(); // consume ':'
      this.skipWhitespace();
      
      const value = this.parseValue();
      obj[key] = value;
      
      this.skipWhitespace();
      
      if (this.peek() === '}') {
        this.advance(); // consume '}'
        break;
      } else if (this.peek() === ',') {
        this.advance(); // consume ','
      } else {
        throw new Error(`Expected ',' or '}' at line ${this.line}, column ${this.column}`);
      }
    }
    
    const end = this.getCurrentPosition();
    this.tokens.set(obj, { start, end });
    return obj;
  }

  private parseArray(): JsonArray {
    const start = this.getCurrentPosition();
    const arr: JsonArray = [];
    
    this.advance(); // consume '['
    this.skipWhitespace();
    
    if (this.peek() === ']') {
      this.advance(); // consume ']'
      const end = this.getCurrentPosition();
      this.tokens.set(arr, { start, end });
      return arr;
    }
    
    while (true) {
      this.skipWhitespace();
      
      const value = this.parseValue();
      arr.push(value);
      
      this.skipWhitespace();
      
      if (this.peek() === ']') {
        this.advance(); // consume ']'
        break;
      } else if (this.peek() === ',') {
        this.advance(); // consume ','
      } else {
        throw new Error(`Expected ',' or ']' at line ${this.line}, column ${this.column}`);
      }
    }
    
    const end = this.getCurrentPosition();
    this.tokens.set(arr, { start, end });
    return arr;
  }
}