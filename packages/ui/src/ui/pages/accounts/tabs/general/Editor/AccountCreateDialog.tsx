import cn from 'bem-cn-lite';
import React from 'react';
import {connect, ConnectedProps} from 'react-redux';

import Dialog, {DialogField, FormApi} from '../../../../../components/Dialog/Dialog';
import {closeCreateModal} from '../../../../../store/actions/accounts/editor';
import {loadEditedAccount} from '../../../../../store/actions/accounts/accounts';
import {createAccountFromInfo} from '../../../../../utils/accounts/editor';
import {getCluster, getCurrentUserName, isDeveloper} from '../../../../../store/selectors/global';
import {getActiveAccount} from '../../../../../store/selectors/accounts/accounts';
import {ROOT_ACCOUNT_NAME} from '../../../../../constants/accounts/accounts';

import './AccountCreateDialog.scss';
import {RootState} from '../../../../../store/reducers';
import {isIdmAclAvailable} from '../../../../../config';
import {isAbcAllowed} from '../../../../../UIFactory';

const block = cn('account-create-dialog');

interface FormValues {
    abcService?: {slug: string; id: number};
    account: string;
    parentAccount: string;
    responsibles: Array<unknown>;
    createHome: boolean;
}

function isRootAccount(account: string) {
    return account === 'root';
}

class AccountCreateDialog extends React.Component<ConnectedProps<typeof connector>> {
    render() {
        const {visible, newAccountInfo, activeAccount, currentUserName, isAdmin} = this.props;

        const {parentAccount, responsibles = []} = newAccountInfo;

        return (
            <Dialog<FormValues>
                className={block()}
                visible={visible}
                onClose={this.onClose}
                headerProps={{title: 'Create account'}}
                onAdd={this.onSubmit}
                pristineSubmittable
                initialValues={{
                    ...newAccountInfo,
                    parentAccount:
                        parentAccount || activeAccount || (isAdmin ? ROOT_ACCOUNT_NAME : undefined),
                    responsibles: responsibles.length
                        ? responsibles
                        : [{value: currentUserName, type: 'users'}],
                }}
                fields={[
                    ...((isAdmin && isAbcAllowed()
                        ? [
                              {
                                  name: 'abcService',
                                  type: 'abc-control',
                                  caption: 'Service in ABC',
                                  required: true,
                                  visibilityCondition: {
                                      when: 'parentAccount',
                                      isActive: isRootAccount,
                                  },
                                  extras: {
                                      placeholder: 'Enter ABC service name',
                                  },
                              },
                          ]
                        : []) as Array<DialogField>),
                    {
                        name: 'account',
                        type: 'text',
                        caption: 'Account name',
                        required: true,
                        extras: {
                            placeholder: 'Enter account name',
                            className: block('name'),
                        },
                    },
                    {
                        name: 'parentAccount',
                        type: 'accountsSuggest',
                        caption: 'Parent account',
                        required: true,
                        extras: {
                            placeholder: 'Enter parent account name',
                            allowRootAccount: isAdmin,
                        },
                    },
                    ...((isIdmAclAvailable()
                        ? [
                              {
                                  name: 'responsibles',
                                  type: 'acl-subjects',
                                  caption: 'Responsible users',
                                  required: true,
                                  extras: {
                                      placeholder: 'Enter name or login',
                                      allowedTypes: ['users'],
                                  },
                              },
                          ]
                        : []) as Array<DialogField>),
                    ...(isAdmin
                        ? [
                              {
                                  name: 'createHome',
                                  type: 'tumbler' as const,
                                  caption: 'Create home directory',
                              },
                          ]
                        : []),
                ]}
            />
        );
    }

    onSubmit = (form: FormApi<FormValues>) => {
        const {createAccountFromInfo, closeCreateModal, loadEditedAccount, cluster} = this.props;
        const newAccountInfo = form.getState().values;
        if (!isRootAccount(newAccountInfo.parentAccount)) {
            newAccountInfo.abcService = undefined;
        }

        return createAccountFromInfo(cluster, newAccountInfo).then(() => {
            closeCreateModal();
            const {account} = newAccountInfo;
            loadEditedAccount(account);
        });
    };

    onClose = (form: FormApi<FormValues>) => {
        this.props.closeCreateModal(form.getState().values);
    };
}

const mapStateToProps = (state: RootState) => {
    const {
        accounts: {editor},
    } = state;
    return {
        currentUserName: getCurrentUserName(state),
        activeAccount: getActiveAccount(state),
        visible: editor.createModalVisible,
        newAccountInfo: editor.newAccountInfo as FormValues,
        cluster: getCluster(state),
        isAdmin: isDeveloper(state),
    };
};

const mapDispatchToProps = {
    closeCreateModal,
    loadEditedAccount,
    createAccountFromInfo,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

export default connector(AccountCreateDialog);
