/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BaseResponseBoolean } from '../models/BaseResponseBoolean';
import type { BaseResponseCourse } from '../models/BaseResponseCourse';
import type { BaseResponseCourseVO } from '../models/BaseResponseCourseVO';
import type { BaseResponseListCourseVO } from '../models/BaseResponseListCourseVO';
import type { BaseResponseLong } from '../models/BaseResponseLong';
import type { BaseResponsePageCourse } from '../models/BaseResponsePageCourse';
import type { BaseResponsePageCourseVO } from '../models/BaseResponsePageCourseVO';
import type { CourseAddRequest } from '../models/CourseAddRequest';
import type { CourseQueryRequest } from '../models/CourseQueryRequest';
import type { CourseUpdateRequest } from '../models/CourseUpdateRequest';
import type { DeleteRequest } from '../models/DeleteRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class CourseControllerService {
    /**
     * @param requestBody
     * @returns BaseResponseBoolean OK
     * @throws ApiError
     */
    public static updateCourse(
        requestBody: CourseUpdateRequest,
    ): CancelablePromise<BaseResponseBoolean> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/course/update',
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
     * @returns BaseResponsePageCourse OK
     * @throws ApiError
     */
    public static listCourseByPage(
        requestBody: CourseQueryRequest,
    ): CancelablePromise<BaseResponsePageCourse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/course/list/page',
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
     * @returns BaseResponsePageCourseVO OK
     * @throws ApiError
     */
    public static listCourseVoByPage(
        requestBody: CourseQueryRequest,
    ): CancelablePromise<BaseResponsePageCourseVO> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/course/list/page/vo',
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
    public static deleteCourse(
        requestBody: DeleteRequest,
    ): CancelablePromise<BaseResponseBoolean> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/course/delete',
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
    public static addCourse(
        requestBody: CourseAddRequest,
    ): CancelablePromise<BaseResponseLong> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/course/add',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad Request`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * @param courseQueryRequest
     * @returns BaseResponseListCourseVO OK
     * @throws ApiError
     */
    public static listCourse(
        courseQueryRequest: CourseQueryRequest,
    ): CancelablePromise<BaseResponseListCourseVO> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/course/list',
            query: {
                'courseQueryRequest': courseQueryRequest,
            },
            errors: {
                400: `Bad Request`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * @returns BaseResponseListCourseVO OK
     * @throws ApiError
     */
    public static listEnableCourse(): CancelablePromise<BaseResponseListCourseVO> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/course/list/enable',
            errors: {
                400: `Bad Request`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * @param id
     * @returns BaseResponseCourse OK
     * @throws ApiError
     */
    public static getCourseById(
        id: number,
    ): CancelablePromise<BaseResponseCourse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/course/get',
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
     * @returns BaseResponseCourseVO OK
     * @throws ApiError
     */
    public static getCourseVoById(
        id: number,
    ): CancelablePromise<BaseResponseCourseVO> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/course/get/vo',
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
