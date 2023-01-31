import React from 'react';
import {compose} from 'redux';

import withStickyHead from '../../components/ElementsTable/hocs/withStickyHead';
import withStickyFooter from '../../components/ElementsTable/hocs/withStickyFooter';
import ElementsTableBase from '../../components/ElementsTable/ElementsTable';

const ElementsTable = compose(withStickyHead, withStickyFooter)(ElementsTableBase);

function ElementsTableSticky(props) {
    return <ElementsTable {...props} />;
}

export default ElementsTableSticky;
