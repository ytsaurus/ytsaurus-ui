import React from 'react';
import cn from 'bem-cn-lite';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import ypath from '../../../../../common/thor/ypath';

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

import './TableOverview.scss';
import EditTableActions from './EditTableActions';
import DataLensButton from './DatalensButton';

const block = cn('navigation-table-overview');

TableOverview.propTypes = {
    // from connect
    isFullScreen: PropTypes.bool.isRequired,
};

function TableOverview({isFullScreen, allowPagination}) {
    // TODO: add sticky for the Overview in the split mode https://github.com/captivationsoftware/react-sticky/issues/282
    return (
        <ErrorBoundary>
            <div className={block()}>
                {allowPagination && <Paginator block={block} />}
                <OffsetInput block={block} />
                {!isFullScreen && <ColumnSelectorButton block={block} />}
                {!isFullScreen && <SettingsButton block={block} />}
                {!isFullScreen && <OpenQueryButtons className={block('query')} />}
                {!isFullScreen && <JupyterButton block={block} />}
                {!isFullScreen && <DataLensButton className={block('datalens')} />}
                {!isFullScreen && <TableActions block={block} />}
                <FullScreenButton block={block} />
                {!isFullScreen && <EditTableActions />}
            </div>
        </ErrorBoundary>
    );
}

const mapStateToProps = (state) => {
    const {isFullScreen} = state.navigation.content.table;
    const attributes = getAttributes(state);

    const isUnmounted = ypath.getValue(attributes, '/tablet_state') === 'unmounted';
    const isSorted = ypath.getValue(attributes, '/sorted');

    const allowPagination = !(isUnmounted && !isSorted);

    return {
        isFullScreen,
        allowPagination,
    };
};

export default connect(mapStateToProps)(TableOverview);
