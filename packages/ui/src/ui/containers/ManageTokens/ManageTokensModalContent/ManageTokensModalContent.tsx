import cn from 'bem-cn-lite';
import moment from 'moment';
import * as React from 'react';
import {FC, useMemo, useState} from 'react';
import {Alert, Button} from '@gravity-ui/uikit';
import {FormApi} from '@gravity-ui/dialog-fields';
import truncate from 'lodash/truncate';
import Modal from '../../../components/Modal/Modal';
import {YTDFDialog, makeErrorFields} from '../../../components/Dialog/Dialog';
import {
    closeManageTokensModal,
    manageTokensCreateToken,
    manageTokensGetList,
    manageTokensRevokeToken,
} from '../../../store/actions/manage-tokens';
import {useThunkDispatch} from '../../../store/thunkDispatch';
import {useSelector} from 'react-redux';
import {AuthenticationToken, manageTokensSelector} from '../../../store/selectors/manage-tokens';
import {getCurrentUserName} from '../../../store/selectors/global';
import Icon from '../../../components/Icon/Icon';
import {YTError} from '../../../../@types/types';
import ClipboardButton from '../../../components/ClipboardButton/ClipboardButton';
import DataTableYT from '../../../components/DataTableYT/DataTableYT';
import {sha256} from '../../../utils/sha256';
import {
    ManageTokensPasswordModalContextProvider,
    useManageTokensPasswordModalContext,
} from '../ManageTokensPasswordModal/ManageTokensPasswordModal';
import {CollapsedString} from '../../../components/CollapsedString';

import './ManageTokensModalContent.scss';

const block = cn('manage-tokens-modal-content');

