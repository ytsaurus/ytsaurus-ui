import React from 'react';
import cn from 'bem-cn-lite';
import PropTypes from 'prop-types';
import {Sticky} from 'react-sticky';
import {connect} from 'react-redux';

import ColumnSelectorButton from '../../../../../pages/navigation/content/Table/TableOverview/ColumnSelectorButton';
import FullScreenButton from '../../../../../pages/navigation/content/Table/TableOverview/FullScreenButton';
import SettingsButton from '../../../../../pages/navigation/content/Table/TableOverview/SettingsButton';
import JupyterButton from '../../../../../pages/navigation/content/Table/TableOverview/JupyterButton';
import TableActions from '../../../../../pages/navigation/content/Table/TableOverview/TableActions';
import OffsetInput from '../../../../../pages/navigation/content/Table/TableOverview/OffsetInput';
import Paginator from '../../../../../pages/navigation/content/Table/TableOverview/Paginator';
import ErrorBoundary from '../../../../../components/ErrorBoundary/ErrorBoundary';
import UIFactory from '../../../../../UIFactory';
import {CreateQueryFromTable} from './CreateQueryFromTable';

import {HEADER_HEIGHT, Page} from '../../../../../constants/index';

import './TableOverview.scss';
import EditTableActions from './EditTableActions';
import DataLensButton from './DatalensButton';
import {getAdminPages, isDeveloper} from '../../../../../store/selectors/global';

const block = cn('navigation-table-overview');

TableOverview.propTypes = {
    // from connect
    isFullScreen: PropTypes.bool.isRequired,
    isSplit: PropTypes.bool.isRequired,
    queriesAllowed: PropTypes.bool,
};

function TableOverview(props) {
    const {isFullScreen, isSplit, queriesAllowed} = props;

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
                        <OffsetInput block={block} />
                        {!isFullScreen && <ColumnSelectorButton block={block} />}
                        {!isFullScreen && <SettingsButton block={block} />}
                        {!isFullScreen && queriesAllowed && (
                            <CreateQueryFromTable className={block('query')} />
                        )}
                        {!isFullScreen &&
                            UIFactory.yqlWidgetSetup?.renderButton({
                                isSplit,
                                className: block('yql'),
                            })}
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
    const adminPages = getAdminPages(state);
    const isAdmin = isDeveloper(state);

    return {
        isFullScreen,
        isSplit,
        queriesAllowed: !adminPages?.includes(Page.QUERIES) || isAdmin,
    };
};

export default connect(mapStateToProps)(TableOverview);
