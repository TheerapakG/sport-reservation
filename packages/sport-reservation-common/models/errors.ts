import { ArkErrors } from "arktype";
import { FetchError as OFetchError } from "ofetch";

export class ArktypeError {
  readonly _tag = "TypeError";

  constructor(readonly error: ArkErrors) {}
}

export class FetchError {
  readonly _tag = "FetchError";

  constructor(readonly error: OFetchError) {}
}

export class S3Error {
  readonly _tag = "S3Error";

  constructor(readonly error: Error) {}
}

export class ValkeyError {
  readonly _tag = "ValkeyError";
}
