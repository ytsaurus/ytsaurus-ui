import React from 'react';
import {ConnectedProps, connect} from 'react-redux';
import PropTypes from 'prop-types';
import block from 'bem-cn-lite';

import {setAccountAbc} from '../../../../../../utils/accounts/editor';
import {
    loadEditedAccount,
    setParentAccountAction,
} from '../../../../../../store/actions/accounts/accounts';
import {getCluster} from '../../../../../../store/selectors/global';
import {isDeveloper} from '../../../../../../store/selectors/global/is-developer';
import {SuggestParentsForEditableAccount} from '../../../../AccountsSuggest';

import './../Editor.scss';
import UIFactory from '../../../../../../UIFactory';
import {RootState} from '../../../../../../store/reducers';
import {AccountParsedData} from '../../../../../../utils/accounts/accounts-selector';

const b = block('accounts-editor');

export function WithHeader({
    header,
    children,
}: {
    header: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <div className={b(null, 'elements-section')}>
            <div className={b(null, 'elements-heading_size_s')}>{header}</div>
            {children}
        </div>
    );
}

WithHeader.propTypes = {
    header: PropTypes.string.isRequired,
    children: PropTypes.object.isRequired,
};

interface ParentProps {
    account: AccountParsedData;
}

type ReduxProps = ConnectedProps<typeof connector>;

type Props = ParentProps & ReduxProps;

class GeneralContent extends React.Component<Props> {
    static propTypes = {
        //from parent
        account: PropTypes.object.isRequired,
        //from connect
        loadEditedAccount: PropTypes.func.isRequired,
        setAccountParent: PropTypes.func.isRequired,
        cluster: PropTypes.string.isRequired,
        isDeveloper: PropTypes.bool,
    };

    state = {
        abcId: undefined,
        abcTitle: '',
        // We have to use this property as 'key' of StaffSuggestControl to recreate the component,
        // else it will not clear his internal state.
        responsibleKey: 0,
    };

    onParentChange = (parentName = '', {isOutsideClick}: {isOutsideClick?: boolean} = {}) => {
        if (isOutsideClick) {
            this.forceUpdate();
            return;
        }

        const {
            account: {name, parent},
            setAccountParent,
        } = this.props;
        if (parent === parentName) {
            return;
        }
        return setAccountParent(name, parentName);
    };

    renderParentAccount(value = '') {
        const {isDeveloper} = this.props;
        return (
            <WithHeader header="Parent">
                <SuggestParentsForEditableAccount
                    value={value}
                    onChange={this.onParentChange}
                    disabled={!isDeveloper}
                    allowRootAccount={true}
                />
            </WithHeader>
        );
    }

    renderAbcServiceId() {
        const {
            account: {
                abc: {id, slug},
            },
            isDeveloper,
        } = this.props;

        const control = UIFactory.renderControlAbcService({
            value: {id, slug},
            onChange: this.onAbcServiceChanged,
            placeholder: 'Select ABC service...',
            disabled: !isDeveloper,
        });

        return !control ? null : <WithHeader header="ABC Service">{control}</WithHeader>;
    }

    onAbcServiceChanged = async (
        service?: AccountParsedData['abc'],
        {isOutsideClick}: {isOutsideClick?: boolean} = {},
    ) => {
        if (isOutsideClick) {
            this.forceUpdate();
            return;
        }

        const {id: abcServiceId, slug: value} = service ?? {};
        const {
            account: {name, abc: {slug, id} = {}},
            loadEditedAccount,
        } = this.props;
        if (abcServiceId === id && slug === value) {
            return;
        }
        await setAccountAbc(name, abcServiceId, value);
        loadEditedAccount(name);
    };

    render() {
        const {
            account: {parent},
        } = this.props;

        return (
            <React.Fragment>
                {this.renderAbcServiceId()}
                {this.renderParentAccount(parent)}
            </React.Fragment>
        );
    }
}

const mapStateToProps = (state: RootState) => {
    return {
        cluster: getCluster(state),
        isDeveloper: isDeveloper(state),
    };
};

const mapDispatchToProps = {
    loadEditedAccount,
    setAccountParent: setParentAccountAction,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

export default connector(GeneralContent);
