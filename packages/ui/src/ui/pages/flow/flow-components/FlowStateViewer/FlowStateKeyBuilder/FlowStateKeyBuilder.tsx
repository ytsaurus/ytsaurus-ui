import React from 'react';
import cn from 'bem-cn-lite';

import {Button, Flex, TextInput} from '@gravity-ui/uikit';

import {formatRawKeyDraft, parseRawKeyDraft} from '../state-filters';
import {FlowStateKeyDialog} from './FlowStateKeyDialog';
import i18n from './i18n';
import type {FlowKeyColumn} from '../../../../../../shared/yt-types';

import './FlowStateKeyBuilder.scss';

const block = cn('yt-flow-state-key-builder');

export type FlowStateKeyBuilderProps = {
    columns: Array<FlowKeyColumn>;
    values: Record<string, string>;
    onChange: (values: Record<string, string>) => void;
};

export function FlowStateKeyBuilder({columns, values, onChange}: FlowStateKeyBuilderProps) {
    const formattedValues = formatRawKeyDraft(columns, values);
    const [rawDraft, setRawDraft] = React.useState(formattedValues);
    const [dialogVisible, setDialogVisible] = React.useState(false);
    const parsedDraft = React.useMemo(
        () => parseRawKeyDraft(rawDraft, columns),
        [columns, rawDraft],
    );

    React.useEffect(() => {
        setRawDraft(formattedValues);
    }, [formattedValues]);

    const validationError = parsedDraft.error
        ? i18n(parsedDraft.error.errorKey, parsedDraft.error.params)
        : undefined;

    return (
        <React.Fragment>
            <Flex gap={2} wrap alignItems="flex-start" className={block()}>
                <TextInput
                    className={block('raw-input')}
                    label={i18n('field_raw-key')}
                    placeholder="[foo; bar; baz]"
                    value={rawDraft}
                    hasClear
                    validationState={validationError ? 'invalid' : undefined}
                    errorMessage={validationError}
                    onUpdate={(next) => {
                        setRawDraft(next);
                        const parsed = parseRawKeyDraft(next, columns);
                        if (parsed.values) {
                            onChange(parsed.values);
                        }
                    }}
                />
                <Button view="outlined" onClick={() => setDialogVisible(true)}>
                    {i18n('action_edit-key-fields')}
                </Button>
            </Flex>
            <FlowStateKeyDialog
                visible={dialogVisible}
                columns={columns}
                values={values}
                onApply={onChange}
                onClose={() => setDialogVisible(false)}
            />
        </React.Fragment>
    );
}
