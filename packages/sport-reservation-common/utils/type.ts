import { type } from "arktype";

export const anyObjectType = type({});
export const unknownType = type("unknown");
export const stringRecordType = type({ "[string]": "string" });
