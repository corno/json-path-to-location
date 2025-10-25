
import { JsonParser } from '../parser.js';
import { JsonNavigator } from '../navigator.js';

export type Step = string | number

export type Path = Step[]

export type Location = {
    line: number;
    column: number;
}

export type Result = Location | null;

export const json_path_to_location = (path: Step[], json: string): Result => {
    try {
        // Parse the JSON string
        const parser = new JsonParser(json);
        const parsed = parser.parse();

        // Navigate to the specified path
        const navigator = new JsonNavigator(parsed.tokens);

        if (path.length === 0) {
            // If no path segments, return location of root
            const location = navigator.getLocation(parsed.value);
            if (location) {
                return {
                    line: location.start.line,
                    column: location.start.column
                };
            } else {
                return null;
            }
        } else {
            // Navigate to the specified path
            const location = navigator.findLocationForPath(parsed.value, path);

            if (location) {
                return {
                    line: location.start.line,
                    column: location.start.column
                };
            } else {
                return null;
            }
        }

    } catch (error) {
        // Return null on any parsing or navigation error
        return null;
    }
}