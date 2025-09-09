import unipika from '../../../../../../common/thor/unipika';
import {DetailedOperationSelector} from '../../../../selectors';

// TODO support getting correct type in UNIPIKA (e.g. account for tagged type)
export const canRenderAsMap = (value: DetailedOperationSelector['description']) => {
    const {
        utils: {
            yson: {attributes, type},
        },
    } = unipika;
    const isWithoutTags = !Object.hasOwnProperty.call(attributes(value), '_type_tag');
    const isMap = type(value) === 'object';

    return isMap && isWithoutTags;
};
