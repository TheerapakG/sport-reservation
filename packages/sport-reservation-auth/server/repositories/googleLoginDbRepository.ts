import { Context } from "effect";
import { PlatformLoginDbRepository } from "./platformLoginDbRepository";

export class GoogleLoginDbRepository
  extends /*@__PURE__*/ Context.Tag("GoogleLoginDbRepository")<
    GoogleLoginDbRepository,
    Context.Tag.Service<typeof PlatformLoginDbRepository>
  >() {}
