import { Context } from "effect";
import { PlatformLoginDbRepository } from "./platformLoginDbRepository";

export class LineLoginDbRepository
  extends /*@__PURE__*/ Context.Tag("LineLoginDbRepository")<
    LineLoginDbRepository,
    Context.Tag.Service<typeof PlatformLoginDbRepository>
  >() {}
