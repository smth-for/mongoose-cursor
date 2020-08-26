/* eslint-disable @typescript-eslint/ban-types */
import { Schema, CollationOptions, Model, Document } from 'mongoose';

export interface CustomLabels {
    totalDocs?: string;
    limit?: string;
    docs?: string;
    hasMore?: string;
    startingAfter?: string;
    endingBefore?: string;
}

export interface ReadOptions {
    pref: string;
    tags?: any[];
}

export interface CursorOptions {
    select?: Object | string;
    sort?: Object | string;
    customLabels?: CustomLabels;
    collation?: CollationOptions;
    populate?: Object[] | string[] | Object | string | QueryPopulateOptions;
    lean?: boolean;
    leanWithId?: boolean;
    key?: string;
    startingAfter?: string;
    endingBefore?: string;
    limit?: number;
    read?: ReadOptions;
}

interface QueryPopulateOptions {
    /** space delimited path(s) to populate */
    path: string;
    /** optional fields to select */
    select?: any;
    /** optional query conditions to match */
    match?: any;
    /** optional model to use for population */
    model?: string | Model<any>;
    /** optional query options like sort, limit, etc */
    options?: any;
    /** deep populate */
    populate?: QueryPopulateOptions | QueryPopulateOptions[];
}

export interface CursorResult<T> {
    docs: T[];
    total: number;
    limit: number;
    hasMore?: boolean;
    startingAfter?: string;
    endingBefore?: string;
    [customLabel: string]: T[] | number | string | boolean | undefined;
}

export interface CursorModel<T extends Document> extends Model<T> {
    cursor(
        query?: object,
        options?: CursorOptions,
        callback?: (err: any, result: CursorResult<T>) => void,
    ): Promise<CursorResult<T>>;
}

export function model(name: string, schema?: Schema, collection?: string, skipInit?: boolean): CursorModel<any>;