import React from 'react';
import PropTypes from 'prop-types';

import {NoContent} from '../../components/NoContent';
import i18n from './i18n';

AccountsNoContent.propTypes = {
    hint: PropTypes.node.isRequired,
};

export default function AccountsNoContent({hint}) {
    return <NoContent hint={hint} warning={i18n('alert_no-selected-accounts')} />;
}
