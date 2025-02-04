import { it } from "@effect/vitest";
import { Effect, Exit, Layer } from "effect";
import { FetchError } from "tiara-stack/models/errors";
import { afterEach, assert, describe, expect, vi } from "vitest";
import { mockLineService, mockStorageService, StorageService } from "~/layers";
import { LineLoginApiRepository } from "./lineLoginApiRepository";
import { lineLoginApiRepositoryImpl } from "./lineLoginApiRepositoryImpl";

const { mocks, layer: mockLineServiceImpl } = await mockLineService();
const impl = lineLoginApiRepositoryImpl.pipe(
  Layer.provide(mockLineServiceImpl),
  Layer.provideMerge(mockStorageService),
);

const scopedStorage = Effect.acquireRelease(StorageService, ({ storage }) =>
  Effect.promise(async () => await storage.clear()),
);

describe("lineLoginApiRepository", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.layer(impl)((it) => {
    describe("generateRequest", () => {
      it.scoped("generate and store line login request", () =>
        Effect.gen(function* () {
          const lineLoginApiRepository = yield* LineLoginApiRepository;
          const result = yield* Effect.exit(
            lineLoginApiRepository.generateRequest(),
          );
          expect(result).toSatisfy((e) => Exit.isSuccess(e));
          const { state } = yield* result;

          const { storage } = yield* scopedStorage;
          const storageValue = yield* Effect.promise(
            async () => await storage.getItem(`request:line:${state}`),
          );

          assert(typeof storageValue === "object");
          assert(storageValue !== null);
          expect(yield* result).toMatchObject(storageValue);
        }),
      );
    });

    describe("getProfileByAuthToken", () => {
      it.scoped("fetch profile from line API", () =>
        Effect.gen(function* () {
          mocks.postGetUserProfile.mockImplementationOnce(
            ({ nonce }: { idToken: string; nonce: string }) => {
              return Effect.succeed({
                iss: "https://access.line.me/test",
                sub: "test_user_id",
                aud: "test_channel_id",
                exp: Date.now() / 1000 + 86400,
                iat: Date.now() / 1000,
                auth_time: Date.now() / 1000,
                nonce: nonce,
                amr: ["linesso"],
                name: "test_name",
                picture: "https://test_profile_image",
                email: "test_email@email.com",
              });
            },
          );

          const lineLoginApiRepository = yield* LineLoginApiRepository;
          const result = yield* Effect.exit(
            lineLoginApiRepository.getProfileByAuthToken({
              idToken: "test_id_token",
              nonce: "test_nonce",
            }),
          );

          expect(mocks.postGetUserProfile).toBeCalledTimes(1);
          expect(result).toSatisfy((e) => Exit.isSuccess(e));
          expect(yield* result).toMatchObject({
            id: "test_user_id",
            name: "test_name",
            avatar: "https://test_profile_image",
          });
        }),
      );

      it.scoped("bubble error from line API", () =>
        Effect.gen(function* () {
          mocks.postGetUserProfile.mockImplementationOnce(() => {
            return Effect.fail(new FetchError(undefined));
          });

          const lineLoginApiRepository = yield* LineLoginApiRepository;
          const result = yield* Effect.exit(
            lineLoginApiRepository.getProfileByAuthToken({
              idToken: "test_id_token",
              nonce: "test_nonce",
            }),
          );

          expect(mocks.postGetUserProfile).toBeCalledTimes(1);
          expect(result).toSatisfy((e) => Exit.isFailure(e));
        }),
      );
    });
  });
});
