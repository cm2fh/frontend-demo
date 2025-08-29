/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BaseResponseBoolean } from '../models/BaseResponseBoolean';
import type { BaseResponseListProductVO } from '../models/BaseResponseListProductVO';
import type { BaseResponseLong } from '../models/BaseResponseLong';
import type { BaseResponsePageProduct } from '../models/BaseResponsePageProduct';
import type { BaseResponsePageProductVO } from '../models/BaseResponsePageProductVO';
import type { BaseResponseProduct } from '../models/BaseResponseProduct';
import type { BaseResponseProductVO } from '../models/BaseResponseProductVO';
import type { DeleteRequest } from '../models/DeleteRequest';
import type { ProductAddRequest } from '../models/ProductAddRequest';
import type { ProductQueryRequest } from '../models/ProductQueryRequest';
import type { ProductUpdateRequest } from '../models/ProductUpdateRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ProductControllerService {
    /**
     * @param requestBody
     * @returns BaseResponseBoolean OK
     * @throws ApiError
     */
    public static updateProduct(
        requestBody: ProductUpdateRequest,
    ): CancelablePromise<BaseResponseBoolean> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/product/update',
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
     * @returns BaseResponseListProductVO OK
     * @throws ApiError
     */
    public static listProduct(
        requestBody: ProductQueryRequest,
    ): CancelablePromise<BaseResponseListProductVO> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/product/list',
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
     * @returns BaseResponsePageProduct OK
     * @throws ApiError
     */
    public static listProductByPage(
        requestBody: ProductQueryRequest,
    ): CancelablePromise<BaseResponsePageProduct> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/product/list/page',
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
     * @returns BaseResponsePageProductVO OK
     * @throws ApiError
     */
    public static listProductVoByPage(
        requestBody: ProductQueryRequest,
    ): CancelablePromise<BaseResponsePageProductVO> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/product/list/page/vo',
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
    public static deleteProduct(
        requestBody: DeleteRequest,
    ): CancelablePromise<BaseResponseBoolean> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/product/delete',
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
    public static addProduct(
        requestBody: ProductAddRequest,
    ): CancelablePromise<BaseResponseLong> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/product/add',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad Request`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * @param id
     * @returns BaseResponseProduct OK
     * @throws ApiError
     */
    public static getProductById(
        id: number,
    ): CancelablePromise<BaseResponseProduct> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/product/get',
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
     * @returns BaseResponseProductVO OK
     * @throws ApiError
     */
    public static getProductVoById(
        id: number,
    ): CancelablePromise<BaseResponseProductVO> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/product/get/vo',
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
