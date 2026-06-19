import type {SuggestItem} from '../../../../components/Suggest/Suggest';

export const filterSuggestItems = (list: Array<SuggestItem>, text?: string) => {
    if (!text) return list;

    const lcText = text.toLowerCase();
    return list.filter((item) => {
        const itemText = typeof item === 'string' ? item : item.value;
        return itemText.toLowerCase().includes(lcText);
    });
};
