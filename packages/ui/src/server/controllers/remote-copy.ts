import _ from 'lodash';

import type {Request, Response} from 'express';
// @ts-ignore
import ytLib from '@ytsaurus/javascript-wrapper';

import {sendAndLogError} from '../utils';

// @ts-ignore
import {RemoteCopyParams} from '../../@types/types';
import {getClustersFromConfig} from '../components/utils';

const yt = ytLib();

export async function handleRemoteCopy(req: Request, res: Response) {
    await req.ctx.call(`RemoteCopy ${req.id}`, async (ctx) => {
        function sendErrorAndLog(title: string, error: Error, statusCode: number | null = null) {
            ctx.logError(title || 'Error', error);
            sendAndLogError(ctx, res, statusCode, error);
        }

        ctx.log('Begin', req.body);
        try {
            const body: RemoteCopyParams = req.body || {};

            const {[body.cluster_name]: srcClusterConfig, [body.dstCluster]: dstClusterConfig} =
                getClustersFromConfig();

            if (!srcClusterConfig) {
                return sendErrorAndLog(
                    'Wrong params',
                    new Error('Unexpected value of "cluster_name"'),
                    400,
                );
            }

            if (!dstClusterConfig) {
                return sendErrorAndLog(
                    'Wrong params',
                    new Error('Unexpected value of "dstCluster"'),
                    400,
                );
            }

            if (
                !Array.isArray(body.input_table_paths) ||
                _.some(body.input_table_paths, (item) => 'string' !== typeof item)
            ) {
                return sendErrorAndLog(
                    'Wrong params',
                    new Error('"input_table_paths" should be defined as an array of string'),
                    400,
                );
            }

            if ('string' !== typeof body.output_table_path) {
                return sendErrorAndLog(
                    'Wrong params',
                    new Error('"output_table_path" should be defined as a string'),
                    400,
                );
            }

            const {ytApiAuthHeaders} = req.yt;

            const {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                dstCluster,
                override,
                ...spec
            } = req.body;
            const setup = {
                requestHeaders: ytApiAuthHeaders,
                proxy: `${dstClusterConfig.proxy}`,
            };

            const existPromise = override
                ? Promise.resolve(false)
                : yt.v3.exists({setup, parameters: {path: body.output_table_path}});

            return existPromise.then((value: boolean) => {
                if (value) {
                    return sendErrorAndLog(
                        `Path already exists.`,
                        new Error(`"${body.output_table_path}" path already exist.`),
                        409,
                    );
                }

                return yt.v3
                    .remoteCopy({
                        setup,
                        parameters: {
                            spec: {
                                ...spec,
                                output_table_path: {
                                    $value: body.output_table_path,
                                    $attributes: {create: true},
                                },
                            },
                        },
                    })
                    .then((response: string) => {
                        res.status(200).send(response);
                    })
                    .catch((e: Error) => {
                        sendErrorAndLog('Error in yt.v3.remoteCopy', e);
                    });
            });
        } catch (e) {
            sendErrorAndLog('Unexpected error', e as Error);
        }
        ctx.log('End');
    });
}
