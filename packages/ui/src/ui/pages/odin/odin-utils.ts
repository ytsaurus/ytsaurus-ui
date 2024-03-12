import axios, {Canceler} from 'axios';
import _ from 'lodash';
import moment from 'moment';

import {DATE_FORMAT} from './odin-constants';
import {hasOdinPage} from '../../config';

type SaveCancelToken = ({cancel}: {cancel: Canceler}) => void;
type Availability = {[key: string]: MetricData};

export interface MetricListItem {
    display_name: string;
    name: string;
}

export interface MetricData {
    message?: string;
    state: 'available' | 'unavailable' | 'partially_available' | 'no_data';
}

export default class Utils {
    static ODIN_PATH = '/api/odin/proxy';
    static ODIN_AUTH = 'none';

    static request<T = unknown>(path: string, saveCancelToken?: SaveCancelToken): Promise<T> {
        return axios
            .request({
                url: Utils.ODIN_PATH + path,
                method: 'GET',
                responseType: 'json',
                withCredentials: Utils.ODIN_AUTH === 'domain',
                cancelToken: new axios.CancelToken((cancel) => {
                    if (typeof saveCancelToken === 'function') {
                        saveCancelToken({cancel});
                    }
                }),
            })
            .then((response) => {
                return response.data;
            })
            .catch((error) => {
                if (axios.isCancel(error)) {
                    return Promise.reject(error);
                }
                return Promise.reject(error.response?.data || error);
            });
    }

    static isRequestCanceled(error: any) {
        return axios.isCancel(error);
    }

    static checkStatus(cluster: string) {
        return Utils.request('/exists/' + cluster);
    }

    static listMetrics(cluster: string) {
        return Utils.request<Array<MetricListItem>>(`/service_list/${cluster}`);
    }

    static getMetric(
        cluster: string,
        metric: string,
        from: Date,
        to: Date,
        saveCT: SaveCancelToken,
    ) {
        return Utils.request<Availability>(
            '/availability/' +
                cluster +
                '?metric=' +
                metric +
                '&start_time=' +
                moment(from).toISOString() +
                '&end_time=' +
                moment(to).toISOString() +
                '&return_state_without_message=0',
            saveCT,
        );
    }

    static getMetricOfThisDay(
        cluster: string,
        metric: string,
        date: string | null,
        saveCancelToken: SaveCancelToken,
    ) {
        const startTime = moment(date).startOf('day');
        const endTime = moment(startTime).add(1, 'day');
        return Utils.getMetric(
            cluster,
            metric,
            startTime.toDate(),
            endTime.toDate(),
            saveCancelToken,
        );
    }

    static prepareAvailabilityData(availability: Availability, size: number): Array<MetricData> {
        const asArray: Array<MetricData> = [];
        let property: string;
        let data: MetricData;

        function getPropertyName(i: number) {
            let property = '00000' + i;
            property = 'at_' + property.substr(property.length - 5);
            return property;
        }

        for (let i = 0; i < size; i++) {
            property = getPropertyName(i);

            if (availability && Object.hasOwnProperty.call(availability, property)) {
                data = availability[property];
            } else {
                data = {
                    state: 'no_data',
                };
            }
            asArray.push(data);
        }

        return asArray;
    }

    static computeStat(availability: Array<MetricData>) {
        const counts = _.countBy(availability, ({state}) => {
            if (state === 'available') {
                return 'available';
            } else if (state === 'no_data') {
                return 'no_data';
            } else {
                return 'unavailable';
            }
        });

        const sum = availability.length;

        return {
            from: (counts['available'] || 0) / sum,
            to: (sum - (counts['unavailable'] || 0)) / sum,
        };
    }
}

export function currentDate() {
    return moment().startOf('day').format(DATE_FORMAT);
}

export const fetchClustersAvailability = hasOdinPage()
    ? () => {
          return axios.request({
              method: 'get',
              url: '/api/odin/clusters/availability',
          }) as Promise<
              {
                  id: string;
                  availability?: 1 | undefined;
              }[]
          >;
      }
    : () => Promise.resolve([]);
