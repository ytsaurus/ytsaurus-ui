import React, {FC, useCallback, useEffect} from 'react';
import {ControlStaticApi} from '@gravity-ui/dialog-fields/build/cjs/dialog/types';
import {PoolTreeSuggestControl} from '../PoolTreeSuggestControl/PoolTreeSuggestControl';
import {TextInput} from '@gravity-ui/uikit';
import './OutputPathControl.scss';
import cn from 'bem-cn-lite';
import {AddOptionForm} from './AddOptionForm';
import {useDispatch, useSelector} from 'react-redux';
import {getNavigationTableOutputPathAttributes} from '../../../../store/selectors/navigation/modals/table-merge-sort-modal';
import {loadStorageAttributes} from '../../../../store/actions/navigation/modals/table-merge-sort-modal';
import {
    Attribute,
    PathAttribute,
    changeAttribute,
    resetAttributes,
    setAttributeActive,
} from '../../../../store/reducers/navigation/modals/tableMergeSortModalSlice';
import {OptimizeForAttribute} from './OptimizeForAttribute';
import {CompressionCodecAttribute} from './CompressionCodecAttribute';
import {
    getCompressionCodecs,
    getErasureCodecs,
} from '../../../../store/selectors/global/supported-features';
import {ErasureCodecAttribute} from './ErasureCodecAttribute';

const block = cn('output-path-control');

type Props = {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
};

export const OutputPathControl: FC<Props> & ControlStaticApi<any> = ({
    value,
    onChange,
    placeholder,
    disabled,
}) => {
    const dispatch = useDispatch();
    const outputPathAttributes = useSelector(getNavigationTableOutputPathAttributes);
    const compressionCodecs = useSelector(getCompressionCodecs);
    const erasureCodecs = useSelector(getErasureCodecs);

    useEffect(() => {
        if (value) {
            dispatch(loadStorageAttributes(value));
        }
        return () => {
            dispatch(resetAttributes());
        };
    }, [dispatch, value]);

    const handleAttributeActiveChange = useCallback(
        (key: PathAttribute, isActive: boolean) => {
            dispatch(
                setAttributeActive({
                    key,
                    isActive,
                }),
            );
        },
        [dispatch],
    );

    const handleAttributeChange = useCallback(
        (attribute: Attribute) => {
            dispatch(changeAttribute(attribute));
        },
        [dispatch],
    );

    return (
        <div className={block()}>
            <div className={block('form')}>
                <AddOptionForm
                    attributes={outputPathAttributes}
                    onChange={handleAttributeActiveChange}
                />
                <TextInput
                    hasClear
                    value={value || ''}
                    onUpdate={onChange}
                    placeholder={placeholder}
                    disabled={disabled}
                />
            </div>
            <div className={block('attributes')}>
                <OptimizeForAttribute
                    attribute={outputPathAttributes[PathAttribute.OPTIMIZE_FOR]}
                    onChange={handleAttributeChange}
                />
                <CompressionCodecAttribute
                    attribute={outputPathAttributes[PathAttribute.COMPRESSION_CODEC]}
                    codecs={compressionCodecs}
                    onChange={handleAttributeChange}
                />
                <ErasureCodecAttribute
                    attribute={outputPathAttributes[PathAttribute.ERASURE_CODEC]}
                    codecs={erasureCodecs}
                    onChange={handleAttributeChange}
                />
            </div>
        </div>
    );
};

OutputPathControl.getDefaultValue = () => '';

PoolTreeSuggestControl.isEmpty = (value: Props['value']) => {
    return !value;
};
