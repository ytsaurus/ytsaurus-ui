import React from 'react';
import block from 'bem-cn-lite';

import ElementsTableFooter from '../../../components/ElementsTable/ElementsTableFooter';

import {getDisplayName} from '../../../utils';
import {prepareTableClassName} from '../../../components/ElementsTable/utils';

import '../ElementsTable.scss';

export default (Component) => {
    return class WithStickyFooter extends React.Component {
        static displayName = `WithStickyFooter(${getDisplayName(Component)})`;

        static defaultProps = {
            size: 'm',
        };

        renderStickyFooter() {
            const bWrapper = block('elements-table-wrapper')({
                sticky: 'bottom',
            });
            const {footer} = this.props;

            return (
                <div className={bWrapper}>
                    <table className={prepareTableClassName(this.props)}>
                        <ElementsTableFooter {...this.props} footer={footer} />
                    </table>
                </div>
            );
        }

        render() {
            return (
                <React.Fragment>
                    <Component {...this.props} />
                    {this.props.footer && this.renderStickyFooter()}
                </React.Fragment>
            );
        }
    };
};
