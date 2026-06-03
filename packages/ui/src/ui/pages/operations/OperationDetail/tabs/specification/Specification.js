import React from 'react';
import {connect} from 'react-redux';
import {useSelector} from '../../../../../store/redux-hooks';
import unipika from '../../../../../common/thor/unipika';
import PropTypes from 'prop-types';

import keys_ from 'lodash/keys';
import throttle_ from 'lodash/throttle';

import cn from 'bem-cn-lite';

import {CollapsibleSectionStateLess} from '../../../../../components/CollapsibleSection/CollapsibleSection';
import ErrorBoundary from '../../../../../containers/ErrorBoundary/ErrorBoundary';
import HelpLink from '../../../../../components/HelpLink/HelpLink';
import {YsonWithScroll} from '../../../../../components/Yson/YsonWithScroll';

import {
    selectOperationDetailsLoadingStatus,
    selectOperationId,
} from '../../../../../store/selectors/operations/operation';
import {RumMeasureTypes} from '../../../../../rum/rum-measure-types';
import {isFinalLoadingStatus} from '../../../../../utils/utils';
import {useRumMeasureStop} from '../../../../../rum/RumUiContext';
import {useAppRumMeasureStart} from '../../../../../rum/rum-app-measures';

import './Specification.scss';
import ExperimentAssignments from '../../ExperimentAssignments/ExperimentAssignments';
import i18n from './i18n';
import {docsUrl} from '../../../../../config';
import UIFactory from '../../../../../UIFactory';
import {UI_COLLAPSIBLE_SIZE} from '../../../../../constants/global';
import {YsonDownloadButton} from '../../../../../components/DownloadAttributesButton';

const block = cn('operation-specification');

const onResize = throttle_(
    () => {
        window.dispatchEvent(new Event('resize'));
    },
    100,
    {leading: false},
);

function Specification({operation, operationId}) {
    const helpUrl = UIFactory.docsUrls['operations:operations_options'];

    const providedSpec = operation.typedProvidedSpec || operation.typedSpec;

    const unrecognizedSpec = operation.typedUnrecognizedSpec || {};
    const fullSpec = operation.typedFullSpec;

    const hasUnrecognized = keys_(unrecognizedSpec).length > 0;

    const [collapsed, setCollapsed] = React.useState({
        provided: hasUnrecognized,
        unrecognized: false,
        resulting: true,
    });

    const onToggleProvided = React.useCallback((provided) => {
        setCollapsed({unrecognized: true, resulting: true, provided});
        onResize();
    });

    const onToggleUnrecognized = React.useCallback((unrecognized) => {
        setCollapsed({unrecognized, provided: true, resulting: true});
        onResize();
    });

    const onToggleResulting = React.useCallback((resulting) => {
        setCollapsed({unrecognized: true, resulting, provided: true});
        onResize();
    });

    return (
        <ErrorBoundary>
            <div className={block()}>
                {docsUrl(
                    <div className={block('help', 'elements-section')}>
                        <HelpLink url={helpUrl} />
                    </div>,
                )}

                <CollapsibleSectionStateLess
                    name={i18n('title_provided-specification')}
                    onToggle={onToggleProvided}
                    collapsed={collapsed.provided}
                    size={UI_COLLAPSIBLE_SIZE}
                    marginDirection="bottom"
                >
                    <YsonWithScroll
                        value={providedSpec}
                        settings={unipika.prepareSettings()}
                        extraTools={
                            <YsonDownloadButton
                                value={providedSpec}
                                settings={unipika.prepareSettings()}
                                name={`provider_specification_${operationId}`}
                            />
                        }
                    />
                </CollapsibleSectionStateLess>

                <ExperimentAssignments />

                {hasUnrecognized && (
                    <CollapsibleSectionStateLess
                        name={i18n('title_unrecognized-specification')}
                        onToggle={onToggleUnrecognized}
                        collapsed={collapsed.unrecognized}
                        size={UI_COLLAPSIBLE_SIZE}
                        marginDirection="bottom"
                    >
                        <YsonWithScroll
                            value={unrecognizedSpec}
                            settings={unipika.prepareSettings()}
                            extraTools={
                                <YsonDownloadButton
                                    value={unrecognizedSpec}
                                    settings={unipika.prepareSettings()}
                                    name={`unrecognized_specification_${operationId}`}
                                />
                            }
                        />
                    </CollapsibleSectionStateLess>
                )}

                {fullSpec && (
                    <CollapsibleSectionStateLess
                        name={i18n('title_resulting-specification')}
                        onToggle={onToggleResulting}
                        collapsed={collapsed.resulting}
                        size={UI_COLLAPSIBLE_SIZE}
                        marginDirection="bottom"
                    >
                        <YsonWithScroll
                            value={fullSpec}
                            settings={unipika.prepareSettings()}
                            extraTools={
                                <YsonDownloadButton
                                    value={fullSpec}
                                    settings={unipika.prepareSettings()}
                                    name={`resulting_specification_${operationId}`}
                                />
                            }
                        />
                    </CollapsibleSectionStateLess>
                )}
            </div>
        </ErrorBoundary>
    );
}

Specification.propTypes = {
    // from connect
    operation: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
    operation: state.operations.detail.operation,
    operationId: selectOperationId(state),
});

const SpecificationConnected = connect(mapStateToProps)(Specification);

export default function SpecificationWithRum() {
    const loadState = useSelector(selectOperationDetailsLoadingStatus);

    useAppRumMeasureStart({
        type: RumMeasureTypes.OPERATION_TAB_SPECIFICATION,
        additionalStartType: RumMeasureTypes.OPERATION,
        startDeps: [loadState],
        allowStart: ([loadState]) => {
            return !isFinalLoadingStatus(loadState);
        },
    });

    useRumMeasureStop({
        type: RumMeasureTypes.OPERATION_TAB_SPECIFICATION,
        stopDeps: [loadState],
        allowStop: ([loadState]) => {
            return isFinalLoadingStatus(loadState);
        },
    });

    return <SpecificationConnected />;
}
