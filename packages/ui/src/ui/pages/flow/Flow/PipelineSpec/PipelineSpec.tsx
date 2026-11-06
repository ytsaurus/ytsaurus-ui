import React from 'react';

import {Button} from '@gravity-ui/uikit';

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
import {YTErrorBlock} from '../../../../containers/Block/Block';
import Loader from '../../../../components/Loader/Loader';

import {pathToFileName} from '../../../navigation/helpers/pathToFileName';

import {EditSpecDialog, type SpecEditOptions} from './EditSpecDialog/EditSpecDialog';
import {
    decodeDynamicSpecValue,
    dynamicSpecEdits,
    dynamicSpecPath,
    encodeDynamicSpecValue,
} from '../../../../utils/flow/dynamic-spec';
import i18n from './i18n';

import './PipelineSpec.scss';

type PipelineSpecProps = {
    path: string;
    error: YTError | undefined;
    data: FlowSpecState['data'];
    name: string;
    onSave: (
        data: PipelineSpecProps['data'],
        options: SpecEditOptions,
        originalData: PipelineSpecProps['data'],
    ) => Promise<void>;
    allowForce?: boolean;
    requireComment?: boolean;
};

function PipelineSpec({
    path,
    data,
    error,
    name,
    onSave,
    allowForce,
    requireComment,
}: PipelineSpecProps) {
    const [showEdit, setShowEdit] = React.useState(false);
    const [editData, setEditData] = React.useState(data);
    const [editRequireComment, setEditRequireComment] = React.useState(requireComment);
    const editorSpec = React.useMemo(
        () => (editRequireComment ? decodeDynamicSpecValue(editData?.spec) : editData?.spec),
        [editData, editRequireComment],
    );

    const settings = useSelector(selectFlowSpecYsonSettings);

    return (
        <React.Fragment>
            {Boolean(error) && <YTErrorBlock error={error} />}
            <YsonWithScroll
                value={data && {spec: data.spec, version: data.version}}
                settings={settings}
                extraTools={
                    <React.Fragment>
                        <YsonDownloadButton
                            value={data && {spec: data.spec, version: data.version}}
                            settings={settings}
                            name={`pipeline_spec_${pathToFileName(path)}`}
                        />
                        <Button
                            view="outlined"
                            disabled={!data}
                            onClick={() => {
                                setEditData(data);
                                setEditRequireComment(requireComment);
                                setShowEdit(true);
                            }}
                        >
                            <Icon awesome="pencil" />
                            Edit {name}
                        </Button>
                    </React.Fragment>
                }
            />
            {showEdit && (
                <EditSpecDialog
                    path={path}
                    name={name}
                    visible={showEdit}
                    onSpecApply={(spec, options) => onSave({...editData!, spec}, options, editData)}
                    onClose={() => setShowEdit(false)}
                    spec={editorSpec}
                    settings={settings}
                    allowForce={allowForce}
                    withComment={editRequireComment}
                    requireComment={editRequireComment}
                />
            )}
        </React.Fragment>
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

    const updateFn = React.useCallback(() => {
        dispatch(loadFlowDynamicSpec(path));
    }, [dispatch, path]);
    useUpdater(updateFn);

    const onEdit = React.useCallback(
        (newData: typeof data, {comment}: SpecEditOptions, originalData: typeof data) => {
            if (!originalData?.dynamic_spec_state_unavailable && originalData && newData) {
                const spec = encodeDynamicSpecValue(newData.spec, originalData.spec);
                const changes = dynamicSpecEdits(originalData.spec, spec);
                if (
                    changes.some(
                        ({path: changePath, value}) => !changePath.length || value === undefined,
                    )
                ) {
                    return Promise.reject(new Error(i18n('error_deletion-unsupported')));
                }
                if (changes.some(({path: changePath}) => changePath[0] === 'target_state')) {
                    return Promise.reject(new Error(i18n('error_target-state-readonly')));
                }
                return dispatch(
                    mutateFlowDynamicSpec({
                        path,
                        command: 'patch-pipeline-dynamic-spec',
                        body: {
                            set_changes: changes.map(({path: changePath, value}) => ({
                                path: dynamicSpecPath(changePath),
                                value,
                            })),
                            comment: comment ?? '',
                            expected_version: originalData.version,
                        },
                    }),
                );
            }
            return dispatch(updateFlowDynamicSpec({path, data: newData}));
        },
        [path, dispatch],
    );

    return firstLoading ? (
        <Loader />
    ) : (
        <PipelineSpec
            key={path}
            path={path}
            data={
                data && {
                    spec: data.spec,
                    version: data.version,
                    dynamic_spec_state_unavailable: data.dynamic_spec_state_unavailable,
                }
            }
            error={error}
            requireComment={!data?.dynamic_spec_state_unavailable}
            name="dynamic specification"
            onSave={onEdit}
        />
    );
}
