import {ServicePair} from './ServicesSelect';

export function useActions(value: ServicePair[], onChange: (v: ServicePair[]) => void) {
    const addPair = () => {
        onChange([...value, {service: '', item: ''}]);
    };

    const removePair = (index: number) => {
        const newValue = [...value];
        newValue.splice(index, 1);
        onChange(newValue);
    };

    const updateService = (index: number, newService: 'chyt' | 'bundle' | string) => {
        const service = newService;
        const newValue = [...value];
        newValue[index] = {
            ...newValue[index],
            service,
            item: '', // Reset value when service changes
        };
        onChange(newValue);
    };

    const updateItem = (index: number, newItem: string) => {
        const newValue = [...value];
        newValue[index] = {
            ...newValue[index],
            item: newItem,
        };
        onChange(newValue);
    };

    return {addPair, removePair, updateService, updateItem};
}
