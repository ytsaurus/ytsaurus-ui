import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {compose} from 'redux';
import block from 'bem-cn-lite';

import ElementsTableHeader from '../../../components/ElementsTable/ElementsTableHeader';

import {toggleColumnSortOrder} from '../../../store/actions/tables';
import {getDisplayName} from '../../../utils';
import {prepareTableClassName} from '../../../components/ElementsTable/utils';
import {HEADER_HEIGHT} from '../../../constants/index';

import '../ElementsTable.scss';

const withStickyHead = (Component) => {
    return class WithStickyHead extends React.Component {
        static displayName = `WithStickyHead(${getDisplayName(Component)})`;

        static propTypes = {
            top: PropTypes.number,
        };

        static defaultProps = {
            templates: {},
            size: 'm',
            theme: 'bordered',
            padded: false,
            striped: true,
            top: HEADER_HEIGHT,
        };

        renderStickyHead() {
            const {top} = this.props;
            const bWrapper = block('elements-table-wrapper')({sticky: 'top'});

            return (
                <div className={bWrapper} style={{top}}>
                    <table className={prepareTableClassName(this.props)}>
                        <ElementsTableHeader {...this.props} />
                    </table>
                </div>
            );
        }

        render() {
            return (
                <React.Fragment>
                    {this.renderStickyHead()}
                    <Component {...this.props} />
                </React.Fragment>
            );
        }
    };
};

const mapStateToProps = ({tables}) => {
    return {sortState: tables};
};

const mapDispatchToProps = {
    toggleColumnSortOrder,
};

const composedWithStickyHead = compose(
    connect(mapStateToProps, mapDispatchToProps),
    withStickyHead,
);

export default composedWithStickyHead;
