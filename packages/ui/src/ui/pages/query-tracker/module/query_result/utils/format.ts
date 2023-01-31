import hammer from '../../../../../common/hammer';
// @ts-ignore
import unipika from '@gravity-ui/unipika/lib/unipika';
import {TypeArray} from '../../../../../components/SchemaDataType/dataTypes';

export type Settings = Record<string, any>;

const defaultSettings = {
    escapeWhitespace: false,
    decodeUTF8: true,
    binaryAsHex: true,
    escapeYQLStrings: true,
    omitStructNull: true,
    maxListSize: 50,
    maxStringSize: undefined as number | undefined,
    showYsonAs: 'yson',
    customNumberFormatter: hammer.format.Number, //getNumberFormatter(),
};

export function convert(
    value: unknown,
    dataType: TypeArray,
    settings: Settings,
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

export function formatResuts(
    value: {$type: string; $value: unknown; $tag?: unknown},
    settings: Settings = defaultSettings,
) {
    try {
        return unipika.format(value, settings);
    } catch (error) {
        console.log(error);
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
    settings: Settings = defaultSettings,
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
        $rawValue = formatResuts(fullValue, {
            ...settings,
            customNumberFormatter: defaultSettings.customNumberFormatter,
            asHTML: false,
            maxStringSize: undefined,
        });
        formatValue = $rawValue.length < maxFormattedLength;
    }

    const $formattedValue = formatValue ? formatResuts(convertedValue, settings) : `Escaped value`;
    return {
        ...fullValue,
        $formattedValue,
        $fullFormattedValue:
            convertedValue === fullValue
                ? $formattedValue
                : formatValue
                ? formatResuts(fullValue, {...settings, maxStringSize: undefined})
                : '',
        $rawValue,
    };
}
