import {FormApi, YTDFDialog, makeErrorFields} from '../../../components/Dialog';
import React from 'react';
import cn from 'bem-cn-lite';
import {connect} from 'react-redux';

import filter_ from 'lodash/filter';
import isEqual_ from 'lodash/isEqual';
import map_ from 'lodash/map';
import reduce_ from 'lodash/reduce';

import {closeUserEditorModal, fetchUsers, saveUserData} from '../../../store/actions/users';
import {isCryptoSubtleAvailable, sha256} from '../../../utils/sha256';
import {CryptoSubtleAlert} from '../../../containers/ManageTokens/ManageTokensPasswordModal/CryptoSubtleAlert';
import {
    getGlobalGroupAttributesMap,
    getUserManagementEnabled,
} from '../../../store/selectors/global';
import {getUsersPageEditableUser} from '../../../store/selectors/users';
import {flags} from '../../../utils';

import './UsersPageEditor.scss';
import {GroupsLoader} from '../../../hooks/global';
import {RootState} from '../../../store/reducers';
import {FIX_MY_TYPE, YTError} from '../../../types';
import {isIdmAclAvailable} from '../../../config';
import {createUser} from '../../../store/actions/users-typed';
import {disableUsersCache} from '../../../utils/users-groups';

const block = cn('users-page-editor');

interface Props {
    className?: string;
    showModal?: boolean;
    username: string;
    ban_message?: string;
    banned?: string | boolean;
    member_of?: Array<string>;
    comment?: string;
    idm?: boolean;
    read_request_rate_limit?: number;
    request_queue_size_limit?: number;
    write_request_rate_limit?: number;
    groupAttributesMap?: GroupAttributes;
    isUserManagementEnabled?: boolean;

    closeUserEditorModal: () => void;
    fetchUsers: () => void;
    saveUserData: (payload: {
        username: string;
        sha256Password?: string;
        newName: string;
        attributes: Partial<
            Pick<
                Props,
                Exclude<
                    Level2Keys,
                    | 'idm'
                    | 'name'
                    | 'groups'
                    | 'newGroups'
                    | 'password'
                    | 'passwordConfirm'
                    | 'sha256_password'
                >
            >
        >;
        groupsToAdd: Array<string>;
        groupsToRemove: Array<string>;
    }) => Promise<void>;
}

interface State {
    error?: YTError;
}

type GroupAttributes = Record<string, {upravlyator_managed: boolean}>;

interface FormValues {
    general: {
        idm: string;
        name: string;
        read_request_rate_limit: {value: number};
        request_queue_size_limit: {value: number};
        write_request_rate_limit: {value: number};
    };
    groups: {
        newGroups: Array<string>;
        groups: ReturnType<typeof UsersPageEditor.prepareCurrent>;
        comment: string;
    };
    ban: {
        banned?: string | boolean;
        ban_message?: string;
    };
    password: {
        password: string;
        passwordConfirm: string;
        sha256_password: string;
    };
}

type Level2Keys =
    | keyof FormValues['general']
    | keyof FormValues['groups']
    | keyof FormValues['ban']
    | keyof FormValues['password'];

class UsersPageEditor extends React.Component<Props, State> {
    static prepareGroups(groups: Array<string> = [], groupAttributes: GroupAttributes = {}) {
        return groups.map((title) => {
            const {[title]: group} = groupAttributes;
            return {
                title,
                // eslint-disable-next-line camelcase
                frozen: !flags.get(group?.upravlyator_managed),
            };
        });
    }

    static prepareCurrent(groups: Array<string> = [], groupAttributes: GroupAttributes = {}) {
        const current: {
            title: string;
            data: ReturnType<typeof UsersPageEditor.prepareGroups>;
        } = {
            title: 'Current',
            data: UsersPageEditor.prepareGroups(groups, groupAttributes),
        };
        return [current].filter(({data}) => data.length);
    }

    state: State = {};

