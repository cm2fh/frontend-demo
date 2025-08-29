/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BaseResponsePaymentResponse } from '../models/BaseResponsePaymentResponse';
import type { PaymentRequest } from '../models/PaymentRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class PaymentControllerService {
    /**
     * @param requestBody
     * @returns BaseResponsePaymentResponse OK
     * @throws ApiError
     */
    public static mockPayment(
        requestBody: PaymentRequest,
    ): CancelablePromise<BaseResponsePaymentResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/payment/pay',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad Request`,
                500: `Internal Server Error`,
            },
        });
    }
}
