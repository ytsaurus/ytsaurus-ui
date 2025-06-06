import {Result} from '../../module/query_result/types';

const repeatChar = (char: string, repeatCount: number) => {
    let string = '';
    for (let i = 0; i < repeatCount; i++) {
        string += char;
    }
    return string;
};

const padMicroseconds = (microseconds: BigInt) => {
    const ms = String(microseconds);
    return repeatChar('0', 3 - ms.length) + ms;
};

const TIMESTAMP_DIVISOR = 1000;

export const get64Timestamp = (node: Result) => {
    try {
        const value = BigInt(node.$value as string);
        const divisor = BigInt(TIMESTAMP_DIVISOR);
        const microseconds = value % divisor;
        const timestampVal = value / divisor;
        const dateTime = new Date(Number(timestampVal));
        const timeString =
            dateTime.toISOString().replace('Z', '') + padMicroseconds(microseconds) + 'Z';
        return new Date(timeString).getTime();
    } catch (e) {
        return 'Invalid timestamp';
    }
};
