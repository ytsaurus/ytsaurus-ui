import React from 'react';
import cn from 'bem-cn-lite';

import {Alert, Button, SegmentedRadioGroup, Text} from '@gravity-ui/uikit';
import {type RenderRowExtraTools} from '@gravity-ui/react-unipika';

import {type FlowDynamicSpecSnapshot, type Int64} from '../../../../../../shared/yt-types';
import {type YTError} from '../../../../../../@types/types';
import {YTErrorBlock} from '../../../../../containers/Block/Block';
import {EditSpecDialog} from '../PipelineSpec';
import {Yson} from '../../../../../components/Yson/Yson';
import {YsonWithScroll} from '../../../../../components/Yson/YsonWithScroll';
import {type UnipikaSettings} from '../../../../../components/Yson/StructuredYson/StructuredYsonTypes';
import {
    type DynamicSpecSource,
    decodeDynamicSpecText,
    decodeDynamicSpecValue,
    dynamicSpecEdits,
    dynamicSpecEffectiveSource,
    dynamicSpecOverrideEditor,
    dynamicSpecOverrideRows,
    dynamicSpecPath,
    dynamicSpecValue,
    dynamicSpecVersion,
    encodeDynamicSpecValue,
} from '../../../../../utils/flow/dynamic-spec';

import i18n from '../i18n';

import './DynamicSpec.scss';

const block = cn('yt-flow-dynamic-spec');
type SpecView = 'effective' | 'base' | 'override';

function hasSelectedText(element: HTMLElement) {
    const selection = window.getSelection();
    return (
        selection !== null &&
        !selection.isCollapsed &&
        (element.contains(selection.anchorNode) || element.contains(selection.focusNode))
    );
}

function EditableValue({
    label,
    disabled,
    onEdit,
    children,
}: {
    label: string;
    disabled: boolean;
    onEdit: () => void;
    children: React.ReactNode;
}) {
    const onKey = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.target !== event.currentTarget || !['Enter', ' '].includes(event.key)) {
            return;
        }
        event.preventDefault();
        event.stopPropagation();
        if (
            !disabled &&
            !event.repeat &&
            ((event.key === 'Enter' && event.type === 'keydown') ||
                (event.key === ' ' && event.type === 'keyup'))
        ) {
            onEdit();
        }
    };
    // Native buttons prevent selecting their value text in WebKit.
    return (
        <div
            role="button"
            className={block('value-button')}
            tabIndex={disabled ? -1 : 0}
            aria-label={label}
            aria-disabled={disabled}
            onClick={(event) => {
                if (
                    disabled ||
                    (event.target instanceof Element &&
                        event.target.closest('a, button, [role="button"]') !==
                            event.currentTarget) ||
                    (event.detail > 0 && hasSelectedText(event.currentTarget))
                ) {
                    return;
                }
                event.stopPropagation();
                onEdit();
            }}
            onKeyDown={onKey}
            onKeyUp={onKey}
        >
            {children}
        </div>
    );
}

