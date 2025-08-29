/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CourseCategoryVO } from './CourseCategoryVO';
import type { OrderItem } from './OrderItem';
export type PageCourseCategoryVO = {
    records?: Array<CourseCategoryVO>;
    total?: number;
    size?: number;
    current?: number;
    orders?: Array<OrderItem>;
    optimizeCountSql?: PageCourseCategoryVO;
    searchCount?: PageCourseCategoryVO;
    optimizeJoinOfCountSql?: boolean;
    maxLimit?: number;
    countId?: string;
    pages?: number;
};

