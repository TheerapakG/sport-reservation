import { provideEffectContext } from "@/utils/effectContext";
import { useMutation } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { serialize } from "cookie-es";
import { Effect } from "effect";
import { MatchingClient } from "sport-reservation-matching/client";
import {
  getMatchingClientBodyType,
  type MatchingClientBodyType,
} from "sport-reservation-matching/models";
import { effectType } from "tiara-stack/utils/effectType";
import { parseCookies } from "vinxi/http";

export const matchingKeys = {
  all: () => ["matching"] as const,
};

export const createGeneralAssessmentServerFn = createServerFn({
  method: "POST",
})
  .validator((data: unknown) =>
    Effect.runSync(
      effectType(getMatchingClientBodyType("createGeneralAssessmentV1"), data),
    ),
  )
  .handler(async ({ data }) => {
    const { access_token: accessToken } = parseCookies();

    if (!accessToken) {
      return { success: false };
    }

    await Effect.runPromise(
      Effect.gen(function* () {
        const matchingClient = yield* MatchingClient;
        return yield* matchingClient.createGeneralAssessmentV1({
          headers: {
            Cookie: serialize("access_token", accessToken),
          },
          body: data,
        });
      }).pipe(provideEffectContext),
    );

    return { success: true };
  });

export const useCreateGeneralAssessmentMutation = () =>
  useMutation({
    mutationFn: ({
      data,
    }: {
      data: MatchingClientBodyType<"createGeneralAssessmentV1">["inferIn"];
    }) => createGeneralAssessmentServerFn({ data }),
  });

export const createBadmintonAssessmentServerFn = createServerFn({
  method: "POST",
})
  .validator((data: unknown) =>
    Effect.runSync(
      effectType(
        getMatchingClientBodyType("createBadmintonAssessmentV1"),
        data,
      ),
    ),
  )
  .handler(async ({ data }) => {
    const { access_token: accessToken } = parseCookies();

    if (!accessToken) {
      return { success: false };
    }

    await Effect.runPromise(
      Effect.gen(function* () {
        const matchingClient = yield* MatchingClient;
        return yield* matchingClient.createBadmintonAssessmentV1({
          body: data,
        });
      }).pipe(provideEffectContext),
    );

    return { success: true };
  });

export const useCreateBadmintonAssessmentMutation = () =>
  useMutation({
    mutationFn: ({
      data,
    }: {
      data: MatchingClientBodyType<"createBadmintonAssessmentV1">["inferIn"];
    }) => createBadmintonAssessmentServerFn({ data }),
  });

export const createTennisAssessmentServerFn = createServerFn({
  method: "POST",
})
  .validator((data: unknown) =>
    Effect.runSync(
      effectType(getMatchingClientBodyType("createTennisAssessmentV1"), data),
    ),
  )
  .handler(async ({ data }) => {
    const { access_token: accessToken } = parseCookies();

    if (!accessToken) {
      return { success: false };
    }

    await Effect.runPromise(
      Effect.gen(function* () {
        const matchingClient = yield* MatchingClient;
        return yield* matchingClient.createTennisAssessmentV1({
          body: data,
        });
      }).pipe(provideEffectContext),
    );

    return { success: true };
  });

export const useCreateTennisAssessmentMutation = () =>
  useMutation({
    mutationFn: ({
      data,
    }: {
      data: MatchingClientBodyType<"createTennisAssessmentV1">["inferIn"];
    }) => createTennisAssessmentServerFn({ data }),
  });

export const createRunningAssessmentServerFn = createServerFn({
  method: "POST",
})
  .validator((data: unknown) =>
    Effect.runSync(
      effectType(getMatchingClientBodyType("createRunningAssessmentV1"), data),
    ),
  )
  .handler(async ({ data }) => {
    const { access_token: accessToken } = parseCookies();

    if (!accessToken) {
      return { success: false };
    }

    await Effect.runPromise(
      Effect.gen(function* () {
        const matchingClient = yield* MatchingClient;
        return yield* matchingClient.createRunningAssessmentV1({
          body: data,
        });
      }).pipe(provideEffectContext),
    );

    return { success: true };
  });

export const useCreateRunningAssessmentMutation = () =>
  useMutation({
    mutationFn: ({
      data,
    }: {
      data: MatchingClientBodyType<"createRunningAssessmentV1">["inferIn"];
    }) => createRunningAssessmentServerFn({ data }),
  });