function bindEditableValue(
    anchor: HTMLSpanElement,
    label: string,
    disabled: boolean,
    scalar: boolean,
    override: boolean,
    edit: () => void,
) {
    const cell = anchor.closest<HTMLElement>('.g-ru-cell');
    if (!cell) {
        return;
    }
    let targets: Array<HTMLElement> = [];
    let control: HTMLElement | undefined;
    let attributes: Array<[string, string | null]> = [];
    const reset = () => {
        targets.forEach((target) => {
            target.removeAttribute('data-dynamic-spec-value');
            target.removeAttribute('data-dynamic-spec-override');
        });
        attributes.forEach(([name, value]) => {
            if (value === null) {
                control?.removeAttribute(name);
            } else {
                control?.setAttribute(name, value);
            }
        });
    };
    const update = () => {
        reset();
        // Unipika exposes only row tools; preserve its value DOM for search and copying.
        let value = scalar
            ? (cell.querySelector<HTMLElement>('.g-ru-cell__value') ??
              Array.from(cell.querySelectorAll<HTMLElement>(':scope > span.unipika')).at(-1))
            : undefined;
        if (value?.classList.contains('g-ru-cell__value_type_string') && !value.textContent) {
            value = value.parentElement ?? value;
        }
        targets = value
            ? [value]
            : Array.from(cell.children).filter(
                  (child): child is HTMLElement =>
                      child instanceof HTMLElement &&
                      ['{', '}', '[', ']', '...'].includes(child.textContent ?? ''),
              );
        targets.forEach((target) => {
            target.setAttribute('data-dynamic-spec-value', '');
            if (override) {
                target.setAttribute('data-dynamic-spec-override', '');
            }
        });
        control = targets[0];
        if (!control) {
            return;
        }
        const current = control;
        attributes = ['role', 'tabindex', 'aria-label', 'aria-disabled', 'title'].map(
            (name): [string, string | null] => [name, current.getAttribute(name)],
        );
        control.setAttribute('role', 'button');
        control.setAttribute('tabindex', disabled ? '-1' : '0');
        control.setAttribute('aria-label', label);
        control.setAttribute('aria-disabled', String(disabled));
    };
    const onClick = (event: MouseEvent) => {
        const target = event.target;
        if (
            disabled ||
            !(target instanceof Element) ||
            !targets.some((value) => value.contains(target)) ||
            target.closest('a, button, .g-ru-clickable-text')
        ) {
            return;
        }
        if (event.detail > 0 && hasSelectedText(cell)) {
            return;
        }
        event.stopPropagation();
        control?.focus({preventScroll: true});
        edit();
    };
    const onKey = (event: KeyboardEvent) => {
        if (event.target !== control || !['Enter', ' '].includes(event.key)) {
            return;
        }
        event.preventDefault();
        event.stopPropagation();
        if (
            !disabled &&
            !event.repeat &&
            ((event.key === 'Enter' && event.type === 'keydown') ||
                (event.key === ' ' && event.type === 'keyup'))
        ) {
            edit();
        }
    };
    const mutations = new MutationObserver(update);
    mutations.observe(cell, {childList: true, subtree: true});
    cell.addEventListener('click', onClick);
    cell.addEventListener('keydown', onKey);
    cell.addEventListener('keyup', onKey);
    update();
    return () => {
        mutations.disconnect();
        cell.removeEventListener('click', onClick);
        cell.removeEventListener('keydown', onKey);
        cell.removeEventListener('keyup', onKey);
        reset();
    };
}

export type DynamicSpecProps = {
    snapshot?: FlowDynamicSpecSnapshot;
    unavailable?: boolean;
    settings: UnipikaSettings;
    renderEffective: (renderRowExtraTools?: RenderRowExtraTools) => React.ReactNode;
    pipelinePath: string;
    onSet: (path: Array<string>, value: unknown, version: Int64, comment?: string) => Promise<void>;
    onCancelPath: (path: Array<string>, version: Int64) => Promise<void>;
    onCancelOwner: (owner: Int64, version: Int64) => Promise<void>;
    onReset: (version: Int64) => Promise<void>;
};

function renderSource(source: DynamicSpecSource, compact = false) {
    return source.source === 'override' ? (
        <span
            className={block('attribution', {compact, override: compact})}
            data-owner-version={source.version}
            title={`${i18n('field_version')}: ${source.version}${source.audit ? '\n' + source.audit.timestamp + (source.audit.comment ? '\n' + source.audit.comment : '') : ''}`}
        >
            {source.audit && (
                <>
                    {source.audit.comment && (
                        <span className={block('comment')}>{source.audit.comment}</span>
                    )}
                    <time dateTime={source.audit.timestamp}>
                        {source.audit.timestamp.slice(0, 19).replace('T', ' ')} UTC
                    </time>
                </>
            )}
            {!source.audit && i18n('value_override')}
        </span>
    ) : (
        <span className={block('attribution', {source: source.source})}>
            {i18n(`value_source-${source.source}`)}
        </span>
    );
}

