import { Cause, Context, Effect } from "effect";
import z from "zod";
import { lineRequest } from "~~/models/line";

export class LineLoginRepository extends Context.Tag("LineLoginRepository")<
  LineLoginRepository,
  {
    generateRequest: () => Effect.Effect<
      z.infer<typeof lineRequest>,
      Cause.UnknownException
    >;
  }
>() {}
