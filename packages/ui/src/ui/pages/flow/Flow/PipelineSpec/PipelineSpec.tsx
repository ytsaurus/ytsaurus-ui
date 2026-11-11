import React from 'react';

import {Button} from '@gravity-ui/uikit';
import {type RenderRowExtraTools} from '@gravity-ui/react-unipika';

import {type YTError} from '../../../../../@types/types';

import {useUpdater} from '../../../../hooks/use-updater';

import {useDispatch, useSelector} from '../../../../store/redux-hooks';
import {
    loadFlowDynamicSpec,
    loadFlowDynamicSpecForEdit,
    loadFlowStaticSpec,
    mutateFlowDynamicSpec,
    updateFlowDynamicSpec,
    updateFlowStaticSpec,
} from '../../../../store/actions/flow/specs';
import {
    selectFlowDynamicSpecData,
    selectFlowDynamicSpecError,
    selectFlowDynamicSpecFirstLoading,
    selectFlowDynamicSpecLoading,
    selectFlowDynamicSpecPath,
    selectFlowDynamicSpecSupportedFeatures,
    selectFlowDynamicSpecView,
    selectFlowStaticSpecData,
    selectFlowStaticSpecError,
    selectFlowStaticSpecFirstLoading,
} from '../../../../store/selectors/flow/specs';
import {selectFlowSpecYsonSettings} from '../../../../store/selectors/thor/unipika';
import {type FlowDynamicSpecView, type FlowSpecState} from '../../../../store/reducers/flow/specs';

import {YsonDownloadButton} from '../../../../components/DownloadAttributesButton';
import {YsonWithScroll} from '../../../../components/Yson/YsonWithScroll';
import Icon from '../../../../components/Icon/Icon';
import {YTErrorBlock} from '../../../../containers/Block/Block';
import Loader from '../../../../components/Loader/Loader';

import {pathToFileName} from '../../../navigation/helpers/pathToFileName';

import {
    decodeDynamicSpecValue,
    dynamicSpecEdits,
    dynamicSpecPath,
    encodeDynamicSpecValue,
} from '../../../../utils/flow/dynamic-spec';
import {type FlowDynamicSpecEditDraft} from '../../../../store/actions/flow/specs';
import i18n from './i18n';
import {DynamicSpec} from './DynamicSpec/DynamicSpec';
import {EditSpecDialog} from './EditSpecDialog/EditSpecDialog';

type PipelineSpecProps = {
    path: string;
    error: YTError | undefined;
    data: FlowSpecState['data'];
    name: string;
    renderRowExtraTools?: RenderRowExtraTools;
} & (
    | {
          onSave: (data: FlowSpecState['data'], options: {force?: boolean}) => Promise<void>;
          allowForce?: boolean;
          onEdit?: never;
          editLoading?: never;
      }
    | {
          onSave?: never;
          allowForce?: never;
          onEdit: () => void;
          editLoading: boolean;
      }
);

