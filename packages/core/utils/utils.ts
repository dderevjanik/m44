/**
 * Replace character at specific index
 * @param str input string
 * @param index position of char to replace
 * @param replacement new character
 */
export function replaceAt(str: string, index: number, replacement: string) {
    return str.substr(0, index) + replacement + str.substr(index + replacement.length);
}
