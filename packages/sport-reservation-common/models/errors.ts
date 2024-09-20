import { FetchError as OFetchError } from "ofetch";

export class ArktypeError {
  readonly _tag = "TypeError";
}

export class FetchError {
  readonly _tag = "FetchError";

  constructor(readonly error: OFetchError) {}
}

export class ValkeyError {
  readonly _tag = "ValkeyError";
}
