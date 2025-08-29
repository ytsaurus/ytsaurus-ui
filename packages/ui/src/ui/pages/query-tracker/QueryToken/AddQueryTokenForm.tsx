import React, {FC, ReactElement, useReducer} from 'react';
import {Button, Flex, Select, TextInput} from '@gravity-ui/uikit';
import './AddQueryTokenForm.scss';
import cn from 'bem-cn-lite';
import {useDispatch, useSelector} from 'react-redux';
import {getClusterList} from '../../../store/selectors/slideoutMenu';
import {
    QueryClusterItem,
    Props as QueryClusterItemProps,
} from '../QueryTrackerTopRow/QueryClusterSelector/QueryClusterItem';
import {QuerySelector} from '../QueryTrackerTopRow/QuerySelector';
import {initialState, tokenFormReducer} from './AddQueryTokenForm.reducer';
import {appendQueryToken} from '../../../store/actions/settings/settings';
import {validateToken} from './helpers/validateToken';
import {getQueryTokens} from '../../../store/selectors/settings/settings-queries';

const block = cn('yq-add-query-token-form');

export const AddQueryTokenForm: FC = () => {
    const reduxDispatch = useDispatch();
    const [state, dispatch] = useReducer(tokenFormReducer, initialState);
    const {token, errors, loading} = state;

    const clusters = useSelector(getClusterList);
    const tokens = useSelector(getQueryTokens);

    const handleNameChange = (value: string) => {
        dispatch({type: 'SET_NAME', payload: value});
    };

    const handleClusterChange = (value: string) => {
        dispatch({type: 'SET_CLUSTER', payload: value});
    };

    const handlePathChange = (value: string) => {
        dispatch({type: 'SET_PATH', payload: value});
    };

    const handleSubmit = async () => {
        dispatch({type: 'SET_LOADING', payload: true});
        const {valid, errors: validationErrors} = await validateToken(token, tokens);

        if (!valid) {
            dispatch({type: 'SET_ERRORS', payload: validationErrors});
            dispatch({type: 'SET_LOADING', payload: false});
            return;
        }

        reduxDispatch(
            appendQueryToken({
                name: token.name,
                path: token.path,
                cluster: token.cluster,
            }),
        );
        dispatch({type: 'RESET_FORM'});
    };

    return (
        <Flex className={block()} direction="column" gap={2}>
            <div className={block('top-row')}>
                <TextInput
                    placeholder="Token name"
                    value={token.name}
                    validationState={errors.name ? 'invalid' : undefined}
                    errorMessage={errors.name}
                    onUpdate={handleNameChange}
                />
                <QuerySelector
                    placeholder="Cluster"
                    filterPlaceholder="Search"
                    items={clusters}
                    onChange={handleClusterChange}
                    value={token.cluster}
                    getOptionHeight={() => 52}
                    popupWidth={200}
                    validationState={errors.cluster ? 'invalid' : undefined}
                    errorMessage={errors.cluster}
                    renderSelectedOption={(option) => {
                        const {name} = (option.children as ReactElement<QueryClusterItemProps>)
                            .props;
                        return <>{name}</>;
                    }}
                >
                    {(items) =>
                        items.map(({id, name, environment}) => (
                            <Select.Option key={id} value={id}>
                                <QueryClusterItem id={id} name={name} environment={environment} />
                            </Select.Option>
                        ))
                    }
                </QuerySelector>
            </div>
            <TextInput
                placeholder="Path to token file"
                value={token.path}
                validationState={errors.path ? 'invalid' : undefined}
                errorMessage={errors.path}
                onUpdate={handlePathChange}
            />
            <Button view="action" onClick={handleSubmit} loading={loading}>
                Add token
            </Button>
        </Flex>
    );
};
