/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BaseResponseBoolean } from '../models/BaseResponseBoolean';
import type { BaseResponseListSchedule } from '../models/BaseResponseListSchedule';
import type { BaseResponseListScheduleVO } from '../models/BaseResponseListScheduleVO';
import type { BaseResponseLong } from '../models/BaseResponseLong';
import type { BaseResponsePageSchedule } from '../models/BaseResponsePageSchedule';
import type { BaseResponsePageScheduleVO } from '../models/BaseResponsePageScheduleVO';
import type { BaseResponseSchedule } from '../models/BaseResponseSchedule';
import type { BaseResponseScheduleVO } from '../models/BaseResponseScheduleVO';
import type { DeleteRequest } from '../models/DeleteRequest';
import type { ScheduleAddRequest } from '../models/ScheduleAddRequest';
import type { ScheduleQueryRequest } from '../models/ScheduleQueryRequest';
import type { ScheduleUpdateRequest } from '../models/ScheduleUpdateRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ScheduleControllerService {
    /**
     * @param requestBody
     * @returns BaseResponseBoolean OK
     * @throws ApiError
     */
    public static updateSchedule(
        requestBody: ScheduleUpdateRequest,
    ): CancelablePromise<BaseResponseBoolean> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/schedule/update',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad Request`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * @param requestBody
     * @returns BaseResponsePageSchedule OK
     * @throws ApiError
     */
    public static listScheduleByPage(
        requestBody: ScheduleQueryRequest,
    ): CancelablePromise<BaseResponsePageSchedule> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/schedule/list/page',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad Request`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * @param requestBody
     * @returns BaseResponsePageScheduleVO OK
     * @throws ApiError
     */
    public static listScheduleVoByPage(
        requestBody: ScheduleQueryRequest,
    ): CancelablePromise<BaseResponsePageScheduleVO> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/schedule/list/page/vo',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad Request`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * @param requestBody
     * @returns BaseResponseBoolean OK
     * @throws ApiError
     */
    public static deleteSchedule(
        requestBody: DeleteRequest,
    ): CancelablePromise<BaseResponseBoolean> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/schedule/delete',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad Request`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * @param requestBody
     * @returns BaseResponseLong OK
     * @throws ApiError
     */
    public static addSchedule(
        requestBody: ScheduleAddRequest,
    ): CancelablePromise<BaseResponseLong> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/schedule/add',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad Request`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * @param scheduleQueryRequest
     * @returns BaseResponseListSchedule OK
     * @throws ApiError
     */
    public static listSchedule(
        scheduleQueryRequest: ScheduleQueryRequest,
    ): CancelablePromise<BaseResponseListSchedule> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/schedule/list',
            query: {
                'scheduleQueryRequest': scheduleQueryRequest,
            },
            errors: {
                400: `Bad Request`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * @returns BaseResponseListScheduleVO OK
     * @throws ApiError
     */
    public static listEnableSchedule(): CancelablePromise<BaseResponseListScheduleVO> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/schedule/list/enable',
            errors: {
                400: `Bad Request`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * @param id
     * @returns BaseResponseSchedule OK
     * @throws ApiError
     */
    public static getScheduleById(
        id: number,
    ): CancelablePromise<BaseResponseSchedule> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/schedule/get',
            query: {
                'id': id,
            },
            errors: {
                400: `Bad Request`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * @param id
     * @returns BaseResponseScheduleVO OK
     * @throws ApiError
     */
    public static getScheduleVoById(
        id: number,
    ): CancelablePromise<BaseResponseScheduleVO> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/schedule/get/vo',
            query: {
                'id': id,
            },
            errors: {
                400: `Bad Request`,
                500: `Internal Server Error`,
            },
        });
    }
}
