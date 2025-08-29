/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BaseResponseBoolean } from '../models/BaseResponseBoolean';
import type { BaseResponseCourseCategory } from '../models/BaseResponseCourseCategory';
import type { BaseResponseListCourseCategory } from '../models/BaseResponseListCourseCategory';
import type { BaseResponseLong } from '../models/BaseResponseLong';
import type { BaseResponsePageCourseCategory } from '../models/BaseResponsePageCourseCategory';
import type { BaseResponsePageCourseCategoryVO } from '../models/BaseResponsePageCourseCategoryVO';
import type { CourseCategoryAddRequest } from '../models/CourseCategoryAddRequest';
import type { CourseCategoryQueryRequest } from '../models/CourseCategoryQueryRequest';
import type { CourseCategoryUpdateRequest } from '../models/CourseCategoryUpdateRequest';
import type { DeleteRequest } from '../models/DeleteRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class CourseCategoryControllerService {
    /**
     * @param requestBody
     * @returns BaseResponseBoolean OK
     * @throws ApiError
     */
    public static updateCourseCategory(
        requestBody: CourseCategoryUpdateRequest,
    ): CancelablePromise<BaseResponseBoolean> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/courseCategory/update',
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
     * @returns BaseResponsePageCourseCategory OK
     * @throws ApiError
     */
    public static listCourseCategoryByPage(
        requestBody: CourseCategoryQueryRequest,
    ): CancelablePromise<BaseResponsePageCourseCategory> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/courseCategory/list/page',
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
     * @returns BaseResponsePageCourseCategoryVO OK
     * @throws ApiError
     */
    public static listCourseCategoryVoByPage(
        requestBody: CourseCategoryQueryRequest,
    ): CancelablePromise<BaseResponsePageCourseCategoryVO> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/courseCategory/list/page/vo',
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
    public static deleteCourseCategory(
        requestBody: DeleteRequest,
    ): CancelablePromise<BaseResponseBoolean> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/courseCategory/delete',
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
    public static addCourseCategory(
        requestBody: CourseCategoryAddRequest,
    ): CancelablePromise<BaseResponseLong> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/courseCategory/add',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad Request`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * @param courseCategoryQueryRequest
     * @returns BaseResponseListCourseCategory OK
     * @throws ApiError
     */
    public static listCourseCategory(
        courseCategoryQueryRequest: CourseCategoryQueryRequest,
    ): CancelablePromise<BaseResponseListCourseCategory> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/courseCategory/list',
            query: {
                'courseCategoryQueryRequest': courseCategoryQueryRequest,
            },
            errors: {
                400: `Bad Request`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * @returns BaseResponseListCourseCategory OK
     * @throws ApiError
     */
    public static listEnableCourseCategory(): CancelablePromise<BaseResponseListCourseCategory> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/courseCategory/list/enable',
            errors: {
                400: `Bad Request`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * @param id
     * @returns BaseResponseCourseCategory OK
     * @throws ApiError
     */
    public static getCourseCategoryById(
        id: number,
    ): CancelablePromise<BaseResponseCourseCategory> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/courseCategory/get',
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
