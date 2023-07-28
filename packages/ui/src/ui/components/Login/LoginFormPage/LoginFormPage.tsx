import React, {useCallback, useState} from 'react';
import axios, {AxiosError} from 'axios';
import {useDispatch} from 'react-redux';
import {Button, Text, TextInput} from '@gravity-ui/uikit';
import {onSuccessLogin} from '../../../store/actions/global';
import ytLocalStorage from '../../../utils/yt-local-storage';
import LoginPageWrapper from '../LoginPageWrapper/LoginPageWrapper';
import _ from 'lodash';

import cn from 'bem-cn-lite';
import {OauthConfig} from '../../../../shared/yt-types';

const block = cn('login-page');

interface ErrorFields {
    username?: string;
    password?: string;
    response?: string;
}

interface Props {
    theme?: 'light' | 'dark';
}

const validate = ({
    username,
    password,
}: Record<keyof Omit<ErrorFields, 'response'>, string>): ErrorFields => {
    const result: ErrorFields = {};
    if (username === '') {
        result.username = 'Username must not be empty';
    }

    if (password === '') {
        result.password = 'Password must not be empty';
    }

    return result;
};

async function getOauthConfig(): Promise<OauthConfig & {enabled: boolean}> {
    return (await axios.get('/api/oauth/config')).data;
}

function LoginForm({theme}: Props) {
    const dispatch = useDispatch();
    const [username, setUsername] = useState(ytLocalStorage.get('loginDialog')?.username || '');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState<boolean>(false);
    const [errors, setErrors] = React.useState<ErrorFields>({});

    const handleFormSubmit = useCallback(
        (e: React.FormEvent) => {
            e.preventDefault();
            setErrors({});
            const validationErrors = validate({username, password});
            if (!_.isEmpty(validationErrors)) {
                setErrors(validationErrors);
                return;
            }
            setLoading(true);
            authorize({username, password})
                .then(async () => {
                    ytLocalStorage.set('loginDialog', {username});
                    dispatch(onSuccessLogin(username));
                })
                .catch((error: AxiosError<Error>) => {
                    if (error.response && error.response.data && error.response.data.message) {
                        setErrors({
                            response: error.response.data.message,
                        });
                    } else {
                        setErrors({response: error.message});
                    }
                })
                .finally(() => {
                    setLoading(false);
                });
        },
        [username, password, dispatch],
    );

    const [oauthConfig, setOauthConfig] = useState<OauthConfig & {enabled: boolean}>();

    React.useEffect(() => {
        getOauthConfig()
            .then((config) => {
                console.error('Fetching oauth config');
                setOauthConfig(config);
            })
            .catch((error) => {
                console.error('Error fetching oauth config:', error);
            });
    }, []);

    return (
        <>
            <h1 className={block('title')}>Welcome to YTsaurus!</h1>
            <p className={block('text')}>
                Single scalable platform for high volume storage and handling data. Login to your
                account.
            </p>
            <form onSubmit={handleFormSubmit}>
                <TextInput
                    className={block('field')}
                    type="text"
                    size="l"
                    placeholder="Login"
                    name="username"
                    value={username}
                    onUpdate={setUsername}
                    error={errors.username}
                />
                <TextInput
                    className={block('field', {password: true})}
                    type="password"
                    size="l"
                    placeholder="Password"
                    name="password"
                    value={password}
                    onUpdate={setPassword}
                    error={errors.password}
                />
                <Button
                    className={block('button', {solid: true})}
                    type="submit"
                    width="max"
                    size="l"
                    pin="circle-circle"
                    view={theme === 'light' ? 'action' : 'normal-contrast'}
                    loading={loading}
                >
                    Login
                </Button>
                {errors.response && (
                    <Text as="p" color="danger" className={block('error')}>
                        {errors.response}
                    </Text>
                )}
            </form>
            {oauthConfig?.enabled && (
                <Button
                    className={block('button', {solid: true})}
                    type="button"
                    width="max"
                    size="l"
                    pin="circle-circle"
                    view={theme === 'light' ? 'action' : 'normal-contrast'}
                    style={{marginTop: '15px'}}
                    onClick={() => {
                        const query = {
                            client_id: oauthConfig.clientId,
                            state: '123',
                            response_type: 'code',
                            scope: 'user_info',
                            redirect_uri: `${window.location.protocol}//${window.location.hostname}/api/oauth/callback`,
                        };
                        const params = new URLSearchParams(query);
                        window.location.href = `${oauthConfig.authorizeUrl}?${params.toString()}`;
                    }}
                >
                    {`Login with ${oauthConfig.name}`}
                    <img
                        src={oauthConfig.imageUrl}
                        style={{height: '25px', verticalAlign: 'middle', marginLeft: '10px'}}
                    />
                </Button>
            )}
        </>
    );
}

function authorize({username, password}: {username: string; password: string}) {
    return axios.post(`/api/yt/login`, {
        username,
        password,
    });
}

export function LoginFormPage({theme}: Props) {
    return (
        <LoginPageWrapper theme={theme}>
            <LoginForm theme={theme} />
        </LoginPageWrapper>
    );
}
