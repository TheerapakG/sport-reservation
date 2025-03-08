import { ArkErrors } from "arktype";
import { FetchError as OFetchError } from "ofetch";

type BaseErrorType = Error | ArkErrors;

export class BaseError<ErrorType extends BaseErrorType = BaseErrorType> {
  readonly _type = "BaseError";

  constructor(
    readonly _tag: string,
    readonly error?: ErrorType,
  ) {}
}

export const isBaseError = (error: unknown): error is BaseError => {
  return Boolean(
    typeof error === "object" &&
      error &&
      "_type" in error &&
      error._type === "BaseError",
  );
};

export class OAuthError extends BaseError<Error> {
  constructor(error?: Error) {
    super("OAuthError", error);
  }
}

export const isOAuthError = (error: unknown): error is OAuthError => {
  return isBaseError(error) && error._tag === "OAuthError";
};

export class ArktypeError extends BaseError<ArkErrors> {
  constructor(error?: ArkErrors) {
    super("ArktypeError", error);
  }
}

export const isArktypeError = (error: unknown): error is ArktypeError => {
  return isBaseError(error) && error._tag === "ArktypeError";
};

export class MsgpackError extends BaseError<Error> {
  constructor(error?: Error) {
    super("MsgpackError", error);
  }
}

export const isMsgpackError = (error: unknown): error is MsgpackError => {
  return isBaseError(error) && error._tag === "MsgpackError";
};

export class FetchError extends BaseError<OFetchError> {
  constructor(error?: OFetchError) {
    super("FetchError", error);
  }
}

export const isFetchError = (error: unknown): error is FetchError => {
  return isBaseError(error) && error._tag === "FetchError";
};

export class S3Error extends BaseError<Error> {
  constructor(error?: Error) {
    super("S3Error", error);
  }
}

export const isS3Error = (error: unknown): error is S3Error => {
  return isBaseError(error) && error._tag === "S3Error";
};

export class ValkeyError extends BaseError<Error> {
  constructor(error?: Error) {
    super("ValkeyError", error);
  }
}

export const isValkeyError = (error: unknown): error is ValkeyError => {
  return isBaseError(error) && error._tag === "ValkeyError";
};
