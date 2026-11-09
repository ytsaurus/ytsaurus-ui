import React from 'react';
import cn from 'bem-cn-lite';
import moment from 'moment';
import {Button, Icon, SegmentedRadioGroup, Text, Tooltip} from '@gravity-ui/uikit';

import TrashBinIcon from '@gravity-ui/icons/svgs/trash-bin.svg';

import {type FlowDynamicSpecPatch, type Int64} from '../../../../../../shared/yt-types';
import ypath from '../../../../../common/thor/ypath';
import {
    DataTableGravity,
    type tanstack,
    useTable,
} from '../../../../../components/DataTableGravity';
import {Markdown} from '../../../../../components/Markdown/Markdown';
import {Yson} from '../../../../../components/Yson/Yson';
import {YsonWithScroll} from '../../../../../components/Yson/YsonWithScroll';
import Loader from '../../../../../components/Loader/Loader';
import {
    type FlowDynamicSpecView,
    type FlowSpecState,
} from '../../../../../store/reducers/flow/specs';
import {type UnipikaSettings} from '../../../../../components/Yson/StructuredYson/StructuredYsonTypes';
import {dynamicSpecPatchDiff} from '../../../../../utils/flow/dynamic-spec';
import {CancelDynamicSpecPatchDialog} from './CancelDynamicSpecPatchDialog/CancelDynamicSpecPatchDialog';
import {ResetDynamicSpecPatchesDialog} from './ResetDynamicSpecPatchesDialog/ResetDynamicSpecPatchesDialog';

import i18n from '../i18n';

import './DynamicSpec.scss';

const block = cn('yt-flow-dynamic-spec');

type Props = {
    data: FlowSpecState['data'];
    view: FlowDynamicSpecView;
    onViewChange: (view: FlowDynamicSpecView) => void;
    loading: boolean;
    settings: UnipikaSettings;
    renderEffective: () => React.ReactNode;
    onCancel: (patch: Int64, version: Int64) => Promise<void>;
    onReset: (version: Int64) => Promise<void>;
};

export function DynamicSpec({
    data,
    view,
    onViewChange,
    loading,
    settings,
    renderEffective,
    onCancel,
    onReset,
}: Props) {
    const [cancelConfirmation, setCancelConfirmation] = React.useState<{
        patch: Int64;
        version: Int64;
    }>();
    const [resetConfirmation, setResetConfirmation] = React.useState<Int64>();
    const columns: Array<tanstack.ColumnDef<FlowDynamicSpecPatch>> = [
        {
            id: 'patch-id',
            header: () => i18n('field_patch-id'),
            size: 190,
            cell: ({row: {original: patch}}) => <Yson value={patch.patch_id} inline />,
        },
        {
            id: 'diff',
            header: () => i18n('field_diff'),
            size: 420,
            cell: ({row: {original: patch}}) => (
                <div className={block('diff')}>
                    <Yson
                        value={dynamicSpecPatchDiff(patch)}
                        settings={{...settings, format: 'json', compact: false, break: true}}
                    />
                </div>
            ),
        },
        {
            id: 'comment',
            header: () => i18n('field_comment'),
            size: 300,
            cell: ({row: {original: patch}}) =>
                patch.comment ? <Markdown text={patch.comment} /> : '—',
        },
        {
            id: 'time',
            header: () => i18n('field_time'),
            size: 180,
            cell: ({row: {original: patch}}) => (
                <time dateTime={patch.timestamp} title={patch.timestamp}>
                    {moment(patch.timestamp).local().format('YYYY-MM-DD HH:mm:ss')}
                </time>
            ),
        },
        {
            id: 'actions',
            header: '',
            size: 50,
            cell: ({row: {original: patch}}) => (
                <Tooltip content={i18n('context_cancel-patch')}>
                    <Button
                        size="s"
                        view="flat"
                        aria-label={`${i18n('action_cancel-patch')} ${ypath.getValue(patch.patch_id)}`}
                        onClick={() =>
                            data &&
                            setCancelConfirmation({patch: patch.patch_id, version: data.version})
                        }
                    >
                        <Icon data={TrashBinIcon} size={16} />
                    </Button>
                </Tooltip>
            ),
        },
    ];
    const table = useTable({
        enableSorting: false,
        columns,
        data: data?.patches ?? [],
        getRowId: (patch) => String(ypath.getValue(patch.patch_id)),
    });

    return (
        <div className={block()}>
            <div className={block('toolbar')}>
                <SegmentedRadioGroup<FlowDynamicSpecView>
                    value={view}
                    onUpdate={onViewChange}
                    options={[
                        {value: 'effective', content: i18n('value_effective')},
                        {value: 'base', content: i18n('value_base')},
                        {value: 'patches', content: i18n('value_patches')},
                    ]}
                />
                {data && (
                    <Text color="secondary">
                        {i18n('field_version')}: <Yson value={data.version} inline />
                    </Text>
                )}
            </div>
            {loading && !data && <Loader />}
            {data && view === 'effective' && renderEffective()}
            {data && view === 'base' && (
                <YsonWithScroll
                    value={{version: data.version, spec: data.spec}}
                    settings={settings}
                />
            )}
            {data?.patches && view === 'patches' && (
                <>
                    <Text as="p" color="secondary">
                        {i18n('context_patch-order')}
                    </Text>
                    {data.patches.length ? (
                        <>
                            <Button
                                className={block('reset')}
                                view="outlined-danger"
                                onClick={() => setResetConfirmation(data.version)}
                            >
                                {i18n('action_reset-patches')}
                            </Button>
                            <DataTableGravity
                                table={table}
                                className={block('patches-table')}
                                headerCellClassName={(header) =>
                                    header.column.id === 'diff' ? block('diff-column') : ''
                                }
                                cellAttributes={{className: block('cell')}}
                            />
                        </>
                    ) : (
                        <Text as="p">{i18n('context_no-patches')}</Text>
                    )}
                </>
            )}
            {cancelConfirmation && (
                <CancelDynamicSpecPatchDialog
                    patch={cancelConfirmation.patch}
                    version={cancelConfirmation.version}
                    onCancel={onCancel}
                    onClose={() => setCancelConfirmation(undefined)}
                />
            )}
            {resetConfirmation !== undefined && (
                <ResetDynamicSpecPatchesDialog
                    version={resetConfirmation}
                    onReset={onReset}
                    onClose={() => setResetConfirmation(undefined)}
                />
            )}
        </div>
    );
}
