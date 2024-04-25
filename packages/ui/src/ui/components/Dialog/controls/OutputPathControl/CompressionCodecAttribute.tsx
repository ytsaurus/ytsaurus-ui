import React, {FC} from 'react';
import {Attribute} from '../../../../store/reducers/navigation/modals/tableMergeSortModalSlice';
import {CompressionCodecs} from '../../../../store/selectors/global/supported-features';
import SelectWithSubItems from '../SelectWithSubItems/SelectWithSubItems';

type Props = {
    attribute: Attribute;
    codecs: CompressionCodecs;
    onChange: (attribute: Attribute) => void;
};
export const CompressionCodecAttribute: FC<Props> = ({attribute, codecs, onChange}) => {
    if (!attribute.active) return null;

    let newValue = attribute.value.split('_');
    if (newValue.length > 1) {
        if (newValue.length === 2) {
            newValue[0] = `${newValue[0]}_`;
        } else {
            newValue = [attribute.value];
        }
    }

    const handleChange = (value: string[]) => {
        onChange({
            ...attribute,
            value: value.join(''),
        });
    };

    return (
        <React.Fragment>
            <div>Compression:</div>
            <SelectWithSubItems
                value={newValue}
                {...codecs}
                labels={['', 'level']}
                onChange={handleChange}
            />
        </React.Fragment>
    );
};
