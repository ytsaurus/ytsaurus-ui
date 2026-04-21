import React, {type FC, useEffect, useMemo, useState} from 'react';
import cn from 'bem-cn-lite';
import MonacoEditor, {
    type MonacoEditorConfig,
} from '../../../../components/MonacoEditor/MonacoEditor';
import './SpytSettings.scss';
import {Button, Flex, Icon} from '@gravity-ui/uikit';
import CheckIcon from '@gravity-ui/icons/svgs/check.svg';
import XmarkIcon from '@gravity-ui/icons/svgs/xmark.svg';
import {type DraftQuery} from '../../../../types/query-tracker/api';
import {toaster} from '../../../../utils/toaster';
import i18n from './i18n';

const block = cn('yt-query-spyt-settings');

const MONACO_CONFIG: MonacoEditorConfig = {
    contextmenu: false,
    minimap: {
        enabled: false,
    },
    overviewRulerLanes: 0,
    glyphMargin: false,
};

type Props = {
    settings?: DraftQuery['settings'];
    onChange: (value: NonNullable<DraftQuery['settings']>) => void;
    onCancel?: () => void;
};

export const SpytSettings: FC<Props> = ({settings, onChange, onCancel}) => {
    const canonicalValue = useMemo(() => JSON.stringify(settings ?? {}, null, 2), [settings]);
    const [value, setValue] = useState(canonicalValue);

    useEffect(() => {
        setValue(canonicalValue);
    }, [canonicalValue]);

    const handleOnCancel = () => {
        setValue(canonicalValue);
        onCancel?.();
    };

    const handleOnSave = () => {
        try {
            const parsed: unknown = JSON.parse(value);
            if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
                throw new Error('Invalid settings shape');
            }
            onChange(parsed as NonNullable<DraftQuery['settings']>);
        } catch {
            toaster.add({
                name: 'spyt_settings_invalid_json',
                theme: 'danger',
                title: i18n('alert_invalid-spyt-json'),
            });
        }
    };

    return (
        <Flex className={block()} direction="column" gap={2}>
            <MonacoEditor
                className={block('editor')}
                language="json"
                value={value}
                monacoConfig={MONACO_CONFIG}
                onChange={setValue}
            />
            <Flex gap={1} justifyContent="flex-end">
                <Button view="action" size="l" onClick={handleOnSave}>
                    <Icon data={CheckIcon} size={16} />
                </Button>
                <Button view="outlined" size="l" onClick={handleOnCancel}>
                    <Icon data={XmarkIcon} size={16} />
                </Button>
            </Flex>
        </Flex>
    );
};
