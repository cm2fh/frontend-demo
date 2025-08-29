/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CourseReview } from './CourseReview';
import type { OrderItem } from './OrderItem';
export type PageCourseReview = {
    records?: Array<CourseReview>;
    total?: number;
    size?: number;
    current?: number;
    orders?: Array<OrderItem>;
    optimizeCountSql?: PageCourseReview;
    searchCount?: PageCourseReview;
    optimizeJoinOfCountSql?: boolean;
    maxLimit?: number;
    countId?: string;
    pages?: number;
};

