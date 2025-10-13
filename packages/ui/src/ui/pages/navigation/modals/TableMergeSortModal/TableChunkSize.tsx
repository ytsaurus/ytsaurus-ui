import React from 'react';
import cn from 'bem-cn-lite';
import {DialogControlProps} from '../../../../components/Dialog/Dialog.types';
import Suggest from '../../../../components/Suggest/Suggest';
import format from '../../../../common/hammer/format';
import {parseBytes} from '../../../../utils/parse/parse-bytes';

import './TableChunkSize.scss';

const block = cn('table-chunk-size');

function asPrettyNumber(value: string): string {
    if (!value) {
        return '';
    }

    const asNumber = parseBytes(value);
    if (isNaN(asNumber)) {
        return 'Cannot parse as bytes';
    }

    return format['Bytes'](asNumber);
}

function getItems() {
    return ['512M', '2G'];
}

type Props = DialogControlProps<string | undefined>;

export function TableChunkSize(props: Props) {
    const {value = '', onChange, placeholder} = props;

    return (
        <div className={block()}>
            <Suggest
                text={value}
                popupClassName={block('popup')}
                apply={(item) => onChange('string' === typeof item ? item : item.value)}
                filter={getItems}
                items={getItems()}
                placeholder={placeholder || 'Chunk size...'}
                popupPlacement={['top']}
            />
            <div className={block('pretty')}>
                <span>{asPrettyNumber(value)}&nbsp;</span>
            </div>
        </div>
    );
}

TableChunkSize.getDefaultValue = () => {
    return undefined;
};

TableChunkSize.isEmpty = (value: Props['value']) => {
    return !value;
};
