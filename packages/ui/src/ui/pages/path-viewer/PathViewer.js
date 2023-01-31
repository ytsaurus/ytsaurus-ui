import React, {useEffect, useCallback, useMemo} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {StickyContainer, Sticky} from 'react-sticky';
import cn from 'bem-cn-lite';

import Yson from '../../components/Yson/Yson';
import {Loader, TextInput, Checkbox} from '@gravity-ui/uikit';
import ErrorBoundary from '../../components/ErrorBoundary/ErrorBoundary';
import LoadDataHandler from '../../components/LoadDataHandler/LoadDataHandler';
import Select from '../../components/Select/Select';

import {
    loadData,
    changeParameters,
    toggleParameters,
    abortAndReset,
} from '../../store/actions/path-viewer';
import {HEADER_HEIGHT, KeyCode} from '../../constants/index';
import {getFormat} from '../../store/selectors/settings';
import {COMMAND} from '../../constants/path-viewer';

import './PathViewer.scss';

const block = cn('path-viewer');

function Overview() {
    const dispatch = useDispatch();

    const {path, attributes} = useSelector((state) => state.pathViewer);
    const {command, maxSize} = useSelector((state) => state.pathViewer);
    const {encodeUTF8, stringify, annotateWithTypes} = useSelector((state) => state.pathViewer);

    const handleApply = useCallback(
        (evt) => {
            if (evt.keyCode === KeyCode.ENTER) {
                dispatch(loadData());
            }
        },
        [dispatch],
    );

    const handlePathChange = useCallback(
        (path) => dispatch(changeParameters('path', path)),
        [dispatch],
    );
    const handleAttributesChange = useCallback(
        (attributes) => dispatch(changeParameters('attributes', attributes)),
        [dispatch],
    );

    const handleCommandChange = useCallback(
        (command) => dispatch(changeParameters('command', command, true)),
        [dispatch],
    );
    const handleMaxSizeChange = useCallback(
        (maxSize) => dispatch(changeParameters('maxSize', maxSize)),
        [dispatch],
    );

    const handleEncodeChange = useCallback(
        () => dispatch(toggleParameters('encodeUTF8')),
        [dispatch],
    );
    const handleStringifyChange = useCallback(
        () => dispatch(toggleParameters('stringify')),
        [dispatch],
    );
    const handleAnnotateWithTypesChange = useCallback(
        () => dispatch(toggleParameters('annotateWithTypes')),
        [dispatch],
    );

    return (
        <Sticky topOffset={-HEADER_HEIGHT}>
            {({isSticky}) => (
                <div className={block('overview', {sticky: isSticky})}>
                    <div className={block('top-section')}>
                        <div className={block('path')}>
                            <TextInput
                                hasClear
                                size="m"
                                placeholder="Enter path..."
                                onUpdate={handlePathChange}
                                onKeyDown={handleApply}
                                value={path}
                            />
                        </div>

                        <div className={block('attributes')}>
                            <TextInput
                                hasClear
                                size="m"
                                placeholder="Enter attributes..."
                                onUpdate={handleAttributesChange}
                                onKeyDown={handleApply}
                                value={attributes}
                            />
                        </div>
                    </div>

                    <div className={block('middle-section')}>
                        <div className={block('command')}>
                            <Select
                                onUpdate={(vals) => handleCommandChange(vals[0])}
                                hideFilter
                                value={[command]}
                                label="Command:"
                                items={[
                                    {
                                        value: COMMAND.GET,
                                        text: COMMAND.GET,
                                    },
                                    {
                                        value: COMMAND.LIST,
                                        text: COMMAND.LIST,
                                    },
                                ]}
                            />
                        </div>

                        <div className={block('max-size')}>
                            <TextInput
                                hasClear
                                size="m"
                                placeholder="Enter max size..."
                                onUpdate={handleMaxSizeChange}
                                onKeyDown={handleApply}
                                value={maxSize}
                            />
                        </div>
                    </div>

                    <div className={block('bottom-section')}>
                        <div className={block('checkbox')}>
                            <Checkbox
                                content="Encode UTF8"
                                checked={encodeUTF8}
                                onChange={handleEncodeChange}
                            />
                        </div>

                        <div className={block('checkbox')}>
                            <Checkbox
                                content="Stringify"
                                checked={stringify}
                                onChange={handleStringifyChange}
                            />
                        </div>

                        <div className={block('checkbox')}>
                            <Checkbox
                                content="Annotate with types"
                                checked={annotateWithTypes}
                                onChange={handleAnnotateWithTypesChange}
                            />
                        </div>
                    </div>
                </div>
            )}
        </Sticky>
    );
}

export default function PathViewer() {
    const dispatch = useDispatch();
    const {data, loading, error, errorData} = useSelector((state) => state.pathViewer);
    const format = useSelector(getFormat);
    const settings = useMemo(() => ({format}), [format]);

    useEffect(() => {
        dispatch(loadData());
        return () => dispatch(abortAndReset());
    }, [dispatch]);

    return (
        <div className={block(null, 'elements-main-section')}>
            <ErrorBoundary>
                <StickyContainer>
                    <Overview />

                    <div className={block('content', {loading})}>
                        {loading ? (
                            <Loader />
                        ) : (
                            <LoadDataHandler loaded={false} error={error} errorData={errorData}>
                                <Yson value={data} settings={settings} />
                            </LoadDataHandler>
                        )}
                    </div>
                </StickyContainer>
            </ErrorBoundary>
        </div>
    );
}
