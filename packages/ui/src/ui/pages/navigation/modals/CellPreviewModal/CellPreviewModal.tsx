import React from 'react';

import {useDispatch, useSelector} from 'react-redux';
import {Flex, Text} from '@gravity-ui/uikit';

import SimpleModal from '../../../../components/Modal/SimpleModal';
import {closeCellPreviewAndCancelRequest} from '../../../../store/actions/navigation/modals/cell-preview';
import {
    selectCellPreviewCellPath,
    selectCellPreviewData,
    selectCellPreviewLoading,
    selectCellPreviewVisible,
    selectErrorPreviewCellPath,
} from '../../../../store/selectors/navigation/modals/cell-preview';

import ClipboardButton from '../../../../components/ClipboardButton/ClipboardButton';
import block from 'bem-cn-lite';

import './CellPreviewModal.scss';
import Yson from '../../../../components/Yson/Yson';
import Error from '../../../../components/Error/Error';
import {getPreviewCellYsonSettings} from '../../../../store/selectors/thor/unipika';

const b = block('cell-preview-modal');

export const CellPreviewModal: React.FC = () => {
    const dispatch = useDispatch();

    const loading = useSelector(selectCellPreviewLoading);
    const data = useSelector(selectCellPreviewData);
    const visible = useSelector(selectCellPreviewVisible);
    const cellPath = useSelector(selectCellPreviewCellPath);
    const error = useSelector(selectErrorPreviewCellPath);

    const unipikaSettings = useSelector(getPreviewCellYsonSettings);

    const command = `yt read-table '${cellPath}' --format json`;

    return (
        <SimpleModal
            title="Preview"
            visible={visible}
            loading={loading}
            onCancel={() => dispatch(closeCellPreviewAndCancelRequest())}
            wrapperClassName={b('wrapper')}
        >
            <Flex className={b('content')} gap={2} direction="column">
                <Flex gap={2} direction="column">
                    <Text variant="subheader-3" color="secondary">
                        {data?.$incomplete && !error
                            ? 'Unable to load content more than 16MiB. Please use the command bellow to\n' +
                              '                            load it locally.'
                            : 'You could use the command bellow to load it locally.'}
                    </Text>
                    <code className={b('command-wrapper')}>
                        <div className={b('command')}>
                            <div className={b('command-content')} title={command}>
                                {command}
                            </div>
                            <ClipboardButton view={'flat-secondary'} text={command} size={'s'} />
                        </div>
                    </code>
                </Flex>
                {error ? (
                    <Error error={error} />
                ) : (
                    <Yson
                        folding={true}
                        value={data}
                        tableSettings={{dynamicRenderScrollParentGetter: undefined}}
                        settings={unipikaSettings}
                    />
                )}
            </Flex>
        </SimpleModal>
    );
};