export function DynamicSpec({
    snapshot,
    unavailable,
    settings,
    renderEffective,
    pipelinePath,
    onSet,
    onCancelOwner,
    onReset,
}: DynamicSpecProps) {
    const [view, setView] = React.useState<SpecView>('effective');
    const [edit, setEdit] = React.useState<{
        path: Array<string>;
        value: unknown;
        version: Int64;
        hasInheritedFields?: boolean;
    }>();
    const editorValue = React.useMemo(
        () => decodeDynamicSpecValue(edit?.value ?? null),
        [edit?.value],
    );
    const [pending, setPending] = React.useState(false);
    const [error, setError] = React.useState<YTError>();
    const run = async (action: () => Promise<void>) => {
        setError(undefined);
        setPending(true);
        try {
            await action();
        } catch (e) {
            setError(e as YTError);
        } finally {
            setPending(false);
        }
    };
    const openEdit = (path: Array<string>, initialValue?: {value: unknown}) => {
        if (!snapshot) {
            return;
        }
        let atomicPath = path;
        for (let depth = 0; depth < path.length; ++depth) {
            if (Array.isArray(dynamicSpecValue(snapshot.effective_spec, path.slice(0, depth)))) {
                atomicPath = path.slice(0, depth);
                break;
            }
        }
        const rawOverride = dynamicSpecOverrideEditor(snapshot, atomicPath);
        let value = dynamicSpecValue(snapshot.effective_spec, atomicPath);
        if (rawOverride !== undefined) {
            value = rawOverride.value;
        }
        if (initialValue !== undefined) {
            value = initialValue.value;
        }
        setEdit({
            path: atomicPath,
            value,
            version: snapshot.version,
            hasInheritedFields: rawOverride?.hasInheritedFields,
        });
    };
    let editHelp =
        edit?.value !== null &&
        typeof edit?.value === 'object' &&
        !Array.isArray(edit.value) &&
        !('$type' in edit.value)
            ? i18n('context_replace-map')
            : undefined;
    if (edit?.hasInheritedFields) {
        editHelp = `${i18n('context_replace-map')} ${i18n('context_map-inherited-fields')}`;
    }
    const selectedView = snapshot ? view : 'effective';
    const renderRowExtraTools: RenderRowExtraTools = ({path, value}) => {
        if (!snapshot || !path?.length || path[0] !== 'spec') {
            return null;
        }
        const specPath = path.slice(1);
        const source = dynamicSpecEffectiveSource(snapshot, specPath);
        let cleanup: ReturnType<typeof bindEditableValue>;
        const ref = (anchor: HTMLSpanElement | null) => {
            cleanup?.();
            cleanup =
                anchor && selectedView === 'effective'
                    ? bindEditableValue(
                          anchor,
                          `${i18n('action_edit')} ${decodeDynamicSpecText(dynamicSpecPath(specPath)) || '/'}`,
                          pending,
                          value !== undefined,
                          source.source === 'override',
                          () => openEdit(specPath),
                      )
                    : undefined;
        };
        return (
            <span ref={ref}>
                {source.source !== 'base' &&
                    source.source !== 'default' &&
                    renderSource(source, true)}
            </span>
        );
    };
    const overrides = snapshot ? dynamicSpecOverrideRows(snapshot) : [];

    return (
        <div className={block()}>
            {error && <YTErrorBlock error={error} />}
            {unavailable && (
                <Alert theme="info" message={i18n('alert_override-state-unavailable')} />
            )}
            {snapshot && (
                <div className={block('toolbar')}>
                    <SegmentedRadioGroup<SpecView>
                        value={selectedView}
                        onUpdate={setView}
                        options={[
                            {value: 'effective', content: i18n('value_effective')},
                            {value: 'base', content: i18n('value_base')},
                            {value: 'override', content: i18n('value_override')},
                        ]}
                    />
                    <Text color="secondary">
                        {i18n('field_version')}: {dynamicSpecVersion(snapshot.version)}
                    </Text>
                </div>
            )}
            {selectedView === 'effective' && renderEffective(renderRowExtraTools)}
            {selectedView === 'base' && snapshot && (
                <YsonWithScroll
                    value={{version: snapshot.version, spec: snapshot.base_spec}}
                    settings={settings}
                />
            )}
            {selectedView === 'override' && snapshot && (
                <>
                    <Text as="p" color="secondary">
                        {i18n('context_override-intent')}
                    </Text>
                    {snapshot.runtime_target_state !== undefined &&
                        snapshot.runtime_target_state !== null && (
                            <Alert
                                theme="info"
                                message={i18n('context_runtime-target-state', {
                                    state: snapshot.runtime_target_state,
                                })}
                            />
                        )}
                    {overrides.length ? (
                        <>
                            <div className={block('patches')}>
                                <Button
                                    view="outlined-danger"
                                    disabled={pending}
                                    onClick={() => run(() => onReset(snapshot.version))}
                                >
                                    {i18n('action_reset-overrides')}
                                </Button>
                            </div>
                            <div className={block('overrides')}>
                                <table className={block('table')}>
                                    <thead>
                                        <tr>
                                            <th>{i18n('field_path')}</th>
                                            <th>{i18n('field_operation')}</th>
                                            <th>{i18n('field_value')}</th>
                                            <th>{i18n('field_comment')}</th>
                                            <th>{i18n('field_time')}</th>
                                            <th>{i18n('field_patch')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {overrides.map((row) => {
                                            const owner =
                                                row.source.source === 'override'
                                                    ? row.source.version
                                                    : undefined;
                                            const map =
                                                row.operation === 'map' || row.operation === 'mask';
                                            const editRow = () =>
                                                openEdit(row.path, {
                                                    value: map ? row.editorValue : row.value,
                                                });
                                            const audit =
                                                row.source.source === 'override'
                                                    ? row.source.audit
                                                    : undefined;
                                            return (
                                                <tr key={JSON.stringify(row.path)}>
                                                    <td className={block('path')}>
                                                        {decodeDynamicSpecText(
                                                            dynamicSpecPath(row.path),
                                                        ) || '/'}
                                                    </td>
                                                    <td>
                                                        {i18n(`value_operation-${row.operation}`)}
                                                    </td>
                                                    <td>
                                                        <div className={block('value')}>
                                                            <EditableValue
                                                                label={`${i18n('action_edit')} ${decodeDynamicSpecText(dynamicSpecPath(row.path)) || '/'}`}
                                                                disabled={pending}
                                                                onEdit={editRow}
                                                            >
                                                                {row.value === undefined ? (
                                                                    '—'
                                                                ) : (
                                                                    <Yson
                                                                        value={row.value}
                                                                        settings={
                                                                            map
                                                                                ? {
                                                                                      ...settings,
                                                                                      compact: false,
                                                                                      break: true,
                                                                                  }
                                                                                : settings
                                                                        }
                                                                        inline={!map}
                                                                    />
                                                                )}
                                                            </EditableValue>
                                                        </div>
                                                    </td>
                                                    <td className={block('comment')}>
                                                        {audit?.comment || '—'}
                                                    </td>
                                                    <td className={block('time')}>
                                                        {audit ? (
                                                            <time
                                                                dateTime={audit.timestamp}
                                                                title={audit.timestamp}
                                                            >
                                                                {audit.timestamp
                                                                    .slice(0, 19)
                                                                    .replace('T', ' ')}{' '}
                                                                UTC
                                                            </time>
                                                        ) : (
                                                            '—'
                                                        )}
                                                    </td>
                                                    <td>
                                                        {owner === undefined ? (
                                                            '—'
                                                        ) : (
                                                            <Button
                                                                size="s"
                                                                view="flat"
                                                                disabled={pending}
                                                                data-owner-version={owner}
                                                                title={`${i18n('context_cancel-patch')}\n${i18n('field_version')}: ${owner}`}
                                                                onClick={() =>
                                                                    run(() =>
                                                                        onCancelOwner(
                                                                            owner,
                                                                            snapshot.version,
                                                                        ),
                                                                    )
                                                                }
                                                            >
                                                                {i18n('action_cancel-patch')}
                                                            </Button>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    ) : (
                        <Text as="p">{i18n('context_no-overrides')}</Text>
                    )}
                </>
            )}
            {edit && (
                <EditSpecDialog
                    key={JSON.stringify([edit.path, dynamicSpecVersion(edit.version)])}
                    path={pipelinePath}
                    specPath={decodeDynamicSpecText(dynamicSpecPath(edit.path))}
                    name="dynamic specification"
                    visible
                    spec={editorValue}
                    settings={settings}
                    withComment
                    requireComment
                    help={editHelp}
                    onClose={() => setEdit(undefined)}
                    onSpecApply={(value, {comment}) =>
                        dynamicSpecEdits(
                            edit.value ?? null,
                            encodeDynamicSpecValue(value, edit.value ?? null),
                        ).length
                            ? onSet(
                                  edit.path,
                                  encodeDynamicSpecValue(value, edit.value ?? null),
                                  edit.version,
                                  comment,
                              )
                            : Promise.resolve()
                    }
                />
            )}
        </div>
    );
}