    // eslint-disable-next-line react/sort-comp
    onAdd = async (form: FormApi<FormValues>) => {
        const {
            values: {general: generalTab, groups: groupsTab, ban: banTab, password: passwordTab},
        } = form.getState();

        let sha256Password: string | undefined;
        if (isCryptoSubtleAvailable()) {
            sha256Password = passwordTab.password ? await sha256(passwordTab.password) : undefined;
        } else {
            sha256Password = passwordTab.sha256_password || undefined;
        }

        const fields = {
            idm: generalTab.idm,
            read_request_rate_limit: generalTab.read_request_rate_limit.value,
            request_queue_size_limit: generalTab.request_queue_size_limit.value,
            write_request_rate_limit: generalTab.write_request_rate_limit.value,
            ...groupsTab,
            ...banTab,
        };

        const {idm: _idm, groups, newGroups, ...rest} = fields;
        const [current] = groups;
        const groupsToRemove = map_(filter_(current?.data, 'removed'), 'title');

        const changedFields = reduce_(
            rest,
            (acc, value, fieldName) => {
                if (!isEqual_(value, this.props[fieldName as keyof Props])) {
                    (acc as FIX_MY_TYPE)[fieldName] = value;
                }
                return acc;
            },
            {} as Partial<typeof fields>,
        );
        if (!changedFields['ban_message'] && !this.props['ban_message']) {
            // This is required because textarea returns empty string
            // even if it receives 'undefined' as input
            delete changedFields['ban_message'];
        }

        let username;
        let newName;

        if (this.isNewUser()) {
            username = generalTab.name;
            newName = username;

            try {
                await createUser({username});
            } catch (error: any) {
                this.setState({error});
                return Promise.reject(error);
            }
        } else {
            username = this.props.username;
            newName = generalTab.name;
        }

        return this.props
            .saveUserData({
                username,
                newName,
                attributes: changedFields,
                groupsToAdd: newGroups,
                groupsToRemove: groupsToRemove,
                sha256Password,
            })
            .then(() => {
                // we don't need to wait for the end of the action
                disableUsersCache();
                this.props.fetchUsers();
            })
            .catch((error) => {
                this.setState({error});
                return Promise.reject(error);
            });
    };

    onClose = () => {
        this.props.closeUserEditorModal();
    };

    isNewUser() {
        return !this.props.username;
    }

