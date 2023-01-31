import React from 'react';
import PropTypes from 'prop-types';

import {NoContent} from '../../components/NoContent/NoContent';

AccountsNoContent.propTypes = {
    hint: PropTypes.node.isRequired,
};

export default function AccountsNoContent({hint}) {
    return <NoContent hint={hint} warning="You don't have any selected accounts" />;
}
