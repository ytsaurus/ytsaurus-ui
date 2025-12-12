import React from 'react';
import cn from 'bem-cn-lite';

import {Alert, Button, Link} from '@gravity-ui/uikit';

import {YTError} from '../../../../../@types/types';

import {useUpdater} from '../../../../hooks/use-updater';

import {useDispatch, useSelector} from '../../../../store/redux-hooks';
import {
    loadFlowDynamicSpec,
    loadFlowStaticSpec,
    updateFlowDynamicSpec,
    updateFlowStaticSpec,
} from '../../../../store/actions/flow/specs';
import {
    getFlowDynamicSpecData,
    getFlowDynamicSpecFirstLoading,
    getFlowStaticSpecData,
    getFlowStaticSpecError,
    getFlowStaticSpecFirstLoading,
} from '../../../../store/selectors/flow/specs';
import {getFlowSpecYsonSettings} from '../../../../store/selectors/thor/unipika';
import {FlowSpecState} from '../../../../store/reducers/flow/specs';

import {YsonDownloadButton} from '../../../../components/DownloadAttributesButton';
import Yson from '../../../../components/Yson/Yson';
import Icon from '../../../../components/Icon/Icon';
import {YTDFDialog, makeErrorFields} from '../../../../components/Dialog';
import {YTErrorBlock} from '../../../../components/Block/Block';
import Loader from '../../../../components/Loader/Loader';
import {UnipikaSettings} from '../../../../components/Yson/StructuredYson/StructuredYsonTypes';
import UIFactory from '../../../../UIFactory';

import {pathToFileName} from '../../../navigation/helpers/pathToFileName';

import './PipelineSpec.scss';
import i18n from './i18n';

const block = cn('yt-pipeline-spec');

type PipelineSpecProps = {
    path: string;
    error: YTError | undefined;
    data: FlowSpecState['data'];
    name: string;
    onSave: (data: PipelineSpecProps['data'], options: {force?: boolean}) => Promise<void>;
    allowForce?: boolean;
};

function PipelineSpec({path, data, error, name, onSave, allowForce}: PipelineSpecProps) {
    const [showEdit, setShowEdit] = React.useState(false);

    const settings = useSelector(getFlowSpecYsonSettings);

    return (
        <React.Fragment>
            {Boolean(error) && <YTErrorBlock error={error} />}
            <Yson
                value={data}
                settings={settings}
                virtualized
                folding
                extraTools={
                    <React.Fragment>
                        <YsonDownloadButton
                            value={data}
                            settings={settings}
                            name={`pipeline_spec_${pathToFileName(path)}`}
                        />
                        <Button view="outlined" onClick={() => setShowEdit(true)}>
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
                onSpecApply={(spec, options) => onSave({...data!, spec}, options)}
                onClose={() => setShowEdit(false)}
                spec={data?.spec}
                settings={settings}
                allowForce={allowForce}
            />
        </React.Fragment>
    );
}

type FormValues = {
    text: {value?: string};
    path: string;
    force?: boolean;
};

function EditSpecDialog({
    path,
    visible,
    spec,
    onClose,
    onSpecApply,
    name,
    settings,
    allowForce,
}: Pick<PipelineSpecProps, 'name' | 'path'> & {
    spec?: unknown;
    visible: boolean;
    onClose: () => void;
    settings: UnipikaSettings;
    onSpecApply: (spec: unknown, options: {force?: boolean}) => Promise<void>;
    allowForce?: boolean;
}) {
    const [error, setError] = React.useState<YTError | undefined>();

    const text = React.useMemo(() => {
        return {value: JSON.stringify(spec, null, 4)};
    }, [spec]);

    const forceHelpUrl = UIFactory.docsUrls['flow:update_static_spec:force'];

    return (
        visible && (
            <YTDFDialog<FormValues>
                visible
                size="l"
                onClose={onClose}
                initialValues={{text, path}}
                headerProps={{
                    title: `Edit ${name}`,
                }}
                onAdd={async (f) => {
                    setError(undefined);
                    const {text, force} = f.getState().values;
                    if (text.value) {
                        try {
                            return await onSpecApply(JSON.parse(text.value), {force});
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
                    {
                        name: 'text',
                        caption: i18n('specification'),
                        type: 'json',
                        fullWidth: true,
                        extras: {
                            className: block('editor'),
                            initialShowPreview: false,
                            unipikaSettings: settings,
                        },
                    },
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

    const data = useSelector(getFlowStaticSpecData);
    const error = useSelector(getFlowStaticSpecError);
    const firstLoading = useSelector(getFlowStaticSpecFirstLoading);

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

    const data = useSelector(getFlowDynamicSpecData);
    const error = useSelector(getFlowStaticSpecError);
    const firstLoading = useSelector(getFlowDynamicSpecFirstLoading);

    const updateFn = React.useCallback(() => {
        dispatch(loadFlowDynamicSpec(path));
    }, [dispatch, path]);
    useUpdater(updateFn);

    const onEdit = React.useCallback(
        (newData: typeof data) => {
            return dispatch(updateFlowDynamicSpec({path, data: newData}));
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
            name="dynamic specification"
            onSave={onEdit}
        />
    );
}
