'use strict';

export default function encodeValue(value) {
    return String(value)
        .replace(/%/g, '%25') // Escape %
        .replace(/#/g, '%23') // Escape #

        .replace(/\+/g, '%2B') // Treated as whitespace

        .replace(/\[/g, '%5B')
        .replace(/\]/g, '%5D')

        .replace(/[=]/g, '%3D') // Param delimeter
        .replace(/&/g, '%26'); // Param delimeter

    // According to this answer http://stackoverflow.com/a/36667242/817632 character that cannot be used in an uri are:
    // The control characters (chars 0-1F and 7F), including new line, tab, and carriage return.
    // "<>\^`{|}
}
