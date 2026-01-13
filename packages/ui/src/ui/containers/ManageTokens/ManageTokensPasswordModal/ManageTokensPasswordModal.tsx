import * as React from 'react';
import {useSelector} from '../../../store/redux-hooks';
import {Alert} from '@gravity-ui/uikit';
import {DialogWrapper as Dialog} from '../../../components/DialogWrapper/DialogWrapper';
import {isCryptoSubtleAvailable} from '../../../utils/sha256';
import {createPasswordStrategy} from './password-strategies';
import {YTDFDialog, makeErrorFields} from '../../../components/Dialog';
import {getCurrentUserName, getSettingsCluster} from '../../../store/selectors/global';
import {YTError} from '../../../../@types/types';
import {isManageTokensInOAuthMode} from '../../../store/selectors/manage-tokens';
import {CryptoSubtleAlert} from './CryptoSubtleAlert';

interface ManageTokensPasswordModalContextValue {
    getPassword: () => Promise<string | undefined>;
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
                    sha256_password: string;
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
                        const {password, sha256_password} = data.getState().values;

                        const strategy = createPasswordStrategy(
                            username,
                            ytAuthCluster,
                            isCryptoSubtleAvailable(),
                        );

                        return strategy(sha256_password || password)
                            .then((hashedPassword) => {
                                props.handleConfirm(hashedPassword);
                            })
                            .catch(setError);
                    }}
                    fields={[
                        {
                            name: 'error-block',
                            type: 'block',
                            extras: {
                                children: isCryptoSubtleAvailable() ? (
                                    <Alert message="To access tokens management, you need enter your password" />
                                ) : (
                                    <CryptoSubtleAlert />
                                ),
                            },
                        },
                        {
                            name: 'password',
                            type: 'text',
                            required: true,
                            caption: 'Password',
                            extras: () => ({type: 'password'}),
                            visibilityCondition: {
                                when: '',
                                isActive: () => isCryptoSubtleAvailable(),
                            },
                        },
                        {
                            name: 'sha256_password',
                            type: 'text',
                            required: true,
                            caption: 'Password Hash (SHA-256)',
                            visibilityCondition: {
                                when: '',
                                isActive: () => !isCryptoSubtleAvailable(),
                            },
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
    const isOAuth = useSelector(isManageTokensInOAuthMode);
    const [visible, setVisible] = React.useState(false);
    const p = React.useRef(new PromiseWaiter<string>());
    const value = React.useMemo(() => {
        return {
            getPassword: () => {
                if (isOAuth) {
                    return Promise.resolve(undefined);
                }

                setVisible(true);

                return p.current.create();
            },
        };
    }, [setVisible, isOAuth]);

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
