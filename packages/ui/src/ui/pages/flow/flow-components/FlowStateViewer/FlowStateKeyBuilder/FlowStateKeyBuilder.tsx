import React from 'react';
import cn from 'bem-cn-lite';

import PencilIcon from '@gravity-ui/icons/svgs/pencil.svg';
import {Button, Flex, Icon, TextInput, Tooltip} from '@gravity-ui/uikit';

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
            <Flex gap={2} alignItems="flex-start" className={block()}>
                <TextInput
                    className={block('raw-input')}
                    label={i18n('field_raw-key')}
                    placeholder={i18n('placeholder_raw-key')}
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
                <Tooltip content={i18n('action_edit-key-fields')}>
                    <Button
                        className={block('launcher')}
                        view="flat-secondary"
                        aria-label={i18n('action_edit-key-fields')}
                        onClick={() => setDialogVisible(true)}
                    >
                        <Icon data={PencilIcon} size={16} />
                    </Button>
                </Tooltip>
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
