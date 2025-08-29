/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BaseResponseListCoachWorkloadVO } from '../models/BaseResponseListCoachWorkloadVO';
import type { BaseResponseListCourseRankingVO } from '../models/BaseResponseListCourseRankingVO';
import type { BaseResponseListTrendDataVO } from '../models/BaseResponseListTrendDataVO';
import type { BaseResponseStatisticsOverviewVO } from '../models/BaseResponseStatisticsOverviewVO';
import type { BaseResponseString } from '../models/BaseResponseString';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class StatisticsControllerService {
    /**
     * @returns BaseResponseString OK
     * @throws ApiError
     */
    public static clearCache(): CancelablePromise<BaseResponseString> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/statistics/clear',
            errors: {
                400: `Bad Request`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * @param days
     * @returns BaseResponseListTrendDataVO OK
     * @throws ApiError
     */
    public static getReservationTrend(
        days: number = 7,
    ): CancelablePromise<BaseResponseListTrendDataVO> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/statistics/reservation-trend',
            query: {
                'days': days,
            },
            errors: {
                400: `Bad Request`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * @returns BaseResponseStatisticsOverviewVO OK
     * @throws ApiError
     */
    public static getOverviewStatistics(): CancelablePromise<BaseResponseStatisticsOverviewVO> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/statistics/overview',
            errors: {
                400: `Bad Request`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * @param limit
     * @returns BaseResponseListCourseRankingVO OK
     * @throws ApiError
     */
    public static getCourseRanking(
        limit: number = 10,
    ): CancelablePromise<BaseResponseListCourseRankingVO> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/statistics/course-ranking',
            query: {
                'limit': limit,
            },
            errors: {
                400: `Bad Request`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * @returns BaseResponseListCoachWorkloadVO OK
     * @throws ApiError
     */
    public static getCoachWorkload(): CancelablePromise<BaseResponseListCoachWorkloadVO> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/statistics/coach-workload',
            errors: {
                400: `Bad Request`,
                500: `Internal Server Error`,
            },
        });
    }
}
