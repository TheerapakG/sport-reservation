import { Effect, Layer, pipe } from "effect";
import { FetchError } from "sport-reservation-common/models/errors";
import { afterEach, describe, expect, test, vi } from "vitest";
import { mockLineService, mockStorageService, StorageService } from "~/layers";
import { LineLoginApiRepository } from "./lineLoginApiRepository";
import { lineLoginApiRepositoryImpl } from "./lineLoginApiRepositoryImpl";

const { mocks, layer: mockLineServiceImpl } = await mockLineService();
const impl = lineLoginApiRepositoryImpl.pipe(
  Layer.provide(mockLineServiceImpl),
  Layer.provideMerge(mockStorageService),
);

const runImpl = async <A, E>(
  effect: Effect.Effect<A, E, LineLoginApiRepository>,
) => {
  return await Effect.runPromise(pipe(effect, Effect.provide(impl)));
};

describe("lineLoginApiRepository", () => {
  afterEach(async () => {
    await Effect.runPromise(
      pipe(
        Effect.gen(function* () {
          const { storage } = yield* StorageService;
          yield* Effect.promise(async () => await storage.clear());
        }),
        Effect.provide(impl),
      ),
    );
    vi.restoreAllMocks();
  });

  describe("generateRequest", () => {
    test("generate and store line login request", async () => {
      const resultPromise = runImpl(
        Effect.gen(function* () {
          const lineLoginApiRepository = yield* LineLoginApiRepository;
          return yield* lineLoginApiRepository.generateRequest();
        }),
      );
      await expect(resultPromise).resolves.toBeDefined();
      const result = await resultPromise;
      const { state } = result;

      const storagePromise = Effect.runPromise(
        pipe(
          Effect.gen(function* () {
            const { storage } = yield* StorageService;
            return yield* Effect.promise(
              async () =>
                await storage.getItem<{
                  nonce: string;
                  codeVerifier: string;
                }>(`request:line:${state}`),
            );
          }),
          Effect.provide(impl),
        ),
      );
      await expect(storagePromise).resolves.toBeDefined();
      const storage = (await storagePromise)!;

      await expect(result).toMatchObject(storage);
    });
  });

  describe("getProfileByAuthToken", () => {
    test("fetch profile from line API", async () => {
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

      await expect(
        runImpl(
          Effect.gen(function* () {
            const lineLoginApiRepository = yield* LineLoginApiRepository;
            return yield* lineLoginApiRepository.getProfileByAuthToken({
              idToken: "test_id_token",
              nonce: "test_nonce",
            });
          }),
        ),
      ).resolves.toBeDefined();

      expect(mocks.postGetUserProfile).toBeCalledTimes(1);
    });

    test("bubble error from line API", async () => {
      mocks.postGetUserProfile.mockImplementationOnce(() => {
        return Effect.fail(new FetchError(undefined));
      });

      await expect(
        runImpl(
          Effect.gen(function* () {
            const lineLoginApiRepository = yield* LineLoginApiRepository;
            return yield* lineLoginApiRepository.getProfileByAuthToken({
              idToken: "test_id_token",
              nonce: "test_nonce",
            });
          }),
        ),
      ).rejects.toBeDefined();

      expect(mocks.postGetUserProfile).toBeCalledTimes(1);
    });
  });
});
