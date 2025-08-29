/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CourseCategory } from './CourseCategory';
import type { OrderItem } from './OrderItem';
export type PageCourseCategory = {
    records?: Array<CourseCategory>;
    total?: number;
    size?: number;
    current?: number;
    orders?: Array<OrderItem>;
    optimizeCountSql?: PageCourseCategory;
    searchCount?: PageCourseCategory;
    optimizeJoinOfCountSql?: boolean;
    maxLimit?: number;
    countId?: string;
    pages?: number;
};

