import axios from 'axios';

import {getExportTableBaseUrl} from '../../config';
import i18n from './i18n';

export const prepareValue = (value: string): number | string => {
    const parsedValue = Number(String(value).replace(/\s/g, '') || undefined); // we need `|| undefined` cause Number('') === 0
    return isNaN(parsedValue) ? value : parsedValue;
};

export const checkExcelExporter = (cluster: string) => {
    const EXCEL_BASE_URL = getExportTableBaseUrl({cluster});

    if (!EXCEL_BASE_URL) {
        return Promise.resolve(false);
    }

    return axios
        .get(`${EXCEL_BASE_URL}/${cluster}/api/ready`)
        .then(() => true)
        .catch(() => false);
};

export const prepareSeparatorValue = (v?: string) => {
    let res = v || '';
    try {
        res = JSON.parse(`"${v}"`);
    } catch (e) {}

    let error;
    // getting size in bytes `new Blob(['ы']).size !== 'ы'.length`
    const {size} = new Blob([res]);
    if (size !== 1) {
        error = i18n('alert_expected-length-1', {size});
    }
    return {value: res, error};
};
