import { ArkErrors } from "arktype";
import { FetchError as OFetchError } from "ofetch";

export class ArktypeError {
  readonly _tag = "ArktypeError";

  constructor(readonly error: ArkErrors) {}
}

export const isArktypeError = (error: unknown): error is ArktypeError => {
  return Boolean(
    typeof error === "object" &&
      error &&
      "_tag" in error &&
      error._tag === "ArktypeError",
  );
};

export class FetchError {
  readonly _tag = "FetchError";

  constructor(readonly error: OFetchError) {}
}

export const isFetchError = (error: unknown): error is FetchError => {
  return Boolean(
    typeof error === "object" &&
      error &&
      "_tag" in error &&
      error._tag === "FetchError",
  );
};

export class S3Error {
  readonly _tag = "S3Error";

  constructor(readonly error: Error) {}
}

export const isS3Error = (error: unknown): error is S3Error => {
  return Boolean(
    typeof error === "object" &&
      error &&
      "_tag" in error &&
      error._tag === "S3Error",
  );
};

export class ValkeyError {
  readonly _tag = "ValkeyError";
}

export const isValkeyError = (error: unknown): error is ValkeyError => {
  return Boolean(
    typeof error === "object" &&
      error &&
      "_tag" in error &&
      error._tag === "ValkeyError",
  );
};
