import React from 'react';
import _ from 'lodash';
import cn from 'bem-cn-lite';

import Button from '../../../../components/Button/Button';
import Icon from '../../../../components/Icon/Icon';
import {FormApi, YTDFDialog} from '../../../../components/Dialog/Dialog';
import {YTError} from '../../../../types';
import Error from '../../../../components/Error/Error';

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
                title: 'Replica settings',
            }}
            initialValues={{
                cluster: _.capitalize(props.replica_cluster),
                path: props.replica_path,
                state: props.state,
                mode: props.mode,
                auto_replica_tracker: props.auto_replica_tracker,
            }}
            fields={[
                {
                    type: 'plain',
                    name: 'cluster',
                    caption: 'Replica cluster',
                },
                {
                    type: 'plain',
                    name: 'path',
                    caption: 'Replica path',
                },
                {
                    type: 'radio',
                    name: 'state',
                    caption: 'State',
                    extras: {
                        size: 's',
                        options: [
                            {value: 'enabled', label: 'Enabled'},
                            {value: 'disabled', label: 'Disabled'},
                        ],
                    },
                },
                {
                    type: 'radio',
                    name: 'mode',
                    caption: 'Mode',
                    extras: {
                        size: 's',
                        options: [
                            {value: 'async', label: 'Async'},
                            {value: 'sync', label: 'Sync'},
                        ],
                    },
                },
                {
                    type: 'radio',
                    name: 'auto_replica_tracker',
                    caption: 'Automatic mode switch',
                    extras: {
                        options: [
                            {value: 'enabled', label: 'Enabled'},
                            {value: 'disabled', label: 'Disabled'},
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
                                          <Error error={error} />
                                      </div>
                                  ),
                              },
                          },
                      ]),
            ]}
        />
    );
}
