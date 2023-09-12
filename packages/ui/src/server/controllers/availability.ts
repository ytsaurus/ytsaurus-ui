import axios, {AxiosResponse} from 'axios';
import _ from 'lodash';
import type {Request, Response} from '@gravity-ui/expresskit';
import {getClustersFromConfig} from '../components/utils';
import {sendAndLogError, sendError, sendResponse} from '../utils';
import {getApp} from '../ServerFactory';

function getClusterAvailability(clusterConfig: {id: string}, odinPath: string) {
    const ODIN_PERIOD = 5;
    const ODIN_METRIC = 'master';
    const TIMEOUT = 15 * 1000;

    return axios
        .request({
            url: odinPath + '/availability_stat/' + clusterConfig.id,
            params: {
                period: ODIN_PERIOD,
                target: ODIN_METRIC,
            },
            method: 'GET',
            timeout: TIMEOUT,
            responseType: 'json',
        })
        .then((response: AxiosResponse<1 | undefined>) => {
            return response.data;
        });
}

function getAvailability(req: Request, clusters: Record<string, {id: string}>, odinPath: string) {
    const url = `${odinPath}/is_alive`;
    return axios
        .request({url, responseType: 'json'})
        .then((res) => {
            if (res.data !== true) {
                return [];
            }
            return Promise.all(
                _.map(clusters, (clusterConfig) => {
                    const id = clusterConfig.id;
                    return getClusterAvailability(clusterConfig, odinPath)
                        .then((availability) => ({id, availability}))
                        .catch((error) => {
                            req.ctx.logError('getAvailability error', error);
                            return {id};
                        });
                }),
            );
        })
        .catch((e) => {
            req.ctx.logError(`Error of getting ${url}`, e);
            return [];
        });
}

export async function getClustersAvailability(req: Request, res: Response) {
    const odinPath = getApp().config?.odinBaseUrl;
    if (!odinPath) {
        sendAndLogError(req.ctx, res, 500, new Error('odin base url is not configured'));
        return;
    }
    const clusters = getClustersFromConfig();

    await getAvailability(req, clusters, odinPath)
        .then((data: object) => sendResponse(res, data))
        .catch((error) => sendError(res, error));
}
