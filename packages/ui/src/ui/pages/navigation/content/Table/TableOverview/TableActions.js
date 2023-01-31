import React, {Fragment} from 'react';
import {connect, useDispatch, useSelector} from 'react-redux';
import PropTypes from 'prop-types';
import ypath from '@ytsaurus/interface-helpers/lib/ypath';
import hammer from '../../../../../common/hammer';
import {compose} from 'redux';

import DownloadManager from '../../../../../pages/navigation/content/Table/DownloadManager/DownloadManager';
import Button from '../../../../../components/Button/Button';

import {mountUnmountTable} from '../../../../../store/actions/navigation/content/table/table';
import {getAttributes, getPath} from '../../../../../store/selectors/navigation';
import withVisible from '../../../../../hocs/withVisible';
import UploadManager from '../UploadManager/UploadManager';
import {showDynTablesStateModalByPaths} from '../../../../../store/actions/navigation/modals/dyn-tables-state-modal';

const propTypes = {
    // from parent
    block: PropTypes.func.isRequired,

    // from withVisible
    visible: PropTypes.bool.isRequired,
    handleClose: PropTypes.func.isRequired,
    handleShow: PropTypes.func.isRequired,

    // from connect
    isDynamic: PropTypes.bool.isRequired,
    tabletState: PropTypes.string,

    mountUnmountTable: PropTypes.func.isRequired,
};

DynamicActions.propTypes = propTypes;
function DynamicActions(props) {
    const dispatch = useDispatch();
    const path = useSelector(getPath);

    const {tabletState} = props;
    const action = tabletState !== 'mounted' ? 'mount' : 'unmount';
    const onClick = React.useCallback(() => {
        dispatch(showDynTablesStateModalByPaths([path], action));
    }, [action, path]);

    return (
        <Fragment>
            <Button size="m" onClick={onClick}>
                {hammer.format['Readable'](action)}
            </Button>
        </Fragment>
    );
}

StaticActions.propTypes = propTypes;
function StaticActions(props) {
    const {block} = props;

    return (
        <Fragment>
            <DownloadManager className={block('download-manager')} />
            <UploadManager />
        </Fragment>
    );
}

TableActions.propTypes = propTypes;
function TableActions(props) {
    const {block, isDynamic} = props;

    return (
        <div className={block('actions')}>
            {isDynamic ? <DynamicActions {...props} /> : <StaticActions {...props} />}
        </div>
    );
}

const mapStateToProps = (state) => {
    const {isDynamic} = state.navigation.content.table;
    const attributes = getAttributes(state);

    const tabletState = ypath.getValue(attributes, '/tablet_state');

    return {isDynamic, tabletState};
};

export default compose(connect(mapStateToProps, {mountUnmountTable}), withVisible)(TableActions);
