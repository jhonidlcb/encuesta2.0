import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from "@tanstack/react-query";
import type { AdminLoginBody, AdminLoginResponse, AdminStats, Candidate, CastVoteBody, ChangePasswordBody, CheckVoteBody, CloseSurveyBody, CreateCandidateBody, ErrorResponse, HealthStatus, PublicResults, SuccessResponse, UpdateCandidateBody, VoteCheckResponse, VoteResponse } from "./api.schemas";
import { customFetch } from "../custom-fetch";
import type { ErrorType, BodyType } from "../custom-fetch";
type AwaitedInput<T> = PromiseLike<T> | T;
type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;
type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];
/**
 * @summary Health check
 */
export declare const getHealthCheckUrl: () => string;
export declare const healthCheck: (options?: RequestInit) => Promise<HealthStatus>;
export declare const getHealthCheckQueryKey: () => readonly ["/api/healthz"];
export declare const getHealthCheckQueryOptions: <TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData> & {
    queryKey: QueryKey;
};
export type HealthCheckQueryResult = NonNullable<Awaited<ReturnType<typeof healthCheck>>>;
export type HealthCheckQueryError = ErrorType<unknown>;
/**
 * @summary Health check
 */
export declare function useHealthCheck<TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary List all candidates
 */
export declare const getListCandidatesUrl: () => string;
export declare const listCandidates: (options?: RequestInit) => Promise<Candidate[]>;
export declare const getListCandidatesQueryKey: () => readonly ["/api/candidates"];
export declare const getListCandidatesQueryOptions: <TData = Awaited<ReturnType<typeof listCandidates>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listCandidates>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listCandidates>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListCandidatesQueryResult = NonNullable<Awaited<ReturnType<typeof listCandidates>>>;
export type ListCandidatesQueryError = ErrorType<unknown>;
/**
 * @summary List all candidates
 */
export declare function useListCandidates<TData = Awaited<ReturnType<typeof listCandidates>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listCandidates>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Cast a vote for a candidate
 */
