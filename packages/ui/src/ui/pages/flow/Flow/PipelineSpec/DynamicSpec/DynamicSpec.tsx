import React from 'react';
import cn from 'bem-cn-lite';
import moment from 'moment';
import isEqual_ from 'lodash/isEqual';

import {Alert, Button, Icon, SegmentedRadioGroup, Text, Tooltip} from '@gravity-ui/uikit';
import PencilIcon from '@gravity-ui/icons/svgs/pencil.svg';
import TrashBinIcon from '@gravity-ui/icons/svgs/trash-bin.svg';

import {
    type FlowDynamicSpecPatch,
    type FlowDynamicSpecSnapshot,
    type Int64,
} from '../../../../../../shared/yt-types';
import {type YTError} from '../../../../../../@types/types';
import {
    DataTableGravity,
    type tanstack,
    useTable,
} from '../../../../../components/DataTableGravity';
import {DialogWrapper} from '../../../../../components/DialogWrapper/DialogWrapper';
import {Markdown} from '../../../../../components/Markdown/Markdown';
import {Yson} from '../../../../../components/Yson/Yson';
import {YsonWithScroll} from '../../../../../components/Yson/YsonWithScroll';
import {type UnipikaSettings} from '../../../../../components/Yson/StructuredYson/StructuredYsonTypes';
import {YTErrorBlock} from '../../../../../containers/Block/Block';
import {
    type DynamicSpecEdit,
    decodeDynamicSpecValue,
    dynamicSpecPatchChangesFromDiff,
    dynamicSpecPatchDiff,
    dynamicSpecVersion,
    encodeDynamicSpecValue,
} from '../../../../../utils/flow/dynamic-spec';
import {EditSpecDialog} from '../EditSpecDialog/EditSpecDialog';

import i18n from '../i18n';

import './DynamicSpec.scss';

const block = cn('yt-flow-dynamic-spec');
type SpecView = 'effective' | 'base' | 'patches';

export type DynamicSpecProps = {
    snapshot?: FlowDynamicSpecSnapshot;
    unavailable?: boolean;
    pipelinePath: string;
    settings: UnipikaSettings;
    renderEffective: () => React.ReactNode;
    onUpdate: (
        patch: Int64,
        changes: Array<DynamicSpecEdit> | undefined,
        comment: string,
        version: Int64,
    ) => Promise<void>;
    onCancel: (patch: Int64, version: Int64) => Promise<void>;
    onReset: (version: Int64) => Promise<void>;
};

