import React from 'react';
import cn from 'bem-cn-lite';

import {Pencil as PencilIcon} from '@gravity-ui/icons';
import {Button, Icon, TextInput, Tooltip} from '@gravity-ui/uikit';

import {formatRawKeyDraft, parseRawKeyDraft, parseRuntimeKeyDraft} from '../state-filters';
import {serializeRawStateValue} from '../state-values';
import {FlowStateKeyDialog} from './FlowStateKeyDialog';
import i18n from './i18n';
import type {FlowKeyColumn} from '../../../../../../shared/yt-types';

import './FlowStateKeyBuilder.scss';

const block = cn('yt-flow-state-key-builder');

export type FlowStateKeyBuilderProps = {
    columns: Array<FlowKeyColumn>;
    values: Record<string, string>;
    onChange: (values: Record<string, string>) => void;
    rawKey?: unknown;
    onRawKeyChange?: (value: unknown) => void;
};

export function FlowStateKeyBuilder({
    columns,
    values,
    onChange,
    rawKey,
    onRawKeyChange,
}: FlowStateKeyBuilderProps) {
    const schemaBacked = columns.length > 0;
    const formattedValues = schemaBacked
        ? formatRawKeyDraft(columns, values)
        : serializeRawStateValue(rawKey);
    const [rawDraft, setRawDraft] = React.useState(formattedValues);
    const [dialogVisible, setDialogVisible] = React.useState(false);
    const parsedDraft = React.useMemo(() => {
        return schemaBacked ? parseRawKeyDraft(rawDraft, columns) : parseRuntimeKeyDraft(rawDraft);
    }, [columns, rawDraft, schemaBacked]);

    React.useEffect(() => {
        setRawDraft(formattedValues);
    }, [formattedValues]);

    const validationError = parsedDraft.error
        ? i18n(parsedDraft.error.errorKey, parsedDraft.error.params)
        : undefined;
    const rawKeyPlaceholder = schemaBacked
        ? `[${columns.map(({name}) => name).join('; ')}]`
        : i18n('field_raw-key');

    return (
        <React.Fragment>
            <div className={block()}>
                <TextInput
                    className={block('raw-input')}
                    label={i18n('field_raw-key')}
                    placeholder={rawKeyPlaceholder}
                    value={rawDraft}
                    hasClear
                    endContent={
                        schemaBacked ? (
                            <Tooltip content={i18n('action_edit-key-fields')}>
                                <Button
                                    className={block('launcher')}
                                    view="flat-secondary"
                                    size="s"
                                    aria-label={i18n('action_edit-key-fields')}
                                    onClick={() => setDialogVisible(true)}
                                >
                                    <Icon data={PencilIcon} size={16} />
                                </Button>
                            </Tooltip>
                        ) : undefined
                    }
                    validationState={validationError ? 'invalid' : undefined}
                    errorMessage={validationError}
                    onUpdate={(next) => {
                        setRawDraft(next);
                        if (schemaBacked) {
                            const parsed = parseRawKeyDraft(next, columns);
                            if (parsed.values) {
                                onChange(parsed.values);
                            }
                        } else {
                            const parsed = parseRuntimeKeyDraft(next);
                            if (!parsed.error) {
                                onRawKeyChange?.(parsed.value);
                            }
                        }
                    }}
                />
            </div>
            {schemaBacked && (
                <FlowStateKeyDialog
                    visible={dialogVisible}
                    columns={columns}
                    values={values}
                    onApply={onChange}
                    onClose={() => setDialogVisible(false)}
                />
            )}
        </React.Fragment>
    );
}
