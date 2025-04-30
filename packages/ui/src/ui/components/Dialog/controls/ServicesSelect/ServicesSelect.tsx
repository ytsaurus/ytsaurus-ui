import React from 'react';
import {Button, Flex, Select} from '@gravity-ui/uikit';
import {Plus} from '@gravity-ui/icons';

import map_ from 'lodash/map';

import {DialogControlProps} from '../../Dialog.types';

import {useBunldesList} from './use-bundles-list';
import {useCliquesList} from './use-cliques-list';

export type ServicePair = {
    service: string;
    item: string;
};

type Props = DialogControlProps<ServicePair[]> & {
    disabled?: boolean;
};

export function ServicesSelect(props: Props) {
    const {value = [{service: '', item: ''}], onChange, disabled} = props;

    const serviceTypeOptions = [
        {value: 'bundle', content: 'Bundle'},
        {value: 'chyt', content: 'CHYT'},
    ];

    const {bundles, isBundlesLoading} = useBunldesList();

    const {cliques, isCliquesLoading} = useCliquesList();

    const handleAddPair = () => {
        onChange([...value, {service: '', item: ''}]);
    };

    const handleRemovePair = (index: number) => {
        const newValue = [...value];
        newValue.splice(index, 1);
        onChange(newValue);
    };

    const handleServiceChange = (index: number, newService: 'chyt' | 'bundle' | string) => {
        const service = newService;
        const newValue = [...value];
        newValue[index] = {
            ...newValue[index],
            service,
            item: '', // Reset value when service changes
        };
        onChange(newValue);
    };

    const handleItemChange = (index: number, newItem: string) => {
        const newValue = [...value];
        newValue[index] = {
            ...newValue[index],
            item: newItem,
        };
        onChange(newValue);
    };

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
        <Flex direction={'column'} gap={2}>
            {value.map((pair, index) => (
                <Flex key={index} gap={2}>
                    <Select
                        options={serviceTypeOptions}
                        onUpdate={(newValue) => handleServiceChange(index, newValue[0])}
                        popupWidth={'fit'}
                        value={[pair.service]}
                        hasClear
                        width={'max'}
                        disabled={disabled}
                        placeholder={'Select service'}
                    />
                    <Select
                        onUpdate={(newValue) => handleItemChange(index, newValue[0])}
                        width={'max'}
                        hasClear
                        value={[pair.item]}
                        options={makeItemsOptions(pair)}
                        loading={isItemsListLoading(pair)}
                        disabled={disabled || !pair.service}
                        placeholder={makeItemPlaceholder(pair)}
                    />
                    {value.length > 1 && (
                        <Button
                            view="flat"
                            onClick={() => handleRemovePair(index)}
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
                        <Button size={'m'} onClick={handleAddPair} disabled={disabled}>
                            <Flex alignItems={'center'} gap={2}>
                                <Plus />
                                Add Service
                            </Flex>
                        </Button>
                    </Flex>
                )}
        </Flex>
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