export function DynamicSpec({
    snapshot,
    unavailable,
    pipelinePath,
    settings,
    renderEffective,
    onUpdate,
    onCancel,
    onReset,
}: DynamicSpecProps) {
    const [view, setView] = React.useState<SpecView>('effective');
    const [edit, setEdit] = React.useState<{patch: FlowDynamicSpecPatch; version: Int64}>();
    const [pending, setPending] = React.useState(false);
    const [error, setError] = React.useState<YTError>();
    const [resetConfirmation, setResetConfirmation] = React.useState<Int64>();
    const editorValue = React.useMemo(() => edit && dynamicSpecPatchDiff(edit.patch), [edit]);
    const editorSpec = React.useMemo(() => decodeDynamicSpecValue(editorValue), [editorValue]);

    const run = async (action: () => Promise<void>) => {
        setPending(true);
        setError(undefined);
        try {
            await action();
        } catch (err) {
            setError(err as YTError);
        } finally {
            setPending(false);
        }
    };

    const columns: Array<tanstack.ColumnDef<FlowDynamicSpecPatch>> = [
        {
            id: 'patch-id',
            header: () => i18n('field_patch-id'),
            size: 190,
            cell: ({row: {original: patch}}) => dynamicSpecVersion(patch.patch_id),
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
            header: () => i18n('field_actions'),
            size: 100,
            cell: ({row: {original: patch}}) => (
                <div className={block('actions')}>
                    <Tooltip content={i18n('context_update-patch')}>
                        <Button
                            size="s"
                            view="flat"
                            disabled={pending}
                            aria-label={`${i18n('action_update-patch')} ${dynamicSpecVersion(patch.patch_id)}`}
                            onClick={() => snapshot && setEdit({patch, version: snapshot.version})}
                        >
                            <Icon data={PencilIcon} size={16} />
                        </Button>
                    </Tooltip>
                    <Tooltip content={i18n('context_cancel-patch')}>
                        <Button
                            size="s"
                            view="flat"
                            disabled={pending}
                            aria-label={`${i18n('action_cancel-patch')} ${dynamicSpecVersion(patch.patch_id)}`}
                            onClick={() =>
                                snapshot && run(() => onCancel(patch.patch_id, snapshot.version))
                            }
                        >
                            <Icon data={TrashBinIcon} size={16} />
                        </Button>
                    </Tooltip>
                </div>
            ),
        },
    ];
    const table = useTable({
        enableSorting: false,
        columns,
        data: snapshot?.patches ?? [],
        getRowId: (patch) => dynamicSpecVersion(patch.patch_id),
    });

    return (
        <div className={block()}>
            {error && <YTErrorBlock error={error} />}
            {unavailable && (
                <Alert theme="info" message={i18n('alert_override-state-unavailable')} />
            )}
            {snapshot && (
                <div className={block('toolbar')}>
                    <SegmentedRadioGroup<SpecView>
                        value={view}
                        onUpdate={setView}
                        options={[
                            {value: 'effective', content: i18n('value_effective')},
                            {value: 'base', content: i18n('value_base')},
                            {value: 'patches', content: i18n('value_override')},
                        ]}
                    />
                    <Text color="secondary">
                        {i18n('field_version')}: {dynamicSpecVersion(snapshot.version)}
                    </Text>
                </div>
            )}
            {(!snapshot || view === 'effective') && renderEffective()}
            {snapshot && view === 'base' && (
                <YsonWithScroll
                    value={{version: snapshot.version, spec: snapshot.base_spec}}
                    settings={settings}
                />
            )}
            {snapshot && view === 'patches' && (
                <>
                    <Text as="p" color="secondary">
                        {i18n('context_override-intent')}
                    </Text>
                    {snapshot.patches.length ? (
                        <>
                            <Button
                                className={block('reset')}
                                view="outlined-danger"
                                disabled={pending}
                                onClick={() => setResetConfirmation(snapshot.version)}
                            >
                                {i18n('action_reset-overrides')}
                            </Button>
                            <DataTableGravity
                                table={table}
                                cellAttributes={{className: block('cell')}}
                            />
                        </>
                    ) : (
                        <Text as="p">{i18n('context_no-overrides')}</Text>
                    )}
                </>
            )}
            {edit && (
                <EditSpecDialog
                    key={JSON.stringify([
                        dynamicSpecVersion(edit.version),
                        dynamicSpecVersion(edit.patch.patch_id),
                    ])}
                    path={pipelinePath}
                    name="dynamic specification"
                    visible
                    spec={editorSpec}
                    settings={settings}
                    withComment
                    requireComment
                    allowCommentOnly
                    initialComment={edit.patch.comment ?? ''}
                    title={i18n('title_update-patch')}
                    specCaption={i18n('field_diff')}
                    help={i18n('context_patch-change-required')}
                    onClose={() => setEdit(undefined)}
                    onSpecApply={(value, {comment}) => {
                        const encoded = encodeDynamicSpecValue(value, editorValue);
                        const changed = !isEqual_(editorValue, encoded);
                        const changes = changed
                            ? dynamicSpecPatchChangesFromDiff(edit.patch, encoded)
                            : undefined;
                        if (changes && !changes.length) {
                            throw new Error(i18n('error_patch-changes'));
                        }
                        return onUpdate(edit.patch.patch_id, changes, comment ?? '', edit.version);
                    }}
                />
            )}
            {resetConfirmation !== undefined && (
                <DialogWrapper open onClose={() => setResetConfirmation(undefined)}>
                    <DialogWrapper.Header caption={i18n('title_reset-patches')} />
                    <DialogWrapper.Body>{i18n('context_reset-patches-confirm')}</DialogWrapper.Body>
                    <DialogWrapper.Footer
                        textButtonApply={i18n('action_reset-overrides')}
                        textButtonCancel={i18n('action_keep-patches')}
                        propsButtonApply={{view: 'outlined-danger'}}
                        onClickButtonApply={() => {
                            setResetConfirmation(undefined);
                            run(() => onReset(resetConfirmation));
                        }}
                        onClickButtonCancel={() => setResetConfirmation(undefined)}
                    />
                </DialogWrapper>
            )}
        </div>
    );
}
