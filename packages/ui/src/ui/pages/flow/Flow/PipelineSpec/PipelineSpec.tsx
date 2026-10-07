import React from 'react';
import cn from 'bem-cn-lite';

import {Alert, Button, Link} from '@gravity-ui/uikit';
import {type RenderRowExtraTools} from '@gravity-ui/react-unipika';

import {type YTError} from '../../../../../@types/types';

import {useUpdater} from '../../../../hooks/use-updater';

import {useDispatch, useSelector} from '../../../../store/redux-hooks';
import {
    loadFlowDynamicSpec,
    loadFlowStaticSpec,
    mutateFlowDynamicSpec,
    updateFlowDynamicSpec,
    updateFlowStaticSpec,
} from '../../../../store/actions/flow/specs';
import {
    selectFlowDynamicSpecData,
    selectFlowDynamicSpecError,
    selectFlowDynamicSpecFirstLoading,
    selectFlowStaticSpecData,
    selectFlowStaticSpecError,
    selectFlowStaticSpecFirstLoading,
} from '../../../../store/selectors/flow/specs';
import {selectFlowSpecYsonSettings} from '../../../../store/selectors/thor/unipika';
import {type FlowSpecState} from '../../../../store/reducers/flow/specs';

import {YsonDownloadButton} from '../../../../components/DownloadAttributesButton';
import {YsonWithScroll} from '../../../../components/Yson/YsonWithScroll';
import Icon from '../../../../components/Icon/Icon';
import {YTDFDialog, makeErrorFields} from '../../../../containers/Dialog';
import {YTErrorBlock} from '../../../../containers/Block/Block';
import Loader from '../../../../components/Loader/Loader';
import {type UnipikaSettings} from '../../../../components/Yson/StructuredYson/StructuredYsonTypes';
import UIFactory from '../../../../UIFactory';
import {DynamicSpec} from './DynamicSpec/DynamicSpec';
import {
    decodeDynamicSpecValue,
    dynamicSpecEdits,
    dynamicSpecHasComment,
    dynamicSpecPath,
} from '../../../../utils/flow/dynamic-spec';
import {type Int64} from '../../../../../shared/yt-types';

import {pathToFileName} from '../../../navigation/helpers/pathToFileName';

import './PipelineSpec.scss';
import i18n from './i18n';

const block = cn('yt-pipeline-spec');

type PipelineSpecProps = {
    path: string;
    error: YTError | undefined;
    data: FlowSpecState['data'];
    name: string;
    onSave: (data: PipelineSpecProps['data'], options: SpecEditOptions) => Promise<void>;
    allowForce?: boolean;
    sparse?: boolean;
    requireComment?: boolean;
    renderRowExtraTools?: RenderRowExtraTools;
};

function PipelineSpec({
    path,
    data,
    error,
    name,
    onSave,
    allowForce,
    sparse,
    requireComment,
    renderRowExtraTools,
}: PipelineSpecProps) {
    const [showEdit, setShowEdit] = React.useState(false);
    const [editData, setEditData] = React.useState(data);
    const specToEdit = sparse || requireComment ? editData?.spec : data?.spec;
    const editorSpec = React.useMemo(
        () => (sparse ? decodeDynamicSpecValue(specToEdit) : specToEdit),
        [sparse, specToEdit],
    );

    const settings = useSelector(selectFlowSpecYsonSettings);

    return (
        <React.Fragment>
            {Boolean(error) && <YTErrorBlock error={error} />}
            <YsonWithScroll
                value={data}
                settings={settings}
                renderRowExtraTools={renderRowExtraTools}
                extraTools={
                    <React.Fragment>
                        <YsonDownloadButton
                            value={data}
                            settings={settings}
                            name={`pipeline_spec_${pathToFileName(path)}`}
                        />
                        <Button
                            view="outlined"
                            disabled={!data}
                            onClick={() => {
                                setEditData(data);
                                setShowEdit(true);
                            }}
                        >
                            <Icon awesome="pencil" />
                            Edit {name}
                        </Button>
                    </React.Fragment>
                }
            />
            <EditSpecDialog
                path={path}
                name={name}
                visible={showEdit}
                onSpecApply={(spec, options) =>
                    onSave(
                        {...(sparse || requireComment ? editData : data)!, spec},
                        {
                            ...options,
                            ...(sparse ? {originalSpec: editData?.spec} : {}),
                        },
                    )
                }
                onClose={() => setShowEdit(false)}
                spec={editorSpec}
                settings={settings}
                allowForce={allowForce}
                withComment={sparse || requireComment}
                requireComment={requireComment}
                help={sparse ? i18n('context_sparse-edit') : undefined}
            />
        </React.Fragment>
    );
}

