import React from 'react';

import {Button} from '@gravity-ui/uikit';

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

import {DynamicSpec} from './DynamicSpec/DynamicSpec';
import {EditSpecDialog} from './EditSpecDialog/EditSpecDialog';

type PipelineSpecProps = {
    path: string;
    error: YTError | undefined;
    data: FlowSpecState['data'];
    name: string;
    onSave: (data: PipelineSpecProps['data'], options: {force?: boolean}) => Promise<void>;
    allowForce?: boolean;
    onLoadEditSpec?: () => Promise<NonNullable<FlowSpecState['data']>>;
};

function PipelineSpec({
    path,
    data,
    error,
    name,
    onSave,
    allowForce,
    onLoadEditSpec,
}: PipelineSpecProps) {
    const [showEdit, setShowEdit] = React.useState(false);
    const [editData, setEditData] = React.useState(data);
    const [editLoading, setEditLoading] = React.useState(false);
    const [editError, setEditError] = React.useState<YTError>();
    const editRequest = React.useRef(0);
    React.useEffect(
        () => () => {
            ++editRequest.current;
        },
        [path],
    );
    const openEdit = async () => {
        const request = ++editRequest.current;
        setEditError(undefined);
        if (!onLoadEditSpec) {
            setEditData(data);
            setShowEdit(true);
            return;
        }
        setEditLoading(true);
        try {
            const draft = await onLoadEditSpec();
            if (request !== editRequest.current) return;
            setEditData(draft);
            setShowEdit(true);
        } catch (e) {
            if (request === editRequest.current) setEditError(e as YTError);
        } finally {
            if (request === editRequest.current) setEditLoading(false);
        }
    };

    const settings = useSelector(selectFlowSpecYsonSettings);

    return (
        <React.Fragment>
            {Boolean(error) && <YTErrorBlock error={error} />}
            {Boolean(editError) && <YTErrorBlock error={editError} />}
            <YsonWithScroll
                value={data}
                settings={settings}
                extraTools={
                    <React.Fragment>
                        <YsonDownloadButton
                            value={data}
                            settings={settings}
                            name={`pipeline_spec_${pathToFileName(path)}`}
                        />
                        <Button view="outlined" loading={editLoading} onClick={openEdit}>
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
                onSpecApply={(spec, options) => onSave({...editData!, spec}, options)}
                onClose={() => setShowEdit(false)}
                spec={editData?.spec}
                settings={settings}
                allowForce={allowForce}
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

    const onEdit = React.useCallback(
        (newData: typeof data) => dispatch(updateFlowDynamicSpec({path, data: newData})),
        [path, dispatch],
    );
    const renderEffective = () => (
        <PipelineSpec
            key={path}
            path={path}
            data={data}
            error={undefined}
            name="dynamic specification"
            onSave={onEdit}
            onLoadEditSpec={() => dispatch(loadFlowDynamicSpecForEdit(path))}
        />
    );

    if (firstLoading) return <Loader />;
    return (
        <>
            {Boolean(error) && <YTErrorBlock error={error} />}
            {features?.includes('dynamic_spec_patches') ? (
                <DynamicSpec
                    key={path}
                    data={data}
                    view={view}
                    onViewChange={setView}
                    loading={loading}
                    settings={settings}
                    renderEffective={renderEffective}
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
        </>
    );
}
