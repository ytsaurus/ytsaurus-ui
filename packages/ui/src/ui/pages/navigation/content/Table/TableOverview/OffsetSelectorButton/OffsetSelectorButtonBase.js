import React from 'react';
import PropTypes from 'prop-types';

import Icon from '../../../../../../components/Icon/Icon';
import Button from '../../../../../../components/Button/Button';

import i18n from '../i18n';

OffsetSelectorButtonBase.propTypes = {
    // from parent
    disabled: PropTypes.bool,

    // from connect
    visibleColumns: PropTypes.array.isRequired,
    allColumns: PropTypes.array.isRequired,
    loading: PropTypes.bool.isRequired,

    openOffsetSelectorModal: PropTypes.func.isRequired,
};

export function OffsetSelectorButtonBase({
    loading,
    disabled,
    allColumns,
    visibleColumns,
    openOffsetSelectorModal,
}) {
    return (
        <Button
            size="m"
            disabled={loading || disabled}
            title={i18n('title_edit-offset')}
            onClick={openOffsetSelectorModal}
            pin="round-clear"
        >
            <Icon awesome="key" />
            &nbsp; {i18n('action_keys')} &nbsp;
            <span className="elements-secondary-text">
                {visibleColumns.length + '/' + allColumns.length}
            </span>
        </Button>
    );
}
