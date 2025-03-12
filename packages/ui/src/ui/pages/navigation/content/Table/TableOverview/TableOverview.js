import React from 'react';
import cn from 'bem-cn-lite';
import PropTypes from 'prop-types';
import {Sticky} from 'react-sticky';
import {connect} from 'react-redux';
import ypath from '../../../../../common/thor/ypath';

import {getIsSortedDynamic} from '../../../../../store/selectors/navigation/content/table-ts';
import {getAttributes} from '../../../../../store/selectors/navigation';

import ColumnSelectorButton from '../../../../../pages/navigation/content/Table/TableOverview/ColumnSelectorButton';
import FullScreenButton from '../../../../../pages/navigation/content/Table/TableOverview/FullScreenButton';
import SettingsButton from '../../../../../pages/navigation/content/Table/TableOverview/SettingsButton';
import JupyterButton from '../../../../../pages/navigation/content/Table/TableOverview/JupyterButton';
import TableActions from '../../../../../pages/navigation/content/Table/TableOverview/TableActions';
import OffsetInput from '../../../../../pages/navigation/content/Table/TableOverview/OffsetInput';
import Paginator from '../../../../../pages/navigation/content/Table/TableOverview/Paginator';
import ErrorBoundary from '../../../../../components/ErrorBoundary/ErrorBoundary';
import {OpenQueryButtons} from '../../../../../containers/OpenQueryButtons/OpenQueryButtons';

import {HEADER_HEIGHT} from '../../../../../constants/index';

import './TableOverview.scss';
import EditTableActions from './EditTableActions';
import DataLensButton from './DatalensButton';

const block = cn('navigation-table-overview');

TableOverview.propTypes = {
    // from connect
    isFullScreen: PropTypes.bool.isRequired,
    isSplit: PropTypes.bool.isRequired,
};

function TableOverview(props) {
    const {isFullScreen, isSplit, allowOffsetInput} = props;

    // TODO: add sticky for the Overview in the split mode https://github.com/captivationsoftware/react-sticky/issues/282
    return (
        <ErrorBoundary>
            <Sticky topOffset={isFullScreen ? HEADER_HEIGHT : -HEADER_HEIGHT}>
                {({isSticky}) => (
                    <div
                        className={block({
                            sticky: isSticky && !isSplit,
                            fullscreen: isFullScreen,
                            split: isSplit,
                        })}
                    >
                        <Paginator block={block} />
                        {allowOffsetInput && <OffsetInput block={block} />}
                        {!isFullScreen && <ColumnSelectorButton block={block} />}
                        {!isFullScreen && <SettingsButton block={block} />}
                        {!isFullScreen && <OpenQueryButtons className={block('query')} />}
                        {!isFullScreen && <JupyterButton block={block} />}
                        {!isFullScreen && <DataLensButton className={block('datalens')} />}
                        {!isFullScreen && <TableActions block={block} />}
                        <FullScreenButton block={block} />
                        {!isFullScreen && <EditTableActions />}
                    </div>
                )}
            </Sticky>
        </ErrorBoundary>
    );
}

const mapStateToProps = (state) => {
    const {isFullScreen} = state.navigation.content.table;
    const {isSplit} = state.global.splitScreen;
    const isSortedDynamic = getIsSortedDynamic(state);
    const attributes = getAttributes(state);

    const isUnmounted = ypath.getValue(attributes, '/tablet_state') === 'unmounted';
    const allowOffsetInput = !(isSortedDynamic && isUnmounted);

    return {
        isFullScreen,
        isSplit,
        allowOffsetInput,
    };
};

export default connect(mapStateToProps)(TableOverview);
