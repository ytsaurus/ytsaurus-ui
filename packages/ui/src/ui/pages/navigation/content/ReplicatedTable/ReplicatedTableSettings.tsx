import React from 'react';

import capitalize_ from 'lodash/capitalize';
import cn from 'bem-cn-lite';

import Button from '../../../../components/Button/Button';
import Icon from '../../../../components/Icon/Icon';
import {type FormApi, YTDFDialog} from '../../../../containers/Dialog';
import {type YTError} from '../../../../types';
import {YTErrorBlock} from '../../../../containers/Block/Block';

import i18n from './i18n';
import './ReplicatedTableSettings.scss';
const block = cn('replicated-table-settings');

interface Props {
    replica_cluster: string;
    replica_path: string;
    state: 'enabled' | 'disabled';
    mode: 'sync' | 'async';
    auto_replica_tracker: 'enabled' | 'disabled';

    onApply: (modeState: Pick<Props, 'mode' | 'state' | 'auto_replica_tracker'>) => Promise<void>;
}

export function ReplicatedTableSettingsButton(props: Props) {
    const [visible, setVisible] = React.useState(false);

    const toggleVisibility = React.useCallback(() => {
        setVisible(!visible);
    }, [visible, setVisible]);

    return (
        <React.Fragment>
            <Button onClick={toggleVisibility} view={'flat-secondary'} size={'s'}>
                <Icon awesome={'pencil-alt'} />
            </Button>
            <ReplicatedTableSettingsDialog
                {...props}
                onClose={toggleVisibility}
                visible={visible}
            />
        </React.Fragment>
    );
}

interface SettingsProps {
    visible: boolean;
    onClose: () => void;
}

interface FormValues {
    cluster: string;
    path: string;
    state: 'enabled' | 'disabled';
    mode: 'async' | 'sync';
    auto_replica_tracker: 'enabled' | 'disabled';
}

function ReplicatedTableSettingsDialog(props: Props & SettingsProps) {
    const [error, setError] = React.useState<YTError | null>(null);
    const handleApply = React.useCallback(
        (form: FormApi<FormValues, Partial<FormValues>>) => {
            const {
                values: {mode, state, auto_replica_tracker},
            } = form.getState();
            return props.onApply({mode, state, auto_replica_tracker}).catch((e) => {
                setError(e);
                return Promise.reject(e);
            });
        },
        [props.mode, props.state, props.onApply, setError],
    );
    return (
        <YTDFDialog<FormValues>
            visible={props.visible}
            onAdd={handleApply}
            onClose={props.onClose}
            headerProps={{
                title: i18n('title_replica-settings'),
            }}
            initialValues={{
                cluster: capitalize_(props.replica_cluster),
                path: props.replica_path,
                state: props.state,
                mode: props.mode,
                auto_replica_tracker: props.auto_replica_tracker,
            }}
            fields={[
                {
                    type: 'plain',
                    name: 'cluster',
                    caption: i18n('field_replica-cluster'),
                },
                {
                    type: 'plain',
                    name: 'path',
                    caption: i18n('field_replica-path'),
                },
                {
                    type: 'radio',
                    name: 'state',
                    caption: i18n('field_state'),
                    extras: {
                        size: 's',
                        options: [
                            {value: 'enabled', label: i18n('value_enabled')},
                            {value: 'disabled', label: i18n('value_disabled')},
                        ],
                    },
                },
                {
                    type: 'radio',
                    name: 'mode',
                    caption: i18n('field_mode'),
                    extras: {
                        size: 's',
                        options: [
                            {value: 'async', label: i18n('value_async')},
                            {value: 'sync', label: i18n('value_sync')},
                        ],
                    },
                },
                {
                    type: 'radio',
                    name: 'auto_replica_tracker',
                    caption: i18n('field_automatic-mode-switch'),
                    extras: {
                        options: [
                            {value: 'enabled', label: i18n('value_enabled')},
                            {value: 'disabled', label: i18n('value_disabled')},
                        ],
                    },
                },
                ...(!error
                    ? []
                    : [
                          {
                              type: 'block' as const,
                              name: 'error',
                              extras: {
                                  children: (
                                      <div className={block('error')}>
                                          <YTErrorBlock error={error} />
                                      </div>
                                  ),
                              },
                          },
                      ]),
            ]}
        />
    );
}
