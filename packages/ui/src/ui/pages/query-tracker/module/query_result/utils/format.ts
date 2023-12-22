import unipika from '../../../../../common/thor/unipika';
import {TypeArray} from '../../../../../components/SchemaDataType/dataTypes';
import {UnipikaSettings} from '../../../../../components/Yson/StructuredYson/StructuredYsonTypes';

const defaultSettings: UnipikaSettings = {
    escapeWhitespace: false,
    decodeUTF8: true,
    binaryAsHex: true,
    escapeYQLStrings: true,
    omitStructNull: true,
    maxListSize: 50,
    maxStringSize: undefined,
};

export function convert(
    value: unknown,
    dataType: TypeArray,
    settings: UnipikaSettings,
): {$type: string; $value: any; $tag?: any} {
    try {
        return unipika.converters.yql([value, dataType], settings);
    } catch (error) {
        console.log(error);
        let valueStr: string;
        try {
            valueStr = JSON.stringify(value);
        } catch {
            valueStr = String(value);
        }
        return unipika.format(
            {$value: `Failed to convert value: ${valueStr}`, $type: 'yql.string'},
            settings,
        );
    }
}

export function formatResults(
    value: {$type: string; $value: unknown; $tag?: unknown},
    settings: UnipikaSettings = defaultSettings,
) {
    try {
        return unipika.format(value, settings);
    } catch (error) {
        let valueStr: string;
        try {
            valueStr = JSON.stringify(value);
        } catch {
            valueStr = String(value);
        }
        return unipika.format(
            {$value: `Failed to format value: ${valueStr}`, $type: 'yql.string'},
            settings,
        );
    }
}

const maxFormattedLength = 10000;

export function prepareFormattedValue(
    value: unknown,
    type: TypeArray,
    settings: UnipikaSettings = defaultSettings,
) {
    const convertedValue = convert(value, type, settings);

    let fullValue = convertedValue;
    if (settings?.maxStringSize) {
        fullValue = convert(value, type, {
            ...settings,
            maxStringSize: undefined,
        });
    }

    let $rawValue = '';
    let formatValue = true;
    if (fullValue.$type === 'yql.tagged' && fullValue.$tag === 'url') {
        const node = fullValue.$value;
        if (node.$type === 'tag_value') {
            $rawValue = node.$value.text || node.$value.href;
        } else if (typeof node.$value === 'string') {
            $rawValue = node.$value;
        }
    } else {
        $rawValue = formatResults(fullValue, {
            ...settings,
            asHTML: false,
            maxStringSize: undefined,
        });
        formatValue = $rawValue.length < maxFormattedLength;
    }

    const $formattedValue = formatValue ? formatResults(convertedValue, settings) : `Escaped value`;
    return {
        ...fullValue,
        $formattedValue,
        $fullFormattedValue:
            convertedValue === fullValue
                ? $formattedValue
                : formatValue
                ? formatResults(fullValue, {...settings, maxStringSize: undefined})
                : '',
        $rawValue,
    };
}
