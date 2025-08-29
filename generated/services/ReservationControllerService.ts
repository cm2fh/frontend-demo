/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BaseResponseBoolean } from '../models/BaseResponseBoolean';
import type { BaseResponseListReservation } from '../models/BaseResponseListReservation';
import type { BaseResponseLong } from '../models/BaseResponseLong';
import type { BaseResponsePageReservation } from '../models/BaseResponsePageReservation';
import type { BaseResponsePageReservationVO } from '../models/BaseResponsePageReservationVO';
import type { BaseResponseReservation } from '../models/BaseResponseReservation';
import type { BaseResponseReservationVO } from '../models/BaseResponseReservationVO';
import type { DeleteRequest } from '../models/DeleteRequest';
import type { ReservationAddRequest } from '../models/ReservationAddRequest';
import type { ReservationCancelRequest } from '../models/ReservationCancelRequest';
import type { ReservationQueryRequest } from '../models/ReservationQueryRequest';
import type { ReservationUpdateRequest } from '../models/ReservationUpdateRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ReservationControllerService {
    /**
     * @param requestBody
     * @returns BaseResponseBoolean OK
     * @throws ApiError
     */
    public static updateReservation(
        requestBody: ReservationUpdateRequest,
    ): CancelablePromise<BaseResponseBoolean> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/reservation/update',
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
     * @returns BaseResponsePageReservation OK
     * @throws ApiError
     */
    public static listReservationByPage(
        requestBody: ReservationQueryRequest,
    ): CancelablePromise<BaseResponsePageReservation> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/reservation/list/page',
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
     * @returns BaseResponsePageReservationVO OK
     * @throws ApiError
     */
    public static listReservationVoByPage(
        requestBody: ReservationQueryRequest,
    ): CancelablePromise<BaseResponsePageReservationVO> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/reservation/list/page/vo',
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
    public static deleteReservation(
        requestBody: DeleteRequest,
    ): CancelablePromise<BaseResponseBoolean> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/reservation/delete',
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
    public static confirmReservation(
        requestBody: ReservationUpdateRequest,
    ): CancelablePromise<BaseResponseBoolean> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/reservation/confirm',
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
    public static checkInReservation(
        requestBody: ReservationUpdateRequest,
    ): CancelablePromise<BaseResponseBoolean> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/reservation/checkin',
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
    public static cancelReservation(
        requestBody: ReservationCancelRequest,
    ): CancelablePromise<BaseResponseBoolean> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/reservation/cancel',
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
    public static addReservation(
        requestBody: ReservationAddRequest,
    ): CancelablePromise<BaseResponseLong> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/reservation/add',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad Request`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * @param reservationQueryRequest
     * @returns BaseResponseListReservation OK
     * @throws ApiError
     */
    public static listReservation(
        reservationQueryRequest: ReservationQueryRequest,
    ): CancelablePromise<BaseResponseListReservation> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/reservation/list',
            query: {
                'reservationQueryRequest': reservationQueryRequest,
            },
            errors: {
                400: `Bad Request`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * @param id
     * @returns BaseResponseReservation OK
     * @throws ApiError
     */
    public static getReservationById(
        id: number,
    ): CancelablePromise<BaseResponseReservation> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/reservation/get',
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
     * @returns BaseResponseReservationVO OK
     * @throws ApiError
     */
    public static getReservationVoById(
        id: number,
    ): CancelablePromise<BaseResponseReservationVO> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/reservation/get/vo',
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
