import { Context } from "effect";
import { PlatformLoginDbRepository } from "./platformLoginDbRepository";

export class FacebookLoginDbRepository
  extends /*@__PURE__*/ Context.Tag("FacebookLoginDbRepository")<
    FacebookLoginDbRepository,
    Context.Tag.Service<typeof PlatformLoginDbRepository>
  >() {}
