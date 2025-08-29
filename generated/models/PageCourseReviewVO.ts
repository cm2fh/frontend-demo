/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CourseReviewVO } from './CourseReviewVO';
import type { OrderItem } from './OrderItem';
export type PageCourseReviewVO = {
    records?: Array<CourseReviewVO>;
    total?: number;
    size?: number;
    current?: number;
    orders?: Array<OrderItem>;
    optimizeCountSql?: PageCourseReviewVO;
    searchCount?: PageCourseReviewVO;
    optimizeJoinOfCountSql?: boolean;
    maxLimit?: number;
    countId?: string;
    pages?: number;
};

