import React, {useMemo, useState} from 'react';

import {useDispatch, useSelector} from '../../store/redux-hooks';
import {Flex, Text} from '@gravity-ui/uikit';

import SimpleModal from '../../components/Modal/SimpleModal';
import i18n from './i18n';
import {
    selectCellPreviewData,
    selectCellPreviewLoading,
    selectCellPreviewNoticeText,
    selectCellPreviewShouldDecodeUTF8,
    selectCellPreviewVisible,
    selectCellPreviewYtCliDownloadCommand,
    selectErrorPreviewCellPath,
} from '../../store/selectors/modals/cell-preview';

import {ClipboardButton, getCellCopyValues} from '@ytsaurus/components';
import cn from 'bem-cn-lite';

import {Yson} from '../../components/Yson/Yson';
import {YTErrorBlock} from '../../containers/Block/Block';
import {type YsonSettings, selectPreviewCellYsonSettings} from '../../store/selectors/thor/unipika';
import {closeCellPreviewAndCancelRequest} from '../../store/actions/modals/cell-preview';
import {isMediaTag} from '../../utils/yql-types';
import {prettyPrintSafe} from '../../utils/unipika';
import type {UnipikaSettings} from '../../components/Yson/StructuredYson/StructuredYsonTypes';
import {selectSettingTableDisplayRawStrings} from '../../store/selectors/settings';

import './CellPreviewModal.scss';

const block = cn('cell-preview-modal');

export const CellPreviewModal: React.FC = () => {
    const dispatch = useDispatch();

    const loading = useSelector(selectCellPreviewLoading);
    const data = useSelector(selectCellPreviewData);
    const shouldDecodeUTF8 = useSelector(selectCellPreviewShouldDecodeUTF8);
    const visible = useSelector(selectCellPreviewVisible);
    const ytCliDownloadCommand = useSelector(selectCellPreviewYtCliDownloadCommand);
    const noticeText = useSelector(selectCellPreviewNoticeText);
    const error = useSelector(selectErrorPreviewCellPath);

    const unipikaSettings = useSelector(selectPreviewCellYsonSettings);
    const previewSettings = useMemo(
        () =>
            shouldDecodeUTF8 === undefined
                ? unipikaSettings
                : {...unipikaSettings, decodeUTF8: shouldDecodeUTF8},
        [unipikaSettings, shouldDecodeUTF8],
    );

    const allowRawStrings = useSelector(selectSettingTableDisplayRawStrings);
    const copyValues = useMemo(
        () => getCopyValues(data, {...previewSettings, asHTML: false, nonBreakingIndent: false}),
        [data, previewSettings],
    );
    const useRawString = copyValues?.rawString !== undefined && allowRawStrings;
    const preparedCopyText = useRawString ? copyValues?.rawString : copyValues?.string;
    const copyText = !loading && !error ? preparedCopyText : undefined;
    let shiftCopyText;
    if (copyValues?.rawString !== undefined) {
        shiftCopyText = useRawString ? copyValues.string : copyValues.rawString;
    }

    const hasShiftValue = shiftCopyText !== undefined;

    return (
        <SimpleModal
            title={i18n('title_preview')}
            visible={visible}
            loading={loading}
            onCancel={() => dispatch(closeCellPreviewAndCancelRequest())}
            wrapperClassName={block('wrapper')}
        >
            <Flex
                qa="cell-preview-modal-content"
                className={block('content')}
                gap={2}
                direction="column"
            >
                <Flex gap={2} direction="column">
                    <Flex gap={2} alignItems="center" justifyContent="space-between">
                        <Text variant="subheader-3" color="secondary">
                            {noticeText}
                        </Text>
                        {copyText !== undefined && (
                            <ClipboardButton
                                view="flat-secondary"
                                text={copyText}
                                shiftText={shiftCopyText}
                                size="s"
                                title={hasShiftValue ? undefined : i18n('action_copy-content')}
                                hoverContent={
                                    hasShiftValue
                                        ? i18n(
                                              useRawString
                                                  ? 'hold-shift-escaped'
                                                  : 'hold-shift-raw',
                                          )
                                        : undefined
                                }
                            />
                        )}
                    </Flex>
                    {ytCliDownloadCommand ? (
                        <code className={block('command-wrapper')}>
                            <div className={block('command')}>
                                <div
                                    data-qa="cell-preview-command"
                                    className={block('command-content')}
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
                    <YTErrorBlock error={error} />
                ) : (
                    <PreviewContent data={data} unipikaSettings={previewSettings} />
                )}
            </Flex>
        </SimpleModal>
    );
};

type PreviewContentProps = {
    data: {$type?: string; $value?: any; $tag?: string} | undefined;
    unipikaSettings: YsonSettings;
};

function getUnipikaNodeForYsonPreview(data: PreviewContentProps['data']) {
    if (!data) {
        return undefined;
    }

    /**
     * Root nodes where the tree to render lives under `$value`:
     * explicit `yql.yson`, or a root without `$type` from the formatting pipeline.
     */
    if (data.$type === 'yql.yson' || data.$type === undefined) {
        return data.$value;
    }

    return data;
}

function getCopyValues(data: PreviewContentProps['data'], settings: UnipikaSettings) {
    if (!data) {
        return undefined;
    }

    if (data.$type === 'yql.tagged' && data.$tag && isMediaTag(data.$tag)) {
        return undefined;
    }

    return getCellCopyValues({
        escapedValue: prettyPrintSafe(getUnipikaNodeForYsonPreview(data), settings),
        rawValue: data.$value,
        valueType:
            data.$type === 'yql.string' || data.$type === 'yql.json' || data.$type === 'yql.utf8'
                ? 'string'
                : data.$type,
    });
}

function PreviewContent(props: PreviewContentProps) {
    const {data, unipikaSettings} = props;

    const [scrollContainer, setScrollContainer] = useState<HTMLDivElement | null>(null);

    if (data?.$type === 'yql.string' || data?.$type === 'yql.json') {
        return <pre className="elements-code">{data?.$value}</pre>;
    }

    if (data?.$type === 'yql.tagged' && data.$tag && isMediaTag(data.$tag)) {
        return <img src={`data:${data.$tag};base64,${data?.$value}`} alt="image-preview" />;
    }

    return (
        <div ref={setScrollContainer} className={block('yson-container')}>
            {scrollContainer && (
                <Yson
                    virtualized
                    value={getUnipikaNodeForYsonPreview(data)}
                    scrollContainer={scrollContainer}
                    settings={unipikaSettings}
                    customLayout={({toolbar, content}) => {
                        return (
                            <>
                                <div className={block('toolbar')}>{toolbar}</div>
                                {content}
                            </>
                        );
                    }}
                />
            )}
        </div>
    );
}