const AuthenticationGenerateTokenFormSection: FC<{onClose: () => void}> = ({onClose}) => {
    type FormData = {description: string};
    const {getPassword} = useManageTokensPasswordModalContext();
    const user = useSelector(getCurrentUserName);
    const dispatch = useThunkDispatch();
    const [error, setError] = useState<YTError>();
    const [token, setToken] = useState<string>();

    const handleSubmit = (form: FormApi<FormData>) => {
        const {description} = form.getState().values;

        setError(undefined);

        return getPassword()
            .then((password_sha256) => {
                return dispatch(
                    manageTokensCreateToken({
                        description,
                        credentials: {
                            user,
                            password_sha256,
                        },
                    }),
                )
                    .then((token) => {
                        setToken(token);

                        return dispatch(
                            manageTokensGetList({
                                user,
                                password_sha256,
                            }),
                        )
                            .then(() => undefined)
                            .catch(() => undefined);
                    })
                    .catch((error) => {
                        setError(error);

                        return Promise.reject(error);
                    });
            })
            .catch((error) => {
                throw error;
            });
    };

    if (token) {
        return (
            <div className={block('new-token')}>
                <h2>Copy token value</h2>
                <Alert
                    theme="warning"
                    message="Please save the token value. It is impossible to get the token value after closing the dialog"
                />
                <br />
                <Alert
                    message={token}
                    layout="horizontal"
                    actions={<ClipboardButton text={token} />}
                />
                <div className={block('tokens-action')}>
                    <Button
                        size="l"
                        view="action"
                        onClick={() => {
                            onClose();
                        }}
                    >
                        Close
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <YTDFDialog<FormData>
            headerProps={{
                title: 'Generate token',
            }}
            pristineSubmittable
            modal={false}
            visible={true}
            initialValues={{}}
            onAdd={handleSubmit}
            fields={[
                {
                    name: 'description',
                    type: 'textarea',
                    caption: 'Description',
                },
                ...makeErrorFields([error]),
            ]}
            footerProps={{
                propsButtonCancel: {
                    onClick: () => {
                        onClose();
                    },
                },
            }}
        />
    );
};

const AuthenticationPasswordSection: FC<{onSuccess: () => void}> = ({onSuccess}) => {
    const [error, setError] = useState<YTError>();
    type FormData = {password: string};
    const dispatch = useThunkDispatch();
    const user = useSelector(getCurrentUserName);
    const handleSubmit = async (form: FormApi<FormData>) => {
        const values = form.getState().values;

        setError(undefined);

        await sha256(values.password).then((password_sha256) => {
            return dispatch(
                manageTokensGetList({
                    user,
                    password_sha256,
                }),
            )
                .then(() => {
                    onSuccess();
                })
                .catch((error) => setError(error?.response?.data || error));
        });
    };

    return (
        <YTDFDialog<FormData>
            headerProps={{
                title: 'Authentication',
            }}
            pristineSubmittable
            modal={false}
            visible={true}
            initialValues={{}}
            onAdd={handleSubmit}
            fields={[
                {
                    name: 'error-block',
                    type: 'block',
                    extras: {
                        children: (
                            <Alert message="To access tokens management, you need enter your password" />
                        ),
                    },
                },
                {
                    name: 'password',
                    type: 'text',
                    required: true,
                    caption: 'Password',
                    extras: () => ({type: 'password'}),
                },
                ...makeErrorFields([error]),
            ]}
            footerProps={{
                propsButtonCancel: {
                    onClick: () => {
                        dispatch(closeManageTokensModal());
                    },
                },
            }}
        />
    );
};

const RevokeToken = (props: {handleClickRemoveToken: (index: number) => void; index: number}) => {
    const [visible, setVisible] = useState(false);

    const handleClick = () => {
        setVisible(true);
    };

    const handleConfirm = () => {
        props.handleClickRemoveToken(props.index);

        setVisible(false);
    };

    const handleCancel = () => {
        setVisible(false);
    };

    return (
        <>
            <Button size={'s'} onClick={handleClick}>
                <Icon awesome={'trash-bin'} />
            </Button>
            <Modal
                content="Are you sure you want to revoke the token? This action CANNOT be undone."
                onCancel={handleCancel}
                onConfirm={handleConfirm}
                onOutsideClick={handleCancel}
                visible={visible}
            />
        </>
    );
};

const AuthenticationTokensSection: FC<{
    onClickGenerateTokenButton: () => void;
    onSuccessRemove: () => void;
}> = ({onSuccessRemove, onClickGenerateTokenButton}) => {
    const {getPassword} = useManageTokensPasswordModalContext();
    const dispatch = useThunkDispatch();
    const tokens = useSelector(manageTokensSelector)!;
    const user = useSelector(getCurrentUserName);

    const handleClickRemoveToken = React.useCallback(
        (index: number) => {
            return getPassword().then((password_sha256) => {
                return dispatch(
                    manageTokensRevokeToken({
                        credentials: {
                            user,
                            password_sha256,
                        },
                        token_sha256: tokens![index].tokenHash,
                    }),
                ).then(() => {
                    return dispatch(
                        manageTokensGetList({
                            user,
                            password_sha256,
                        }),
                    ).finally(() => onSuccessRemove());
                });
            });
        },
        [getPassword, user, onSuccessRemove, tokens, manageTokensRevokeToken, dispatch],
    );

    return (
        <div className={block('tokens')}>
            <h2>Authentication Tokens</h2>
            <div className={block('generate-token-button')}>
                <Button size="l" view="action" onClick={() => onClickGenerateTokenButton()}>
                    Generate token
                </Button>
            </div>
            <div className={block('tokens-table')}>
                <DataTableYT<AuthenticationToken>
                    loaded
                    useThemeYT
                    data={tokens}
                    noItemsText="No tokens found"
                    rowClassName={() => block('table-row')}
                    columns={[
                        {
                            name: 'tokenPrefix',
                            header: 'Token',
                            width: 110,
                            className: block('table-cell'),
                            render: ({value}) => {
                                return `${String(value)}...`;
                            },
                        },
                        {
                            name: 'tokenHash',
                            header: 'Token Hash',
                            width: 110,
                            className: block('table-cell', {name: 'hash'}),
                            render: ({value}) => {
                                return truncate(String(value), {length: 12});
                            },
                        },
                        {
                            name: 'description',
                            header: 'Description',
                            width: 320,
                            className: block('table-cell', {name: 'description'}),
                            render(value) {
                                if (value.value) {
                                    return (
                                        <CollapsedString
                                            limit={100}
                                            value={value.value as string}
                                        />
                                    );
                                }

                                return '';
                            },
                        },
                        {
                            name: 'creationTime',
                            header: 'Issued At',
                            width: 160,
                            className: block('table-cell'),
                            render: (value) => {
                                return value.value
                                    ? moment(value.value).format('DD/MM/YYYY hh:mm:ss')
                                    : '';
                            },
                        },
                        {
                            name: '',
                            width: 30,
                            className: block('table-cell'),
                            render: ({index}) => (
                                <RevokeToken
                                    index={index}
                                    handleClickRemoveToken={handleClickRemoveToken}
                                />
                            ),
                        },
                    ]}
                    settings={{
                        stickyHead: 'moving',
                        displayIndices: false,
                        sortable: false,
                        highlightRows: false,
                        stripedRows: false,
                        disableSortReset: true,
                    }}
                />
            </div>
        </div>
    );
};

enum ViewSection {
    default,
    tokens,
    generate,
}

const useViewSectionState = () => {
    const [section, setSection] = useState<ViewSection>(ViewSection.default);

    return {section, setSection};
};

export const ManageTokensModalContent = () => {
    const {section, setSection} = useViewSectionState();

    const content = useMemo(() => {
        switch (section) {
            case ViewSection.default:
                return (
                    <AuthenticationPasswordSection
                        onSuccess={() => setSection(ViewSection.tokens)}
                    />
                );
            case ViewSection.tokens:
                return (
                    <AuthenticationTokensSection
                        onSuccessRemove={() => setSection(ViewSection.tokens)}
                        onClickGenerateTokenButton={() => setSection(ViewSection.generate)}
                    />
                );
            case ViewSection.generate:
                return (
                    <AuthenticationGenerateTokenFormSection
                        onClose={() => setSection(ViewSection.tokens)}
                    />
                );
            default:
                return null;
        }
    }, [section]);

    return (
        <ManageTokensPasswordModalContextProvider>
            <div className={block('content')}>{content}</div>
        </ManageTokensPasswordModalContextProvider>
    );
};