function PipelineSpec({
    path,
    data,
    error,
    name,
    onSave,
    allowForce,
    onEdit,
    editLoading,
    renderRowExtraTools,
}: PipelineSpecProps) {
    const [showEdit, setShowEdit] = React.useState(false);
    const [editData, setEditData] = React.useState(data);
    const openEdit = () => {
        if (onEdit) {
            onEdit();
        } else {
            setEditData(data);
            setShowEdit(true);
        }
    };

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
                            loading={editLoading}
                            disabled={Boolean(onEdit && !data)}
                            onClick={openEdit}
                        >
                            <Icon awesome="pencil" />
                            Edit {name}
                        </Button>
                    </React.Fragment>
                }
            />
            {onSave && (
                <EditSpecDialog
                    path={path}
                    name={name}
                    visible={showEdit}
                    onSpecApply={(spec, options) => onSave({...editData!, spec}, options)}
                    onClose={() => setShowEdit(false)}
                    spec={editData?.spec}
                    settings={settings}
                    allowForce={allowForce}
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

    const [view, setView] = React.useState<FlowDynamicSpecView>('effective');
    const loadedView = useSelector(selectFlowDynamicSpecView);
    const loadedPath = useSelector(selectFlowDynamicSpecPath);
    const loadedData = useSelector(selectFlowDynamicSpecData);
    const data = loadedView === view && loadedPath === path ? loadedData : undefined;
    const features = useSelector(selectFlowDynamicSpecSupportedFeatures);
    const loading = useSelector(selectFlowDynamicSpecLoading);
    const settings = useSelector(selectFlowSpecYsonSettings);
    const error = useSelector(selectFlowDynamicSpecError);
    const firstLoading = useSelector(selectFlowDynamicSpecFirstLoading);

    const updateFn = React.useCallback(() => {
        dispatch(loadFlowDynamicSpec(path, view));
    }, [dispatch, path, view]);
    useUpdater(updateFn);

    const [editDraft, setEditDraft] = React.useState<FlowDynamicSpecEditDraft & {path: string}>();
    const [editLoading, setEditLoading] = React.useState(false);
    const [editError, setEditError] = React.useState<YTError>();
    const editRequest = React.useRef(0);
    React.useEffect(() => {
        setEditDraft(undefined);
        setEditError(undefined);
        setEditLoading(false);
        return () => {
            editRequest.current += 1;
        };
    }, [path]);
    const editorSpec = React.useMemo(
        () =>
            editDraft?.createPatch
                ? decodeDynamicSpecValue(editDraft.data.spec)
                : editDraft?.data.spec,
        [editDraft],
    );
    const openEdit = async () => {
        const request = ++editRequest.current;
        setEditError(undefined);
        setEditLoading(true);
        try {
            const draft = await dispatch(loadFlowDynamicSpecForEdit(path));
            if (request === editRequest.current) setEditDraft({...draft, path});
        } catch (cause) {
            if (request === editRequest.current) setEditError(cause as YTError);
        } finally {
            if (request === editRequest.current) setEditLoading(false);
        }
    };
    const renderEffective = (renderRowExtraTools?: RenderRowExtraTools) => (
        <PipelineSpec
            key={path}
            path={path}
            data={data && {version: data.version, spec: data.spec}}
            error={undefined}
            name="dynamic specification"
            onEdit={openEdit}
            editLoading={editLoading}
            renderRowExtraTools={renderRowExtraTools}
        />
    );

    if (firstLoading) return <Loader />;
    return (
        <>
            {Boolean(error) && <YTErrorBlock error={error} />}
            {Boolean(editError) && <YTErrorBlock error={editError} />}
            {features?.includes('dynamic_spec_patches') ? (
                <DynamicSpec
                    key={path}
                    data={data}
                    view={view}
                    onViewChange={setView}
                    loading={loading}
                    settings={settings}
                    pipelinePath={path}
                    renderEffective={renderEffective}
                    onUpdate={(patch, changes, comment, expected_version) =>
                        dispatch(
                            mutateFlowDynamicSpec({
                                path,
                                command: 'patch-pipeline-dynamic-spec',
                                body: {
                                    patch,
                                    comment,
                                    expected_version,
                                    ...(changes === undefined
                                        ? {}
                                        : {
                                              set_changes: changes.map(
                                                  ({path: changePath, value}) => ({
                                                      path: dynamicSpecPath(changePath),
                                                      value,
                                                  }),
                                              ),
                                          }),
                                },
                            }),
                        )
                    }
                    onCancel={(patch, version) =>
                        dispatch(
                            mutateFlowDynamicSpec({
                                path,
                                command: 'cancel-pipeline-dynamic-spec-patch',
                                body: {patch, expected_version: version},
                            }),
                        )
                    }
                    onReset={(version) =>
                        dispatch(
                            mutateFlowDynamicSpec({
                                path,
                                command: 'reset-pipeline-dynamic-spec',
                                body: {expected_version: version},
                            }),
                        )
                    }
                />
            ) : (
                renderEffective()
            )}
            {editDraft?.path === path && (
                <EditSpecDialog
                    path={editDraft.path}
                    name="dynamic specification"
                    visible
                    spec={editorSpec}
                    settings={settings}
                    withComment={editDraft.createPatch}
                    requireComment={editDraft.createPatch}
                    onClose={() => setEditDraft(undefined)}
                    onSpecApply={async (edited, {comment}) => {
                        if (!editDraft.createPatch) {
                            return dispatch(
                                updateFlowDynamicSpec({
                                    path: editDraft.path,
                                    data: {...editDraft.data, spec: edited},
                                }),
                            );
                        }
                        const spec = encodeDynamicSpecValue(edited, editDraft.data.spec);
                        const changes = dynamicSpecEdits(editDraft.data.spec, spec);
                        if (
                            changes.some(({path: key, value}) => !key.length || value === undefined)
                        ) {
                            throw new Error(i18n('error_deletion-unsupported'));
                        }
                        if (changes.some(({path: key}) => key[0] === 'target_state')) {
                            throw new Error(i18n('error_target-state-readonly'));
                        }
                        if (!changes.length) throw new Error(i18n('context_value-change-required'));
                        return dispatch(
                            mutateFlowDynamicSpec({
                                path: editDraft.path,
                                command: 'patch-pipeline-dynamic-spec',
                                body: {
                                    set_changes: changes.map(({path: key, value}) => ({
                                        path: dynamicSpecPath(key),
                                        value,
                                    })),
                                    comment: comment ?? '',
                                    expected_version: editDraft.data.version,
                                },
                            }),
                        );
                    }}
                />
            )}
        </>
    );
}
