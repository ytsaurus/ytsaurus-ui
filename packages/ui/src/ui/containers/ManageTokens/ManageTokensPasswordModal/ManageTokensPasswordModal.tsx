import axios from 'axios';
import * as React from 'react';
import {useSelector} from 'react-redux';
import {Alert, Dialog} from '@gravity-ui/uikit';
import {sha256} from '../../../utils/sha256';
import {YTDFDialog, makeErrorFields} from '../../../components/Dialog/Dialog';
import {getCurrentUserName, getSettingsCluster} from '../../../store/selectors/global';
import {YTError} from '../../../../@types/types';

interface ManageTokensPasswordModalContextValue {
    getPassword: () => Promise<string>;
}
export const ManageTokensPasswordModalContext = React.createContext<
    undefined | ManageTokensPasswordModalContextValue
>(undefined);

interface PasswordModalProps {
    visible: boolean;
    handleCancel: () => void;
    handleConfirm: (hash: string) => void;
}

const PasswordModal = (props: PasswordModalProps) => {
    const [error, setError] = React.useState<YTError>();
    const username = useSelector(getCurrentUserName);
    const ytAuthCluster = useSelector(getSettingsCluster) ?? '';

    return (
        <>
            <Dialog open={props.visible} hasCloseButton={true} onClose={props.handleCancel}>
                <YTDFDialog<{
                    password: string;
                }>
                    headerProps={{
                        title: 'Authentication',
                    }}
                    pristineSubmittable
                    modal={false}
                    visible={true}
                    initialValues={{}}
                    onAdd={async (data) => {
                        setError(undefined);

                        const password = data.getState().values.password;

                        return sha256(password).then((password_sha256) => {
                            axios
                                .post(`/api/yt/${ytAuthCluster}/login`, {
                                    username,
                                    password,
                                })
                                .then(() => props.handleConfirm(password_sha256))
                                .catch((error) => setError(error?.response?.data || error));
                        });
                    }}
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
                            onClick: props.handleCancel,
                        },
                    }}
                />
            </Dialog>
        </>
    );
};

class PromiseWaiter<Data> {
    promise: Promise<Data> | undefined = undefined;
    resolve = (_d: Data) => {};
    reject = (_e?: Error) => {};

    create() {
        this.promise = new Promise<Data>((resolve, reject) => {
            this.resolve = (d) => {
                resolve(d);
                this.promise = undefined;
                this.resolve = () => {};
            };
            this.reject = (e) => {
                if (e) {
                    reject(e);
                }

                this.promise = undefined;
                this.reject = () => {};
            };
        });

        return this.promise;
    }
}

export function ManageTokensPasswordModalContextProvider({children}: {children: React.ReactChild}) {
    const [visible, setVisible] = React.useState(false);
    const p = React.useRef(new PromiseWaiter<string>());
    const value = React.useMemo(() => {
        return {
            getPassword: () => {
                setVisible(true);

                return p.current.create();
            },
        };
    }, [setVisible]);

    const handleCancel = () => {
        setVisible(false);

        p.current.reject(new Error('cancel password window'));
    };

    const handleConfirm = (hash: string) => {
        setVisible(false);

        p.current.resolve(hash);
    };

    return (
        <ManageTokensPasswordModalContext.Provider value={value}>
            {children}
            <PasswordModal
                visible={visible}
                handleCancel={handleCancel}
                handleConfirm={handleConfirm}
            />
        </ManageTokensPasswordModalContext.Provider>
    );
}

export function useManageTokensPasswordModalContext(): ManageTokensPasswordModalContextValue {
    const context = React.useContext(ManageTokensPasswordModalContext);

    if (!context) {
        throw new Error('Wrap your app into ManageTokensPasswordModalContextProvider');
    }

    return context;
}
