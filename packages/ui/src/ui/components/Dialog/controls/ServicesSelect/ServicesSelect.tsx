import React from 'react';
import {useSelector} from '../../../../store/redux-hooks';
import {Button, Flex, Select, Text} from '@gravity-ui/uikit';
import {Plus} from '@gravity-ui/icons';

import map_ from 'lodash/map';

import {getClusterUiConfig} from '../../../../store/selectors/global';

import {DialogControlProps} from '../../Dialog.types';

import {useBunldesList} from './use-bundles-list';
import {useCliquesList} from './use-cliques-list';
import {useActions} from './use-actions';

import i18n from './i18n';

export type ServicePair = {
    service: string;
    item: string;
};

type Props = DialogControlProps<ServicePair[]> & {
    disabled?: boolean;
};

export function ServicesSelect(props: Props) {
    const {value = [{service: '', item: ''}], onChange, disabled} = props;

    const chytAllowed = useSelector(getClusterUiConfig).chyt_controller_base_url;

    const serviceTypeOptions: {value: 'chyt' | 'bundle'; content: 'CHYT' | 'Bundle'}[] = [
        {value: 'bundle', content: 'Bundle'},
    ];

    if (chytAllowed) {
        serviceTypeOptions.push({value: 'chyt', content: 'CHYT'});
    }

    const {bundles, isBundlesLoading} = useBunldesList();

    const {cliques, isCliquesLoading} = useCliquesList();

    const {addPair, removePair, updateItem, updateService} = useActions(value, onChange);

    const makeItemsOptions = (pair: Partial<ServicePair>) => {
        if (!pair.service) return [];

        const currentService = pair.service === 'chyt' ? cliques : bundles;

        return map_(currentService, (item) => ({value: item, content: item}));
    };

    const isItemsListLoading = (pair: Partial<ServicePair>) => {
        if (!pair.service) {
            return false;
        }

        return pair.service === 'chyt' ? isCliquesLoading : isBundlesLoading;
    };

    const makeItemPlaceholder = (pair: Partial<ServicePair>) => {
        if (!pair.service) {
            return i18n('field_select-item');
        }

        return pair.service === 'chyt' ? i18n('field_select-clique') : i18n('field_select-bundle');
    };

    return (
        <>
            {serviceTypeOptions.length ? (
                <Flex direction={'column'} gap={2}>
                    {value.map((pair, index) => (
                        <Flex key={index} gap={2}>
                            <Select
                                options={serviceTypeOptions}
                                onUpdate={(newValue) => updateService(index, newValue[0])}
                                popupWidth={'fit'}
                                value={[pair.service]}
                                hasClear
                                width={'max'}
                                disabled={disabled}
                                placeholder={i18n('field_select-service')}
                            />
                            <Select
                                onUpdate={(newValue) => updateItem(index, newValue[0])}
                                width={'max'}
                                hasClear
                                filterable
                                value={[pair.item]}
                                options={makeItemsOptions(pair)}
                                loading={isItemsListLoading(pair)}
                                disabled={disabled || !pair.service}
                                placeholder={makeItemPlaceholder(pair)}
                            />
                            {value.length > 1 && (
                                <Button
                                    view="flat"
                                    onClick={() => removePair(index)}
                                    disabled={disabled}
                                >
                                    {i18n('action_remove')}
                                </Button>
                            )}
                        </Flex>
                    ))}
                    {Boolean(value.length) &&
                        value[value.length - 1]?.service &&
                        value[value.length - 1]?.item && (
                            <Flex>
                                <Button size={'m'} onClick={addPair} disabled={disabled}>
                                    <Flex alignItems={'center'} gap={2}>
                                        <Plus />
                                        {i18n('action_add-service')}
                                    </Flex>
                                </Button>
                            </Flex>
                        )}
                </Flex>
            ) : (
                <Text color={'danger'} variant={'body-2'}>
                    {i18n('alert_no-services-available')}
                </Text>
            )}
        </>
    );
}

ServicesSelect.isEmpty = (value: ServicePair[]) => {
    return !value;
};

ServicesSelect.getDefaultValue = (): ServicePair[] => {
    return [{service: '', item: ''}];
};

ServicesSelect.validate = (value: ServicePair[]) => {
    if (!value.length) return;
    if (value[value.length - 1]?.service && !value[value.length - 1]?.item) {
        const {service} = value[value.length - 1];
        return service === 'chyt'
            ? i18n('alert_clique-option-required')
            : i18n('alert_bundle-option-required');
    }
    return;
};
