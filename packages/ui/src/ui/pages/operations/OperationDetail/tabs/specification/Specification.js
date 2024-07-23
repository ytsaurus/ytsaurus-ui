import React from 'react';
import {connect, useSelector} from 'react-redux';
import unipika from '../../../../../common/thor/unipika';

import keys_ from 'lodash/keys';
import throttle_ from 'lodash/throttle';

import cn from 'bem-cn-lite';

import {CollapsibleSectionStateLess} from '../../../../../components/CollapsibleSection/CollapsibleSection';
import ErrorBoundary from '../../../../../components/ErrorBoundary/ErrorBoundary';
import HelpLink from '../../../../../components/HelpLink/HelpLink';
import Yson from '../../../../../components/Yson/Yson';

import {operationProps} from '../../../../../pages/operations/OperationDetail/tabs/details/Details/Details';

import {getOperationDetailsLoadingStatus} from '../../../../../store/selectors/operations/operation';
import {RumMeasureTypes} from '../../../../../rum/rum-measure-types';
import {isFinalLoadingStatus} from '../../../../../utils/utils';
import {useRumMeasureStop} from '../../../../../rum/RumUiContext';
import {useAppRumMeasureStart} from '../../../../../rum/rum-app-measures';

import './Specification.scss';
import ExperimentAssignments from '../../ExperimentAssignments/ExperimentAssignments';
import {docsUrl} from '../../../../../config';
import UIFactory from '../../../../../UIFactory';
import {UI_COLLAPSIBLE_SIZE} from '../../../../../constants/global';

const block = cn('operation-specification');

const onResize = throttle_(
    () => {
        window.dispatchEvent(new Event('resize'));
    },
    100,
    {leading: false},
);

function Specification({operation}) {
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
                    name="Provided specification"
                    onToggle={onToggleProvided}
                    collapsed={collapsed.provided}
                    size={UI_COLLAPSIBLE_SIZE}
                    marginDirection="bottom"
                >
                    <Yson
                        value={providedSpec}
                        settings={unipika.prepareSettings()}
                        folding
                        virtualized
                    />
                </CollapsibleSectionStateLess>

                <ExperimentAssignments />

                {hasUnrecognized && (
                    <CollapsibleSectionStateLess
                        name="Unrecognized specification"
                        onToggle={onToggleUnrecognized}
                        collapsed={collapsed.unrecognized}
                        size={UI_COLLAPSIBLE_SIZE}
                        marginDirection="bottom"
                    >
                        <Yson
                            value={unrecognizedSpec}
                            settings={unipika.prepareSettings()}
                            folding
                            virtualized
                        />
                    </CollapsibleSectionStateLess>
                )}

                {fullSpec && (
                    <CollapsibleSectionStateLess
                        name="Resulting specification"
                        onToggle={onToggleResulting}
                        collapsed={collapsed.resulting}
                        size={UI_COLLAPSIBLE_SIZE}
                        marginDirection="bottom"
                    >
                        <Yson
                            value={fullSpec}
                            settings={unipika.prepareSettings()}
                            folding
                            virtualized
                        />
                    </CollapsibleSectionStateLess>
                )}
            </div>
        </ErrorBoundary>
    );
}

Specification.propTypes = {
    // from connect
    operation: operationProps.isRequired,
};

const mapStateToProps = ({operations}) => ({
    operation: operations.detail.operation,
});

const SpecificationConnected = connect(mapStateToProps)(Specification);

export default function SpecificationWithRum() {
    const loadState = useSelector(getOperationDetailsLoadingStatus);

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
