import transform from 'lodash/transform';
import groupBy from 'lodash/groupBy';
import type {QueryResult} from './types';
import {getPointValue} from './getPointData';

export const splitDataByColor = ({
    rows,
    colorFieldName,
    xFieldName,
    yFieldName,
}: {
    rows: QueryResult;
    xFieldName: string;
    yFieldName: string;
    colorFieldName: string;
}) => {
    const xFieldPath = `${xFieldName}.$rawValue`;
    const colorFieldPath = `${colorFieldName}.$rawValue`;

    return transform<
        Record<string, QueryResult>,
        Array<{name: string; data: {x: string; y: number}[]}>
    >(
        groupBy(rows, colorFieldPath),
        (result, value, key) => {
            const data = transform<Record<string, QueryResult>, {x: string; y: number}[]>(
                groupBy(value, xFieldPath),
                (acc, y, x) => {
                    const point = Array.isArray(y) ? y[0] : y;

                    acc.push({
                        x,
                        y: Number(getPointValue(point[yFieldName])),
                    });

                    return acc;
                },
                [],
            );

            result.push({
                name: key,
                data,
            });

            return result;
        },
        [],
    );
};
