import React from 'react';
import PropTypes from 'prop-types';
import hammer from '../../../../common/hammer';
import {ResolveThunks, connect} from 'react-redux';

import Button from '../../../../components/Button/Button';

import {openAttributesModal} from '../../../../store/actions/modals/attributes-modal';

NodeCount.propTypes = {
    // from parent
    count: PropTypes.number.isRequired,
    className: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,

    // from connect
    openAttributesModal: PropTypes.func.isRequired,
};

type OwnProps = {
    count: number;
    className: string;
    id: string;
    name: string;
};

type DispatchProps = ResolveThunks<typeof mapDispatchToProps>;

type NodeCountProps = OwnProps & DispatchProps;

function NodeCount({id, name, count, className, openAttributesModal}: NodeCountProps) {
    const handleClick = () =>
        openAttributesModal({
            title: name,
            path: `//sys/cypress_shards/${id}`,
            attribute: 'account_statistics',
        });

    return (
        <div className={className}>
            {hammer.format['Number'](count)}
            <Button
                size="m"
                view="flat-secondary"
                onClick={handleClick}
                title="view account statistics"
            >
                View
            </Button>
        </div>
    );
}

const mapDispatchToProps = {openAttributesModal};

export default connect(null, mapDispatchToProps)(NodeCount);
