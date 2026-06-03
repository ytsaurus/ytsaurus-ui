import React from 'react';
import unipika from '../../../../../../common/thor/unipika';
import {connect} from 'react-redux';
import {compose} from 'redux';
import PropTypes from 'prop-types';
import hammer from '../../../../../../common/hammer';
import cn from 'bem-cn-lite';

import {Button} from '@gravity-ui/uikit';
import Modal from '../../../../../../components/Modal/Modal';
import {Yson, YsonSettingsPropTypes} from '../../../../../../components/Yson/Yson';

import withVisible from '../../../../../../hocs/withVisible';
import i18n from './i18n';

const block = cn('specification');

FilterOverview.propTypes = {
    // from parent-components
    type: PropTypes.string.isRequired,
    filters: PropTypes.object.isRequired,
    typedFilters: PropTypes.object.isRequired,
    // from connect
    settings: YsonSettingsPropTypes.isRequired,
    // from hoc
    visible: PropTypes.bool.isRequired,
    handleShow: PropTypes.func.isRequired,
    handleClose: PropTypes.func.isRequired,
};

function FilterOverview({type, filters, typedFilters, visible, handleShow, handleClose, settings}) {
    const modalContent = <Yson value={typedFilters} settings={settings} />;

    return (
        <li>
            <span className={block('filter-overview')}>
                <span className={block('filter-name')}>{hammer.format['ReadableField'](type)}</span>

                <span className={block('filter-count')}>{filters[type].length}</span>
            </span>

            <Button view="flat-secondary" size="m" onClick={handleShow}>
                {i18n('action_view')}
            </Button>

            <Modal
                onCancel={handleClose}
                content={modalContent}
                visible={visible}
                title={i18n('title_filters')}
                footer={false}
            />
        </li>
    );
}

const mapStateToProps = () => {
    const settings = unipika.prepareSettings();

    return {settings};
};

export default compose(withVisible, connect(mapStateToProps))(FilterOverview);