export declare const getCastVoteUrl: () => string;
export declare const castVote: (castVoteBody: CastVoteBody, options?: RequestInit) => Promise<VoteResponse>;
export declare const getCastVoteMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof castVote>>, TError, {
        data: BodyType<CastVoteBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof castVote>>, TError, {
    data: BodyType<CastVoteBody>;
}, TContext>;
export type CastVoteMutationResult = NonNullable<Awaited<ReturnType<typeof castVote>>>;
export type CastVoteMutationBody = BodyType<CastVoteBody>;
export type CastVoteMutationError = ErrorType<ErrorResponse>;
/**
 * @summary Cast a vote for a candidate
 */
export declare const useCastVote: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof castVote>>, TError, {
        data: BodyType<CastVoteBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof castVote>>, TError, {
    data: BodyType<CastVoteBody>;
}, TContext>;
/**
 * @summary Check if a fingerprint has already voted
 */
export declare const getCheckVoteStatusUrl: () => string;
export declare const checkVoteStatus: (checkVoteBody: CheckVoteBody, options?: RequestInit) => Promise<VoteCheckResponse>;
export declare const getCheckVoteStatusMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof checkVoteStatus>>, TError, {
        data: BodyType<CheckVoteBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof checkVoteStatus>>, TError, {
    data: BodyType<CheckVoteBody>;
}, TContext>;
export type CheckVoteStatusMutationResult = NonNullable<Awaited<ReturnType<typeof checkVoteStatus>>>;
export type CheckVoteStatusMutationBody = BodyType<CheckVoteBody>;
export type CheckVoteStatusMutationError = ErrorType<unknown>;
/**
 * @summary Check if a fingerprint has already voted
 */
export declare const useCheckVoteStatus: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof checkVoteStatus>>, TError, {
        data: BodyType<CheckVoteBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof checkVoteStatus>>, TError, {
    data: BodyType<CheckVoteBody>;
}, TContext>;
/**
 * @summary Admin login
 */
export declare const getAdminLoginUrl: () => string;
export declare const adminLogin: (adminLoginBody: AdminLoginBody, options?: RequestInit) => Promise<AdminLoginResponse>;
export declare const getAdminLoginMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof adminLogin>>, TError, {
        data: BodyType<AdminLoginBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof adminLogin>>, TError, {
    data: BodyType<AdminLoginBody>;
}, TContext>;
export type AdminLoginMutationResult = NonNullable<Awaited<ReturnType<typeof adminLogin>>>;
export type AdminLoginMutationBody = BodyType<AdminLoginBody>;
export type AdminLoginMutationError = ErrorType<ErrorResponse>;
/**
 * @summary Admin login
 */
export declare const useAdminLogin: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof adminLogin>>, TError, {
        data: BodyType<AdminLoginBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof adminLogin>>, TError, {
    data: BodyType<AdminLoginBody>;
}, TContext>;
/**
 * @summary Change admin password
 */
export declare const getChangeAdminPasswordUrl: () => string;
export declare const changeAdminPassword: (changePasswordBody: ChangePasswordBody, options?: RequestInit) => Promise<SuccessResponse>;
export declare const getChangeAdminPasswordMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof changeAdminPassword>>, TError, {
        data: BodyType<ChangePasswordBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof changeAdminPassword>>, TError, {
    data: BodyType<ChangePasswordBody>;
}, TContext>;
export type ChangeAdminPasswordMutationResult = NonNullable<Awaited<ReturnType<typeof changeAdminPassword>>>;
export type ChangeAdminPasswordMutationBody = BodyType<ChangePasswordBody>;
export type ChangeAdminPasswordMutationError = ErrorType<ErrorResponse>;
/**
 * @summary Change admin password
 */
export declare const useChangeAdminPassword: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof changeAdminPassword>>, TError, {
        data: BodyType<ChangePasswordBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof changeAdminPassword>>, TError, {
    data: BodyType<ChangePasswordBody>;
}, TContext>;
/**
 * @summary Create a new candidate
 */
export declare const getCreateCandidateUrl: () => string;
export declare const createCandidate: (createCandidateBody: CreateCandidateBody, options?: RequestInit) => Promise<Candidate>;
export declare const getCreateCandidateMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createCandidate>>, TError, {
        data: BodyType<CreateCandidateBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createCandidate>>, TError, {
    data: BodyType<CreateCandidateBody>;
}, TContext>;
export type CreateCandidateMutationResult = NonNullable<Awaited<ReturnType<typeof createCandidate>>>;
export type CreateCandidateMutationBody = BodyType<CreateCandidateBody>;
export type CreateCandidateMutationError = ErrorType<ErrorResponse>;
/**
 * @summary Create a new candidate
 */
export declare const useCreateCandidate: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createCandidate>>, TError, {
        data: BodyType<CreateCandidateBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createCandidate>>, TError, {
    data: BodyType<CreateCandidateBody>;
}, TContext>;
/**
 * @summary Update a candidate
 */
export declare const getUpdateCandidateUrl: (id: number) => string;
export declare const updateCandidate: (id: number, updateCandidateBody: UpdateCandidateBody, options?: RequestInit) => Promise<Candidate>;
export declare const getUpdateCandidateMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateCandidate>>, TError, {
        id: number;
        data: BodyType<UpdateCandidateBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateCandidate>>, TError, {
    id: number;
    data: BodyType<UpdateCandidateBody>;
}, TContext>;
export type UpdateCandidateMutationResult = NonNullable<Awaited<ReturnType<typeof updateCandidate>>>;
export type UpdateCandidateMutationBody = BodyType<UpdateCandidateBody>;
export type UpdateCandidateMutationError = ErrorType<ErrorResponse>;
/**
 * @summary Update a candidate
 */
export declare const useUpdateCandidate: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateCandidate>>, TError, {
        id: number;
        data: BodyType<UpdateCandidateBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateCandidate>>, TError, {
    id: number;
    data: BodyType<UpdateCandidateBody>;
}, TContext>;
/**
 * @summary Delete a candidate
 */
export declare const getDeleteCandidateUrl: (id: number) => string;
export declare const deleteCandidate: (id: number, options?: RequestInit) => Promise<SuccessResponse>;
export declare const getDeleteCandidateMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteCandidate>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteCandidate>>, TError, {
    id: number;
}, TContext>;
export type DeleteCandidateMutationResult = NonNullable<Awaited<ReturnType<typeof deleteCandidate>>>;
export type DeleteCandidateMutationError = ErrorType<ErrorResponse>;
/**
 * @summary Delete a candidate
 */
export declare const useDeleteCandidate: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteCandidate>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteCandidate>>, TError, {
    id: number;
}, TContext>;
/**
 * @summary Get voting statistics
 */
export declare const getGetAdminStatsUrl: () => string;
export declare const getAdminStats: (options?: RequestInit) => Promise<AdminStats>;
export declare const getGetAdminStatsQueryKey: () => readonly ["/api/admin/stats"];
export declare const getGetAdminStatsQueryOptions: <TData = Awaited<ReturnType<typeof getAdminStats>>, TError = ErrorType<ErrorResponse>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getAdminStats>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getAdminStats>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetAdminStatsQueryResult = NonNullable<Awaited<ReturnType<typeof getAdminStats>>>;
export type GetAdminStatsQueryError = ErrorType<ErrorResponse>;
/**
 * @summary Get voting statistics
 */
export declare function useGetAdminStats<TData = Awaited<ReturnType<typeof getAdminStats>>, TError = ErrorType<ErrorResponse>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getAdminStats>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Close the survey and publish results
 */
export declare const getCloseSurveyUrl: () => string;
export declare const closeSurvey: (closeSurveyBody?: CloseSurveyBody, options?: RequestInit) => Promise<SuccessResponse>;
export declare const getCloseSurveyMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof closeSurvey>>, TError, {
        data: BodyType<CloseSurveyBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof closeSurvey>>, TError, {
    data: BodyType<CloseSurveyBody>;
}, TContext>;
export type CloseSurveyMutationResult = NonNullable<Awaited<ReturnType<typeof closeSurvey>>>;
export type CloseSurveyMutationBody = BodyType<CloseSurveyBody>;
export type CloseSurveyMutationError = ErrorType<ErrorResponse>;
/**
 * @summary Close the survey and publish results
 */
export declare const useCloseSurvey: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof closeSurvey>>, TError, {
        data: BodyType<CloseSurveyBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof closeSurvey>>, TError, {
    data: BodyType<CloseSurveyBody>;
}, TContext>;
/**
 * @summary Reopen the survey
 */
export declare const getOpenSurveyUrl: () => string;
export declare const openSurvey: (options?: RequestInit) => Promise<SuccessResponse>;
export declare const getOpenSurveyMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof openSurvey>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof openSurvey>>, TError, void, TContext>;
export type OpenSurveyMutationResult = NonNullable<Awaited<ReturnType<typeof openSurvey>>>;
export type OpenSurveyMutationError = ErrorType<ErrorResponse>;
/**
 * @summary Reopen the survey
 */
export declare const useOpenSurvey: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof openSurvey>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof openSurvey>>, TError, void, TContext>;
/**
 * @summary Get public results (only available when survey is closed)
 */
export declare const getGetPublicResultsUrl: () => string;
export declare const getPublicResults: (options?: RequestInit) => Promise<PublicResults>;
export declare const getGetPublicResultsQueryKey: () => readonly ["/api/results"];
export declare const getGetPublicResultsQueryOptions: <TData = Awaited<ReturnType<typeof getPublicResults>>, TError = ErrorType<ErrorResponse>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getPublicResults>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getPublicResults>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetPublicResultsQueryResult = NonNullable<Awaited<ReturnType<typeof getPublicResults>>>;
export type GetPublicResultsQueryError = ErrorType<ErrorResponse>;
/**
 * @summary Get public results (only available when survey is closed)
 */
export declare function useGetPublicResults<TData = Awaited<ReturnType<typeof getPublicResults>>, TError = ErrorType<ErrorResponse>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getPublicResults>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export {};
//# sourceMappingURL=api.d.ts.map