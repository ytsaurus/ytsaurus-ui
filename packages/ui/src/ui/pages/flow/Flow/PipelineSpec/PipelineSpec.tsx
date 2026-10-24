import React from 'react';

import {Button} from '@gravity-ui/uikit';
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
import {YTErrorBlock} from '../../../../containers/Block/Block';
import Loader from '../../../../components/Loader/Loader';
import {DynamicSpec} from './DynamicSpec/DynamicSpec';
import {EditSpecDialog, type SpecEditOptions} from './EditSpecDialog';
import {decodeDynamicSpecValue, dynamicSpecPath} from '../../../../utils/flow/dynamic-spec';
import {type Int64} from '../../../../../shared/yt-types';

import {pathToFileName} from '../../../navigation/helpers/pathToFileName';

import './PipelineSpec.scss';
import i18n from './i18n';

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
                            command: 'patch-pipeline-dynamic-spec',
                            body: {
                                set_path: dynamicSpecPath(specPath),
                                set_value: spec,
                                expected_version,
                                comment: comment ?? '',
                            },
                        }),
                    )
                }
                onCancelOwner={(version: Int64, expected_version) =>
                    dispatch(
                        mutateFlowDynamicSpec({
                            path,
                            command: 'cancel-pipeline-dynamic-spec-patch',
                            body: {patch: version, expected_version},
                        }),
                    )
                }
                onUpdateComment={(patch: Int64, comment, expected_version) =>
                    dispatch(
                        mutateFlowDynamicSpec({
                            path,
                            command: 'patch-pipeline-dynamic-spec',
                            body: {patch, comment, expected_version},
                        }),
                    )
                }
                onReset={(expected_version) =>
                    dispatch(
                        mutateFlowDynamicSpec({
                            path,
                            command: 'reset-pipeline-dynamic-spec',
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
