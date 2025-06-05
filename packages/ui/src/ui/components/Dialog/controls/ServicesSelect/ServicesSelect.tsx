import React from 'react';
import {useSelector} from 'react-redux';
import {Button, Flex, Select, Text} from '@gravity-ui/uikit';
import {Plus} from '@gravity-ui/icons';

import map_ from 'lodash/map';

import {useFetchBatchQuery} from '../../../../store/api/yt';
import {getClusterUiConfig} from '../../../../store/selectors/global';

import {YTApiId} from '../../../../rum/rum-wrap-api';

import {DialogControlProps} from '../../Dialog.types';

import {useBunldesList} from './use-bundles-list';
import {useCliquesList} from './use-cliques-list';
import {useActions} from './use-actions';

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

    const {data: bundlesAllowedResp} = useFetchBatchQuery({
        parameters: {
            requests: [
                {
                    command: 'exists' as const,
                    parameters: {
                        path: '//sys/bundle_controller/orchid/bundle_controller/state/bundles',
                    },
                },
            ],
        },
        id: YTApiId.tabletBundleControllerState,
        errorTitle: 'Failed to fetch bundle controller existance',
    });

    const serviceTypeOptions: {value: 'chyt' | 'bundle'; content: 'CHYT' | 'Bundle'}[] = [];

    if (chytAllowed) {
        serviceTypeOptions.push({value: 'chyt', content: 'CHYT'});
    }

    if (bundlesAllowedResp?.[0]?.output) {
        serviceTypeOptions.push({value: 'bundle', content: 'Bundle'});
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
            return 'Select item';
        }

        return `Select ${pair.service === 'chyt' ? 'clique' : 'bundle'}`;
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
                                placeholder={'Select service'}
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
                                    Remove
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
                                        Add Service
                                    </Flex>
                                </Button>
                            </Flex>
                        )}
                </Flex>
            ) : (
                <Text color={'danger'} variant={'body-2'}>
                    There are no services available on current cluster
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
        return `${service === 'chyt' ? 'Clique' : 'Bundle'} option is required`;
    }
    return;
};