type FormValues = {
    text: {value?: string};
    path: string;
    force?: boolean;
    comment?: string;
};

type SpecEditOptions = {force?: boolean; originalSpec?: unknown; comment?: string};

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
    help,
    specPath,
}: Pick<PipelineSpecProps, 'name' | 'path'> & {
    spec?: unknown;
    visible: boolean;
    onClose: () => void;
    settings: UnipikaSettings;
    onSpecApply: (spec: unknown, options: SpecEditOptions) => Promise<void>;
    allowForce?: boolean;
    withComment?: boolean;
    requireComment?: boolean;
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
        if (!dynamicSpecEdits(spec ?? null, value).length) {
            return i18n('context_value-change-required');
        }
        return undefined;
    };

    return (
        visible && (
            <YTDFDialog<FormValues>
                visible
                size="l"
                onClose={onClose}
                initialValues={{text, path, ...(requireComment ? {comment: ''} : {})}}
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
                    title: `Edit ${name}`,
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

export function FlowStaticSpec({pipeline_path: path}: {pipeline_path: string}) {
    const dispatch = useDispatch();

    const data = useSelector(selectFlowStaticSpecData);
    const error = useSelector(selectFlowStaticSpecError);
    const firstLoading = useSelector(selectFlowStaticSpecFirstLoading);

    const updateFn = React.useCallback(() => {
        dispatch(loadFlowStaticSpec(path));
    }, [dispatch, path]);
    useUpdater(updateFn);

    const onEdit = React.useCallback(
        (newData: typeof data, options: {force?: boolean}) => {
            return dispatch(updateFlowStaticSpec({path, data: newData}, options));
        },
        [path, dispatch],
    );

    return firstLoading ? (
        <Loader />
    ) : (
        <PipelineSpec
            path={path}
            data={data}
            error={error}
            name="static specification"
            onSave={onEdit}
            allowForce
        />
    );
}

export function FlowDynamicSpec({pipeline_path: path}: {pipeline_path: string}) {
    const dispatch = useDispatch();

    const data = useSelector(selectFlowDynamicSpecData);
    const error = useSelector(selectFlowDynamicSpecError);
    const firstLoading = useSelector(selectFlowDynamicSpecFirstLoading);
    const settings = useSelector(selectFlowSpecYsonSettings);

    const updateFn = React.useCallback(() => {
        dispatch(loadFlowDynamicSpec(path));
    }, [dispatch, path]);
    useUpdater(updateFn);

    const onEdit = React.useCallback(
        (newData: typeof data, {originalSpec, comment}: SpecEditOptions) => {
            return dispatch(updateFlowDynamicSpec({path, data: newData, originalSpec, comment}));
        },
        [path, dispatch],
    );

    return firstLoading ? (
        <Loader />
    ) : (
        <>
            {Boolean(error) && <YTErrorBlock error={error} />}
            <DynamicSpec
                key={path}
                snapshot={data?.dynamic_spec_state}
                unavailable={data?.dynamic_spec_state_unavailable}
                settings={settings}
                pipelinePath={path}
                onSet={(specPath, spec, expected_version, comment) =>
                    dispatch(
                        mutateFlowDynamicSpec({
                            path,
                            command: 'set-pipeline-dynamic-spec',
                            body: {
                                path: dynamicSpecPath(specPath),
                                spec,
                                expected_version,
                                comment,
                            },
                        }),
                    )
                }
                onCancelPath={(specPath, expected_version) =>
                    dispatch(
                        mutateFlowDynamicSpec({
                            path,
                            command: 'cancel-pipeline-dynamic-spec-override',
                            body: {path: dynamicSpecPath(specPath), expected_version},
                        }),
                    )
                }
                onCancelOwner={(version: Int64, expected_version) =>
                    dispatch(
                        mutateFlowDynamicSpec({
                            path,
                            command: 'cancel-pipeline-dynamic-spec-patch',
                            body: {version, expected_version},
                        }),
                    )
                }
                onReset={(expected_version) =>
                    dispatch(
                        mutateFlowDynamicSpec({
                            path,
                            command: 'reset-pipeline-dynamic-spec-override',
                            body: {expected_version},
                        }),
                    )
                }
                renderEffective={(renderRowExtraTools) => (
                    <PipelineSpec
                        key={path}
                        path={path}
                        data={data && {spec: data.spec, version: data.version}}
                        error={undefined}
                        name="dynamic specification"
                        onSave={onEdit}
                        sparse={Boolean(data?.dynamic_spec_state)}
                        requireComment
                        renderRowExtraTools={renderRowExtraTools}
                    />
                )}
            />
        </>
    );
}
