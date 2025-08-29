/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BaseResponseBoolean } from '../models/BaseResponseBoolean';
import type { BaseResponseCourseReview } from '../models/BaseResponseCourseReview';
import type { BaseResponseCourseReviewVO } from '../models/BaseResponseCourseReviewVO';
import type { BaseResponseListCourseReview } from '../models/BaseResponseListCourseReview';
import type { BaseResponseLong } from '../models/BaseResponseLong';
import type { BaseResponsePageCourseReview } from '../models/BaseResponsePageCourseReview';
import type { BaseResponsePageCourseReviewVO } from '../models/BaseResponsePageCourseReviewVO';
import type { CourseReviewAddRequest } from '../models/CourseReviewAddRequest';
import type { CourseReviewQueryRequest } from '../models/CourseReviewQueryRequest';
import type { CourseReviewUpdateRequest } from '../models/CourseReviewUpdateRequest';
import type { DeleteRequest } from '../models/DeleteRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class CourseReviewControllerService {
    /**
     * @param requestBody
     * @returns BaseResponseBoolean OK
     * @throws ApiError
     */
    public static updateCourseReview(
        requestBody: CourseReviewUpdateRequest,
    ): CancelablePromise<BaseResponseBoolean> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/courseReview/update',
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
     * @returns BaseResponsePageCourseReview OK
     * @throws ApiError
     */
    public static listCourseReviewByPage(
        requestBody: CourseReviewQueryRequest,
    ): CancelablePromise<BaseResponsePageCourseReview> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/courseReview/list/page',
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
     * @returns BaseResponsePageCourseReviewVO OK
     * @throws ApiError
     */
    public static listCourseReviewVoByPage(
        requestBody: CourseReviewQueryRequest,
    ): CancelablePromise<BaseResponsePageCourseReviewVO> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/courseReview/list/page/vo',
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
    public static deleteCourseReview(
        requestBody: DeleteRequest,
    ): CancelablePromise<BaseResponseBoolean> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/courseReview/delete',
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
    public static addCourseReview(
        requestBody: CourseReviewAddRequest,
    ): CancelablePromise<BaseResponseLong> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/courseReview/add',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad Request`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * @param courseReviewQueryRequest
     * @returns BaseResponseListCourseReview OK
     * @throws ApiError
     */
    public static listCourseReview(
        courseReviewQueryRequest: CourseReviewQueryRequest,
    ): CancelablePromise<BaseResponseListCourseReview> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/courseReview/list',
            query: {
                'courseReviewQueryRequest': courseReviewQueryRequest,
            },
            errors: {
                400: `Bad Request`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * @param id
     * @returns BaseResponseCourseReview OK
     * @throws ApiError
     */
    public static getCourseReviewById(
        id: number,
    ): CancelablePromise<BaseResponseCourseReview> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/courseReview/get',
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
     * @returns BaseResponseCourseReviewVO OK
     * @throws ApiError
     */
    public static getCourseReviewVoById(
        id: number,
    ): CancelablePromise<BaseResponseCourseReviewVO> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/courseReview/get/vo',
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
     * @param reservationId
     * @returns BaseResponseBoolean OK
     * @throws ApiError
     */
    public static checkReviewExists(
        reservationId: number,
    ): CancelablePromise<BaseResponseBoolean> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/courseReview/check/{reservationId}',
            path: {
                'reservationId': reservationId,
            },
            errors: {
                400: `Bad Request`,
                500: `Internal Server Error`,
            },
        });
    }
}