    render() {
        const {
            className,
            showModal,
            username,
            idm,
            banned,
            ban_message: banMessage,
            member_of: groups,
            read_request_rate_limit: rrrl,
            request_queue_size_limit: rqsl,
            write_request_rate_limit: wrrl,
            groupAttributesMap,
            isUserManagementEnabled,
        } = this.props;

        const errors = makeErrorFields([this.state.error]);

        return (
            <React.Fragment>
                <GroupsLoader />
                <YTDFDialog<FormValues>
                    className={block(null, className)}
                    headerProps={{
                        title: this.isNewUser() ? 'Create user' : `User ${username}`,
                    }}
                    size={'l'}
                    initialValues={{
                        general: {
                            idm: idm === undefined ? '' : String(idm),
                            name: username,
                            read_request_rate_limit: {value: rrrl || 1},
                            request_queue_size_limit: {value: rqsl || 1},
                            write_request_rate_limit: {value: wrrl || 1},
                        },
                        groups: {
                            newGroups: [],
                            groups: UsersPageEditor.prepareCurrent(groups, groupAttributesMap),
                            comment: '',
                        },
                        ban: {
                            banned: banned || false,
                            ban_message: banMessage,
                        },
                        password: {
                            password: '',
                            passwordConfirm: '',
                            sha256_password: '',
                        },
                    }}
                    onAdd={this.onAdd}
                    visible={Boolean(showModal)}
                    onClose={this.onClose}
                    fields={[
                        {
                            type: 'tab-vertical',
                            name: 'general',
                            title: 'General',
                            fields: [
                                ...(!isIdmAclAvailable()
                                    ? []
                                    : [
                                          {
                                              type: 'plain' as const,
                                              name: 'idm',
                                              caption: 'IDM',
                                          },
                                      ]),
                                ...(isUserManagementEnabled
                                    ? [
                                          {
                                              name: 'name',
                                              type: 'text' as const,
                                              required: true,
                                              caption: 'Name',
                                          },
                                      ]
                                    : []),
                                {
                                    type: 'number',
                                    name: 'request_queue_size_limit',
                                    caption: 'Request queue size limit',
                                    extras: {
                                        min: 1,
                                        hidePrettyValue: true,
                                    },
                                },
                                {
                                    type: 'number',
                                    name: 'read_request_rate_limit',
                                    caption: 'Read request rate limit',
                                    extras: {
                                        min: 1,
                                        hidePrettyValue: true,
                                    },
                                },
                                {
                                    type: 'number',
                                    name: 'write_request_rate_limit',
                                    caption: 'Write request rate limit',
                                    extras: {
                                        min: 1,
                                        hidePrettyValue: true,
                                    },
                                },
                                ...errors,
                            ],
                        },
                        ...(!isIdmAclAvailable()
                            ? []
                            : [
                                  {
                                      type: 'tab-vertical' as const,
                                      name: 'groups',
                                      title: 'Groups',
                                      fields: [
                                          {
                                              type: 'yt-group' as const,
                                              name: 'newGroups',
                                              caption: 'Groups',
                                              extras: {
                                                  multiple: true,
                                                  showTags: true,
                                                  disabled: !isIdmAclAvailable(),
                                                  maxVisibleValues: 3,
                                                  placeholder: 'Enter group name',
                                              },
                                          },
                                          {
                                              name: 'groups',
                                              type: 'multi-editable-lists' as const,
                                              caption: '',
                                              extras: {
                                                  titleClassName: block('list-title'),
                                              },
                                          },
                                          {
                                              name: 'comment',
                                              caption: 'Comment for IDM',
                                              type: 'textarea' as const,
                                              extras: {
                                                  disabled: !isIdmAclAvailable(),
                                              },
                                          },
                                          ...errors,
                                      ],
                                  },
                              ]),
                        {
                            type: 'tab-vertical',
                            name: 'ban',
                            title: 'Ban',
                            fields: [
                                {
                                    type: 'tumbler',
                                    name: 'banned',
                                    caption: 'Ban user',
                                },
                                {
                                    type: 'textarea',
                                    name: 'ban_message',
                                    caption: 'Ban message',
                                },
                                ...errors,
                            ],
                        },
                        ...(isUserManagementEnabled
                            ? [
                                  {
                                      type: 'tab-vertical' as const,
                                      name: 'password',
                                      title: 'Password',
                                      fields: [
                                          {
                                              name: 'crypto-alert',
                                              type: 'block' as const,
                                              extras: {
                                                  children: isCryptoSubtleAvailable() ? null : (
                                                      <CryptoSubtleAlert />
                                                  ),
                                              },
                                          },
                                          {
                                              name: 'password',
                                              type: 'text' as const,
                                              caption: 'New password',
                                              extras: () => ({type: 'password' as const}),
                                              visibilityCondition: {
                                                  when: '',
                                                  isActive: () => isCryptoSubtleAvailable(),
                                              },
                                          },
                                          {
                                              name: 'passwordConfirm',
                                              type: 'text' as const,
                                              caption: 'Confirm password',
                                              extras: () => ({type: 'password' as const}),
                                              visibilityCondition: {
                                                  when: '',
                                                  isActive: () => isCryptoSubtleAvailable(),
                                              },
                                          },
                                          {
                                              name: 'sha256_password',
                                              type: 'text' as const,
                                              caption: 'Password Hash (SHA-256)',
                                              visibilityCondition: {
                                                  when: '',
                                                  isActive: () => !isCryptoSubtleAvailable(),
                                              },
                                          },
                                          ...errors,
                                      ],
                                  },
                              ]
                            : []),
                    ]}
                    validate={({password}) => {
                        const passwordErrors: Partial<
                            Record<keyof typeof password, string | undefined>
                        > = {};

                        if (
                            isCryptoSubtleAvailable() &&
                            password.password !== password.passwordConfirm
                        ) {
                            passwordErrors.password = 'New and confirm password must be equal';
                        }

                        return {password: passwordErrors};
                    }}
                />
            </React.Fragment>
        );
    }
}

const mapStateToProps = (state: RootState) => {
    const {showModal, username, data: attrs} = getUsersPageEditableUser(state);
    const data = attrs && username === attrs.name ? attrs : {};
    return {
        showModal,
        username,
        ...data,
        groupAttributesMap: getGlobalGroupAttributesMap(state),
        isUserManagementEnabled: getUserManagementEnabled(state),
    };
};

const mapDispatchToProps = {
    closeUserEditorModal,
    saveUserData,
    fetchUsers,
};

export default connect(mapStateToProps, mapDispatchToProps)(UsersPageEditor);
