import React from 'react';

import {useDispatch, useSelector} from 'react-redux';
import {Flex, Text} from '@gravity-ui/uikit';

import SimpleModal from '../../components/Modal/SimpleModal';
import {
    selectCellPreviewData,
    selectCellPreviewLoading,
    selectCellPreviewNoticeText,
    selectCellPreviewVisible,
    selectCellPreviewYtCliDownloadCommand,
    selectErrorPreviewCellPath,
} from '../../store/selectors/modals/cell-preview';

import ClipboardButton from '../../components/ClipboardButton/ClipboardButton';
import block from 'bem-cn-lite';

import Yson from '../../components/Yson/Yson';
import Error from '../../components/Error/Error';
import {type YsonSettings, getPreviewCellYsonSettings} from '../../store/selectors/thor/unipika';
import {closeCellPreviewAndCancelRequest} from '../../store/actions/modals/cell-preview';
import {isMediaTag} from '../../utils/yql-types';

import './CellPreviewModal.scss';

const b = block('cell-preview-modal');

export const CellPreviewModal: React.FC = () => {
    const dispatch = useDispatch();

    const loading = useSelector(selectCellPreviewLoading);
    const data = useSelector(selectCellPreviewData);
    const visible = useSelector(selectCellPreviewVisible);
    const ytCliDownloadCommand = useSelector(selectCellPreviewYtCliDownloadCommand);
    const noticeText = useSelector(selectCellPreviewNoticeText);
    const error = useSelector(selectErrorPreviewCellPath);

    const unipikaSettings = useSelector(getPreviewCellYsonSettings);

    return (
        <SimpleModal
            title="Preview"
            visible={visible}
            loading={loading}
            onCancel={() => dispatch(closeCellPreviewAndCancelRequest())}
            wrapperClassName={b('wrapper')}
        >
            <Flex
                qa="cell-preview-modal-content"
                className={b('content')}
                gap={2}
                direction="column"
            >
                <Flex gap={2} direction="column">
                    <Text variant="subheader-3" color="secondary">
                        {noticeText}
                    </Text>
                    {ytCliDownloadCommand ? (
                        <code className={b('command-wrapper')}>
                            <div className={b('command')}>
                                <div
                                    data-qa="cell-preview-command"
                                    className={b('command-content')}
                                    title={ytCliDownloadCommand}
                                >
                                    {ytCliDownloadCommand}
                                </div>
                                <ClipboardButton
                                    view={'flat-secondary'}
                                    text={ytCliDownloadCommand}
                                    size={'s'}
                                />
                            </div>
                        </code>
                    ) : null}
                </Flex>
                {error ? (
                    <Error error={error} />
                ) : (
                    <PreviewContent data={data} unipikaSettings={unipikaSettings} />
                )}
            </Flex>
        </SimpleModal>
    );
};

type PreviewContentProps = {
    data: {$type: string; $value: any; $tag?: string} | undefined;
    unipikaSettings: YsonSettings;
};

function PreviewContent(props: PreviewContentProps) {
    const {data, unipikaSettings} = props;

    if (data?.$type === 'yql.string' || data?.$type === 'yql.json') {
        return <pre className="elements-code">{data?.$value}</pre>;
    }

    if (data?.$type === 'yql.tagged' && data.$tag && isMediaTag(data.$tag)) {
        return <img src={`data:${data.$tag};base64,${data?.$value}`} alt="image-preview" />;
    }

    return (
        <Yson
            className={b('yson-container')}
            folding={true}
            value={data?.$value}
            tableSettings={{dynamicRenderScrollParentGetter: undefined}}
            settings={unipikaSettings}
            customLayout={({toolbar, content}) => {
                return (
                    <>
                        <div className={b('toolbar')}>{toolbar}</div>
                        {content}
                    </>
                );
            }}
        />
    );
}
