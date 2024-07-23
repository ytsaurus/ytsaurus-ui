import axios, {AxiosResponse} from 'axios';
import map_ from 'lodash/map';
import type {Request, Response} from '@gravity-ui/expresskit';
import {getClustersFromConfig} from '../components/utils';
import {sendAndLogError, sendError, sendResponse} from '../utils';

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

function getAvailability(req: Request, clusters: Record<string, {id: string}>) {
    const odinBaseUrl = req.ctx.config.odinBaseUrl;
    const isMultiOdinBaseUrl = 'string' !== typeof odinBaseUrl;
    const makeOdinIsAliveUrl = (odinBaseUrl: string) => `${odinBaseUrl}/is_alive`;

    const commonIsAlive = isMultiOdinBaseUrl
        ? Promise.resolve({data: true})
        : axios.request({url: makeOdinIsAliveUrl(odinBaseUrl)});

    return commonIsAlive
        .then(({data: commonAlive}) => {
            if (!commonAlive) {
                return [];
            }

            return Promise.all(
                map_(clusters, (clusterConfig) => {
                    const odinPath = isMultiOdinBaseUrl
                        ? odinBaseUrl?.[clusterConfig.id]
                        : odinBaseUrl;

                    if (!odinPath) {
                        return {};
                    }

                    const alive = isMultiOdinBaseUrl
                        ? axios.get(makeOdinIsAliveUrl(odinPath)).catch((e) => {
                              req.ctx.logError(`Error of getting ${odinPath}`, e);
                              return {data: false};
                          })
                        : Promise.resolve({data: true});

                    return alive.then(({data}) => {
                        if (data != true) {
                            return {};
                        }

                        return getClusterAvailability(clusterConfig, odinPath)
                            .then((availability) => ({id: clusterConfig.id, availability}))
                            .catch((error) => {
                                req.ctx.logError('getAvailability error', error);
                                return {};
                            });
                    });
                }),
            );
        })
        .catch((e) => {
            req.ctx.logError(`Error of getting ${odinBaseUrl}`, e);
            return [];
        });
}

export async function getClustersAvailability(req: Request, res: Response) {
    const odinBaseUrl = req.ctx.config.odinBaseUrl;

    if (!odinBaseUrl) {
        sendAndLogError(req.ctx, res, 500, new Error('odin base url is not configured'));
        return;
    }
    const clusters = getClustersFromConfig();

    await getAvailability(req, clusters)
        .then((data: object) => sendResponse(res, data))
        .catch((error) => sendError(res, error));
}
