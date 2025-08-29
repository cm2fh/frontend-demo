/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BaseResponseBoolean } from '../models/BaseResponseBoolean';
import type { BaseResponseListOrder } from '../models/BaseResponseListOrder';
import type { BaseResponseLong } from '../models/BaseResponseLong';
import type { BaseResponseOrder } from '../models/BaseResponseOrder';
import type { BaseResponseOrderVO } from '../models/BaseResponseOrderVO';
import type { BaseResponsePageOrder } from '../models/BaseResponsePageOrder';
import type { BaseResponsePageOrderVO } from '../models/BaseResponsePageOrderVO';
import type { DeleteRequest } from '../models/DeleteRequest';
import type { OrderAddRequest } from '../models/OrderAddRequest';
import type { OrderQueryRequest } from '../models/OrderQueryRequest';
import type { OrderUpdateRequest } from '../models/OrderUpdateRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class OrderControllerService {
    /**
     * @param requestBody
     * @returns BaseResponseBoolean OK
     * @throws ApiError
     */
    public static updateOrder(
        requestBody: OrderUpdateRequest,
    ): CancelablePromise<BaseResponseBoolean> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/order/update',
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
     * @returns BaseResponsePageOrder OK
     * @throws ApiError
     */
    public static listOrderByPage(
        requestBody: OrderQueryRequest,
    ): CancelablePromise<BaseResponsePageOrder> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/order/list/page',
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
     * @returns BaseResponsePageOrderVO OK
     * @throws ApiError
     */
    public static listOrderVoByPage(
        requestBody: OrderQueryRequest,
    ): CancelablePromise<BaseResponsePageOrderVO> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/order/list/page/vo',
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
    public static deleteOrder(
        requestBody: DeleteRequest,
    ): CancelablePromise<BaseResponseBoolean> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/order/delete',
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
    public static addOrder(
        requestBody: OrderAddRequest,
    ): CancelablePromise<BaseResponseLong> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/order/add',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad Request`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * @param orderQueryRequest
     * @returns BaseResponseListOrder OK
     * @throws ApiError
     */
    public static listOrder(
        orderQueryRequest: OrderQueryRequest,
    ): CancelablePromise<BaseResponseListOrder> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/order/list',
            query: {
                'orderQueryRequest': orderQueryRequest,
            },
            errors: {
                400: `Bad Request`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * @param id
     * @returns BaseResponseOrder OK
     * @throws ApiError
     */
    public static getOrderById(
        id: number,
    ): CancelablePromise<BaseResponseOrder> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/order/get',
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
     * @returns BaseResponseOrderVO OK
     * @throws ApiError
     */
    public static getOrderVoById(
        id: number,
    ): CancelablePromise<BaseResponseOrderVO> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/order/get/vo',
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
