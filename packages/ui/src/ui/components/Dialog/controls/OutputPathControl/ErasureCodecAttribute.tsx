import React, {FC} from 'react';
import {Attribute} from '../../../../store/reducers/navigation/modals/tableMergeSortModalSlice';
import {SelectSingle} from '../../../Select/Select';

import i18n from './i18n';

type Props = {
    attribute: Attribute;
    codecs: {value: string; text: string}[];
    onChange: (attribute: Attribute) => void;
};
export const ErasureCodecAttribute: FC<Props> = ({attribute, codecs, onChange}) => {
    if (!attribute.active) return null;

    const handleChange = (value?: string) => {
        onChange({
            ...attribute,
            value: value || '',
        });
    };

    return (
        <>
            <div>{i18n('field_erasure-codec')}</div>
            <SelectSingle value={attribute.value} onChange={handleChange} items={codecs} />
        </>
    );
};
