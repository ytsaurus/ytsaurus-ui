import React from 'react';
import PropTypes from 'prop-types';

import i18n from '../i18n';

import Icon from '../../../../../../components/Icon/Icon';
import Button from '../../../../../../components/Button/Button';
import {Secondary} from '@ytsaurus/components';
import ColumnsPresetButton from '../ColumnsPresetButton';
import {getConfigData} from '../../../../../../config/ui-settings';

ColumnSelectorButtonBase.propTypes = {
    // from parent
    block: PropTypes.func.isRequired,

    // from connect
    visibleColumns: PropTypes.array.isRequired,
    allColumns: PropTypes.array.isRequired,
    loading: PropTypes.bool.isRequired,

    openColumnSelectorModal: PropTypes.func.isRequired,
};

const actionStyle = {marginRight: 1};

interface Props {
    loading?: boolean;
    isStrict?: boolean;
    allColumns: Array<unknown>;
    visibleColumns: Array<unknown>;
    openColumnSelectorModal: () => void;
}

export function ColumnSelectorButtonBase({
    loading,
    isStrict,
    allColumns,
    visibleColumns,
    openColumnSelectorModal,
}: Props) {
    const allowPickColumns = !loading || isStrict;
    const showAllColumns = allColumns.length === visibleColumns.length;
    const view = showAllColumns ? 'outlined' : 'action';

    const {allowUserColumnPresets} = getConfigData();
    return (
        <React.Fragment>
            <Button
                size="m"
                disabled={!allowPickColumns}
                title={i18n('context_choose-columns')}
                onClick={openColumnSelectorModal}
                view={view}
                pin={allowUserColumnPresets ? 'round-brick' : 'round-round'}
                style={showAllColumns ? undefined : actionStyle}
                qa="table-columns-button"
            >
                <Icon awesome="filter" face="solid" size={13} />
                {i18n('action_columns')}
                <Secondary disabled={!showAllColumns}>
                    {' '}
                    {visibleColumns.length + '/' + allColumns.length}
                </Secondary>
            </Button>
            {allowUserColumnPresets && (
                <ColumnsPresetButton view={view} disabled={!allowPickColumns} />
            )}
        </React.Fragment>
    );
}
