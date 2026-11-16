import React, {useEffect, useRef} from 'react';

import {type FormApi, YTDFDialog, makeFormSubmitError} from '../../containers/Dialog';
import {type RunningJobsStrategy} from '../../utils/operations/detail';
import {type TimeDurationProps} from '../TimeDuration/TimeDuration';

import i18n from './i18n';

interface Props {
    message: React.ReactNode;
    requireConfirmation?: boolean;
    showTimeout?: boolean;
    showRunningJobsStrategy?: boolean;
    errorMessage?: React.ReactNode;
    onConfirm: (values: FormValues) => Promise<unknown>;
    onClose: () => void;
}

export interface FormValues {
    timeout?: TimeDurationProps['value'];
    runningJobsStrategy?: RunningJobsStrategy;
    confirmed?: boolean;
}

const INITIAL_TIMEOUT = {value: 10000};

export function ActionDialog({
    message,
    requireConfirmation,
    showTimeout,
    showRunningJobsStrategy,
    errorMessage,
    onConfirm,
    onClose,
}: Props) {
    const mounted = useRef(true);

    useEffect(() => {
        mounted.current = true;
        return () => {
            mounted.current = false;
        };
    }, []);

    const handleConfirm = async (form: FormApi<FormValues>) => {
        const values = form.getState().values;
        try {
            await onConfirm(values);
        } catch (error) {
            return makeFormSubmitError(error, errorMessage);
        }

        return undefined;
    };

    return (
        <YTDFDialog<FormValues>
            visible
            pristineSubmittable
            headerProps={{title: i18n('title_confirmation')}}
            initialValues={{
                timeout: showTimeout ? INITIAL_TIMEOUT : undefined,
                runningJobsStrategy: showRunningJobsStrategy ? 'abort' : undefined,
            }}
            fields={[
                {name: 'message', type: 'block', extras: {children: message}},
                ...(showTimeout
                    ? [
                          {
                              name: 'timeout',
                              type: 'time-duration' as const,
                              caption: i18n('label_interruption-timeout'),
                              required: true,
                              validator: (value: TimeDurationProps['value']) =>
                                  value?.value === undefined
                                      ? i18n('alert_timeout-required')
                                      : undefined,
                          },
                      ]
                    : []),
                ...(showRunningJobsStrategy
                    ? [
                          {
                              name: 'runningJobsStrategy',
                              type: 'radio' as const,
                              caption: i18n('field_running-jobs-strategy'),
                              extras: {
                                  options: [
                                      {value: 'abort', label: i18n('value_abort-running-jobs')},
                                      {value: 'retain', label: i18n('value_retain-running-jobs')},
                                  ],
                              },
                          },
                      ]
                    : []),
                ...(requireConfirmation
                    ? [
                          {
                              name: 'confirmed',
                              type: 'checkbox' as const,
                              extras: {children: i18n('confirm_please-proceed')},
                              required: true,
                          },
                      ]
                    : []),
            ]}
            onAdd={handleConfirm}
            onClose={() => {
                if (mounted.current) {
                    onClose();
                }
            }}
        />
    );
}
