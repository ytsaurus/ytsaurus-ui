import unipika from '../../../common/thor/unipika';
import {UnipikaSettings} from '../../Yson/StructuredYson/StructuredYsonTypes';

export const attributesToString = (attributes: unknown, settings: UnipikaSettings) => {
    if (attributes === undefined || !settings) return '';

    const convertedValue =
        settings.format === 'raw-json'
            ? unipika.converters.raw(attributes, settings)
            : unipika.converters.yson(attributes, settings);

    return unipika.format(convertedValue, {...settings, asHTML: false});
};
