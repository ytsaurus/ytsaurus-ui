import React from 'react';
import cn from 'bem-cn-lite';

import {Alert, Link} from '@gravity-ui/uikit';

import {type YTError} from '../../../../../@types/types';
import {YTDFDialog, makeErrorFields} from '../../../../containers/Dialog';
import {type UnipikaSettings} from '../../../../components/Yson/StructuredYson/StructuredYsonTypes';
import UIFactory from '../../../../UIFactory';
import {dynamicSpecEdits, dynamicSpecHasComment} from '../../../../utils/flow/dynamic-spec';

import i18n from './i18n';

const block = cn('yt-pipeline-spec');

type FormValues = {
    text: {value?: string};
    path: string;
    force?: boolean;
    comment?: string;
};

export type SpecEditOptions = {force?: boolean; originalSpec?: unknown; comment?: string};

export function EditSpecDialog({
    path,
    visible,
    spec,
    onClose,
    onSpecApply,
    name,
    settings,
    allowForce,
    withComment,
    requireComment,
    allowCommentOnly,
    initialComment,
    title,
    help,
    specPath,
}: {
    name: string;
    path: string;
    spec?: unknown;
    visible: boolean;
    onClose: () => void;
    settings: UnipikaSettings;
    onSpecApply: (spec: unknown, options: SpecEditOptions) => Promise<void>;
    allowForce?: boolean;
    withComment?: boolean;
    requireComment?: boolean;
    allowCommentOnly?: boolean;
    initialComment?: string;
    title?: string;
    help?: string;
    specPath?: string;
}) {
    const [error, setError] = React.useState<YTError | undefined>();

    const text = React.useMemo(() => {
        return {value: JSON.stringify(spec, null, 4)};
    }, [spec]);

    const forceHelpUrl = UIFactory.docsUrls['flow:update_static_spec:force'];
    const updateError = (value: unknown, comment?: string) => {
        if (!requireComment) {
            return undefined;
        }
        if (!dynamicSpecHasComment(comment)) {
            return i18n('context_comment-required');
        }
        if (
            !dynamicSpecEdits(spec ?? null, value).length &&
            (!allowCommentOnly || comment === initialComment)
        ) {
            return i18n(
                allowCommentOnly
                    ? 'context_patch-change-required'
                    : 'context_value-change-required',
            );
        }
        return undefined;
    };

    return (
        visible && (
            <YTDFDialog<FormValues>
                visible
                size="l"
                onClose={onClose}
                initialValues={{
                    text,
                    path,
                    ...(requireComment ? {comment: initialComment ?? ''} : {}),
                }}
                validate={
                    requireComment
                        ? (values) => {
                              try {
                                  const message = updateError(
                                      JSON.parse(values.text.value ?? ''),
                                      values.comment,
                                  );
                                  return message ? {comment: message} : undefined;
                              } catch {
                                  return undefined;
                              }
                          }
                        : undefined
                }
                headerProps={{
                    title: title ?? `Edit ${name}`,
                }}
                onAdd={async (f) => {
                    setError(undefined);
                    const {text: textData, force, comment} = f.getState().values;
                    if (textData.value) {
                        try {
                            const value = JSON.parse(textData.value);
                            if (updateError(value, comment)) {
                                return Promise.resolve();
                            }
                            return await onSpecApply(value, {force, comment});
                        } catch (e: any) {
                            setError(e);
                            return Promise.reject(e);
                        }
                    } else {
                        return Promise.resolve();
                    }
                }}
                fields={[
                    {
                        caption: i18n('pipeline-path'),
                        name: 'path',
                        type: 'plain',
                    },
                    ...(specPath !== undefined
                        ? [
                              {
                                  name: 'specPath',
                                  caption: i18n('field_path'),
                                  type: 'block' as const,
                                  extras: {children: specPath || '/'},
                              },
                          ]
                        : []),
                    ...(help
                        ? [
                              {
                                  name: 'help',
                                  type: 'block' as const,
                                  extras: {children: <Alert theme="info" message={help} />},
                              },
                          ]
                        : []),
                    {
                        name: 'text',
                        caption: i18n('specification'),
                        type: 'json',
                        validateFields: requireComment ? ['comment'] : undefined,
                        fullWidth: true,
                        extras: {
                            className: block('editor'),
                            initialShowPreview: false,
                            unipikaSettings: settings,
                        },
                    },
                    ...(withComment
                        ? [{name: 'comment', caption: i18n('field_comment'), type: 'text' as const}]
                        : []),
                    ...(allowForce
                        ? [
                              {
                                  name: 'force',
                                  caption: i18n('force'),
                                  type: 'tumbler' as const,
                              },
                          ]
                        : []),
                    {
                        name: 'forceWarningn',
                        caption: '',
                        type: 'block',
                        visibilityCondition: {when: 'force', isActive: (v) => v},
                        extras: {
                            children: (
                                <Alert
                                    style={{marginTop: -16}}
                                    theme="warning"
                                    message={
                                        <div>
                                            {i18n('alert_force-mode-unrecoverable')}{' '}
                                            {Boolean(forceHelpUrl) && (
                                                <>
                                                    {i18n('for-more-details-1')}{' '}
                                                    <Link
                                                        href={forceHelpUrl}
                                                        target="_blank"
                                                        style={{display: 'inline'}}
                                                    >
                                                        {i18n('for-more-details-2')}.
                                                    </Link>
                                                </>
                                            )}
                                        </div>
                                    }
                                />
                            ),
                        },
                    },
                    ...makeErrorFields([error]),
                ]}
            />
        )
    );
}
