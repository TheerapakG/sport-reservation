import { ArkErrors, type } from "arktype";
import "dotenv/config";
import { is, sql, Table } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import {
  AbstractGenerator,
  GenerateUniqueInt,
  generatorsMap,
  lastNames,
  reset,
  seed,
} from "drizzle-seed";
import postgres from "postgres";
import {
  authUserEmailConnection,
  authUserEmailConnectionRelations,
  authUserFacebookConnection,
  authUserFacebookConnectionRelations,
  authUserGoogleConnection,
  authUserGoogleConnectionRelations,
  authUserLineConnection,
  authUserLineConnectionRelations,
  clubClub,
  clubClubRelations,
  userObjective,
  userObjectiveCategory,
  userObjectiveCategoryRelations,
  userObjectiveRelations,
  userSport,
  userSportRelations,
  userUserGroup,
  userUserGroupMember,
  userUserGroupMemberRelations,
  userUserGroupRelations,
  userUserProfile,
  userUserProfileObjective,
  userUserProfileObjectiveRelations,
  userUserProfileRelations,
  userUserProfileSport,
  userUserProfileSportRelations,
} from "./src/schema";

const env = type({ POSTGRES_URL: "string" })(process.env);
if (env instanceof ArkErrors) {
  console.error(env);
  throw env;
}
const safeEnv = env;

type DerivedGeneratorParams = {
  isUnique?: boolean;
  notNull?: boolean;
  dataType?: string;
  arraySize?: number;
  baseColumnDataType?: string;
  stringLength?: number;
  weightedCountSeed?: number;
  maxRepeatedValuesCount?: number;
};

abstract class AbstractDerivedGenerator<T> extends AbstractGenerator<
  DerivedGeneratorParams & T
> {
  static override readonly entityKind: string = "AbstractDerivedGenerator";

  public constructor(params: DerivedGeneratorParams & T) {
    super(params);
    this.isUnique = params.isUnique ?? false;
    this.notNull = params.notNull ?? false;
    this.dataType = params.dataType;
    this.arraySize = params.arraySize;
    this.baseColumnDataType = params.baseColumnDataType;
    this.stringLength = params.stringLength;
    this.weightedCountSeed = params.weightedCountSeed;
  }
}

type CachedGeneratorParams<T> = {
  baseGenerator: AbstractGenerator<T>;
  cachedValues: unknown[];
};

class CachedGenerator<T> extends AbstractDerivedGenerator<
  CachedGeneratorParams<T>
> {
  static override readonly entityKind: string = "CachedGenerator";

  public constructor(
    params: Omit<CachedGeneratorParams<T>, "cachedValues"> & {
      cachedValues?: unknown[];
    },
  ) {
    const derivedParams = {
      baseGenerator: params.baseGenerator,
      cachedValues: params.cachedValues ?? [],
      isUnique: params.baseGenerator.isUnique,
      notNull: params.baseGenerator.notNull,
      dataType: params.baseGenerator.dataType,
      arraySize: params.baseGenerator.arraySize,
      baseColumnDataType: params.baseGenerator.baseColumnDataType,
      stringLength: params.baseGenerator.stringLength,
      weightedCountSeed: params.baseGenerator.weightedCountSeed,
    };
    super(derivedParams);
  }

  override init({ count, seed }: { count: number; seed: number }) {
    this.params.baseGenerator.init({ count, seed });
  }

  public override generate({ i }: { i: number }) {
    const value = this.params.baseGenerator.generate({ i });
    this.params.cachedValues.push(value);
    return value;
  }
}
generatorsMap.CachedGenerator = [CachedGenerator];

const createCachedGenerator = <T>(baseGenerator: AbstractGenerator<T>) => {
  return new CachedGenerator<T>({ baseGenerator });
};

type ForkedGeneratorParams = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  forkableGenerator: AbstractForkableGenerator<any>;
  genIdx: number;
};

class ForkedGenerator extends AbstractDerivedGenerator<ForkedGeneratorParams> {
  static override readonly entityKind: string = "ForkedGenerator";

  public state: { idx: number } = { idx: 0 };

  public constructor(params: ForkedGeneratorParams & DerivedGeneratorParams) {
    super(params);
  }

  override init({ count, seed }: { count: number; seed: number }) {
    this.params.forkableGenerator.init({ count, seed });
  }

  public override generate({ i }: { i: number }) {
    if (this.state.idx === this.params.forkableGenerator.cachedValues.length) {
      this.params.forkableGenerator.generate({ i });
    }
    const result =
      this.params.forkableGenerator.cachedValues[this.state.idx][
        this.params.genIdx
      ];
    this.state.idx = this.state.idx + 1;
    return result;
  }
}
generatorsMap.ForkedGenerator = [ForkedGenerator];

abstract class AbstractForkableGenerator<T> extends AbstractGenerator<T> {
  public cachedValues: (readonly unknown[])[] = [];
  public forkedGeneratorParams: DerivedGeneratorParams[] = [];

  public getForkedGenerator(genIdx: number) {
    return new ForkedGenerator({
      forkableGenerator: this,
      genIdx,
      ...this.forkedGeneratorParams[genIdx],
    });
  }

  public getAllForkedGenerators() {
    return this.forkedGeneratorParams.map((_, genIdx) =>
      this.getForkedGenerator(genIdx),
    );
  }
}

type ForkableUniqueCachedValuesParams = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  generators: CachedGenerator<any>[];
};

class ForkableUniqueCachedValues extends AbstractForkableGenerator<ForkableUniqueCachedValuesParams> {
  static override readonly entityKind: string = "ForkableUniqueCachedValues";

  public state?: { genIndicesObj: GenerateUniqueInt };

  public constructor(params: ForkableUniqueCachedValuesParams) {
    super(params);
    this.forkedGeneratorParams = params.generators.map((g) => ({
      isUnique: g.isUnique,
      notNull: g.notNull,
      dataType: g.dataType,
      arraySize: g.arraySize,
      baseColumnDataType: g.baseColumnDataType,
      stringLength: g.stringLength,
      weightedCountSeed: g.weightedCountSeed,
    }));
  }

  override init({ count, seed }: { count: number; seed: number }) {
    if (this.state !== undefined) {
      return;
    }

    const maxUniqueValues = this.params.generators.reduce((acc, curr) => {
      return acc * curr.params.cachedValues.length;
    }, 1);

    this.state = {
      genIndicesObj: new GenerateUniqueInt({
        minValue: 0,
        maxValue: maxUniqueValues - 1,
      }),
    };

    this.state.genIndicesObj.init({ count, seed });
  }

  generate() {
    if (this.state === undefined) {
      throw new Error("state is not defined.");
    }

    const valuesIdx = this.state.genIndicesObj.generate() as number;
    const [values] = this.params.generators.reduce(
      ([acc, valuesIdx]: [readonly unknown[], number], curr) => {
        return [
          [
            ...acc,
            curr.params.cachedValues[
              valuesIdx % curr.params.cachedValues.length
            ],
          ],
          Math.floor(valuesIdx / curr.params.cachedValues.length),
        ] as const;
      },
      [[], valuesIdx] as const,
    );
    this.cachedValues.push(values);
    return values;
  }
}
generatorsMap.ForkableUniqueCachedValues = [ForkableUniqueCachedValues];

const createForkableUniqueCachedValues = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  generators: CachedGenerator<any>[],
) => {
  return new ForkableUniqueCachedValues({ generators });
};

type ForkableDefaultParams = {
  defaultValues: unknown[][];
  derivedGeneratorParams: DerivedGeneratorParams[];
};
class ForkableDefault extends AbstractForkableGenerator<ForkableDefaultParams> {
  static override readonly entityKind: string = "ForkableDefault";

  public state: { idx: number } = { idx: 0 };

  public constructor(params: ForkableDefaultParams) {
    super(params);
    this.forkedGeneratorParams = params.derivedGeneratorParams;
  }

  public override generate() {
    const value =
      this.params.defaultValues[
        this.state.idx % this.params.defaultValues.length
      ];
    this.state.idx = this.state.idx + 1;
    this.cachedValues.push(value);
    return value;
  }
}
generatorsMap.ForkableDefault = [ForkableDefault];

const createForkableDefault = (
  defaultValues: unknown[][],
  derivedGeneratorParams: DerivedGeneratorParams[],
) => {
  return new ForkableDefault({ defaultValues, derivedGeneratorParams });
};

type ForkableRandomDefaultParams = {
  defaultValues: unknown[][];
  derivedGeneratorParams: DerivedGeneratorParams[];
};
class ForkableRandomDefault extends AbstractForkableGenerator<ForkableRandomDefaultParams> {
  static override readonly entityKind: string = "ForkableRandomDefault";

  public state?: { genIndicesObj: GenerateUniqueInt };

  public constructor(params: ForkableRandomDefaultParams) {
    super(params);
    this.forkedGeneratorParams = params.derivedGeneratorParams;
  }

  override init({ count, seed }: { count: number; seed: number }) {
    if (this.state !== undefined) {
      return;
    }

    const maxUniqueValues = this.params.defaultValues.length;

    this.state = {
      genIndicesObj: new GenerateUniqueInt({
        minValue: 0,
        maxValue: maxUniqueValues - 1,
      }),
    };

    this.state.genIndicesObj.init({ count, seed });
  }

  generate() {
    if (this.state === undefined) {
      throw new Error("state is not defined.");
    }
    const value =
      this.params.defaultValues[this.state.genIndicesObj.generate() as number];
    this.cachedValues.push(value);
    return value;
  }
}
generatorsMap.ForkableRandomDefault = [ForkableRandomDefault];

const createForkableRandomDefault = (
  defaultValues: unknown[][],
  derivedGeneratorParams: DerivedGeneratorParams[],
) => {
  return new ForkableRandomDefault({ defaultValues, derivedGeneratorParams });
};

type ZipForkableParams = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  generators: AbstractForkableGenerator<any>[];
};

class ZipForkable extends AbstractForkableGenerator<ZipForkableParams> {
  static override readonly entityKind: string = "ZipForkable";

  public state: { idx: number } = { idx: 0 };

  public constructor(params: ZipForkableParams) {
    super(params);
    this.forkedGeneratorParams = params.generators.flatMap(
      (g) => g.forkedGeneratorParams,
    );
  }

  override init({ count, seed }: { count: number; seed: number }) {
    this.params.generators.forEach((g) => {
      g.init({ count, seed });
    });
  }

  generate({ i }: { i: number }) {
    this.params.generators.forEach((g) => {
      if (this.state.idx === g.cachedValues.length) {
        g.generate({ i });
      }
    });
    const result = this.params.generators.flatMap(
      (g) => g.cachedValues[this.state.idx],
    );
    this.state.idx = this.state.idx + 1;
    this.cachedValues.push(result);
    return result;
  }
}
generatorsMap.ZipForkable = [ZipForkable];

const createZipForkable = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  generators: AbstractForkableGenerator<any>[],
) => {
  return new ZipForkable({ generators });
};

async function main() {
  const db = drizzle({ client: postgres(safeEnv.POSTGRES_URL) });
  const schema = {
    userUserProfile,
    userUserProfileRelations,
    userSport,
    userSportRelations,
    userUserProfileSport,
    userUserProfileSportRelations,
    userObjectiveCategory,
    userObjectiveCategoryRelations,
    userObjective,
    userObjectiveRelations,
    userUserProfileObjective,
    userUserProfileObjectiveRelations,
    clubClub,
    clubClubRelations,
    userUserGroup,
    userUserGroupRelations,
    userUserGroupMember,
    userUserGroupMemberRelations,
  };
  const resetSchema = {
    authUserEmailConnection,
    authUserEmailConnectionRelations,
    authUserLineConnection,
    authUserLineConnectionRelations,
    authUserGoogleConnection,
    authUserGoogleConnectionRelations,
    authUserFacebookConnection,
    authUserFacebookConnectionRelations,
    ...schema,
  };
  await reset(db, resetSchema);
  console.log("seeding");
  await seed(db, schema).refine((funcs) => {
    const userProfilePublicId = createCachedGenerator(funcs.uuid());

    const sportTypes = [["badminton"], ["tennis"], ["running"]];
    const [sportSportType] = createForkableDefault(sportTypes, [
      { isUnique: true },
    ]).getAllForkedGenerators();
    const sportPublicId = createCachedGenerator(funcs.uuid());

    const [
      forkedUserProfileSportUserProfilePublicId,
      forkedUserProfileSportSportPublicId,
    ] = createForkableUniqueCachedValues([
      userProfilePublicId,
      sportPublicId,
    ]).getAllForkedGenerators();

    const objectiveCategoryTypes = [
      ["just_for_fun", "casual"],
      ["easygoing_games", "casual"],
      ["good_vibes_only", "casual"],
      ["no_pressure_just_play", "casual"],
      ["here_to_enjoy", "casual"],
      ["relax_rally", "casual"],
      ["casual_matches", "casual"],
      ["train_improve", "competitive"],
      ["bring_the_heat", "competitive"],
      ["love_a_tough_match", "competitive"],
      ["lets_push_limits", "competitive"],
      ["winning_mindset", "competitive"],
      ["serious_play", "competitive"],
      ["always_leveling_up", "competitive"],
      ["stay_fit_have_fun", "fitness"],
      ["game_workout", "fitness"],
      ["sweat_play", "fitness"],
      ["sports_my_gym", "fitness"],
      ["meet_new_friends", "social"],
      ["social_sporty", "social"],
      ["looking_for_teammates", "social"],
      ["here_to_connect", "social"],
      ["sports_smiles", "social"],
      ["join_my_club", "social"],
      ["game_chill", "social"],
      ["flexible_open_to_anything", "social"],
      ["casual_or_serious", "social"],
      ["mix_of_fun_competition", "social"],
    ];
    const [objectiveCategoryObjectiveType, objectiveCategoryCategoryType] =
      createForkableDefault(objectiveCategoryTypes, [
        { isUnique: true },
        {},
      ]).getAllForkedGenerators();

    const [objectiveObjectiveType] = createForkableDefault(
      objectiveCategoryTypes,
      [{ isUnique: true }, {}],
    ).getAllForkedGenerators();
    const objectivePublicId = createCachedGenerator(funcs.uuid());

    const [
      forkedUserProfileObjectiveUserProfilePublicId,
      forkedUserProfileObjectiveObjectivePublicId,
    ] = createForkableUniqueCachedValues([
      userProfilePublicId,
      objectivePublicId,
    ]).getAllForkedGenerators();

    const clubGroupId = createCachedGenerator(funcs.uuid());
    const clubCount = 30;

    const [
      forkedUserUserGroupPublicId,
      forkedUserUserGroupCreator,
      forkedUserUserGroupType,
      forkedUserUserGroupName,
    ] = createZipForkable([
      createForkableUniqueCachedValues([clubGroupId]),
      createForkableUniqueCachedValues([userProfilePublicId]),
      createForkableDefault([["club"]], [{}]),
      createForkableRandomDefault(
        lastNames
          .flatMap((l) => [`Club ${l}`, `${l}'s Club`, `${l}'s Sports Club`])
          .map((l) => [l]),
        [{}],
      ),
    ]).getAllForkedGenerators();

    return {
      userUserProfile: {
        columns: {
          id: funcs.intPrimaryKey(),
          publicId: userProfilePublicId,
          name: funcs.fullName(),
          avatar: funcs.valuesFromArray({
            values: [
              "/user/avatar/beth.jpeg",
              "/user/avatar/butter_bear.png",
              "/user/avatar/lisa.png",
              "/user/avatar/sarah-lee.png",
              "/user/avatar/victoria-k.png",
            ],
          }),
          availability: funcs.valuesFromArray({
            values: ["06:00-08:00", "08:00-10:00", "10:00-12:00"],
          }),
          gender: funcs.valuesFromArray({
            values: ["male", "female", "prefer_not_to_say"],
          }),
          membership: funcs.valuesFromArray({ values: ["free", "plus"] }),
          birthDate: funcs.date({
            minDate: new Date("1985-01-01"),
            maxDate: new Date("2005-01-01"),
          }),
          createdAt: funcs.default({
            defaultValue: new Date(),
          }),
          updatedAt: funcs.default({
            defaultValue: new Date(),
          }),
          deletedAt: funcs.default({
            defaultValue: null,
          }),
        },
        count: 100,
      },
      userSport: {
        columns: {
          id: funcs.intPrimaryKey(),
          publicId: sportPublicId,
          sportType: sportSportType,
          createdAt: funcs.default({
            defaultValue: new Date(),
          }),
          updatedAt: funcs.default({
            defaultValue: new Date(),
          }),
          deletedAt: funcs.default({
            defaultValue: null,
          }),
        },
        count: sportTypes.length,
      },
      userUserProfileSport: {
        columns: {
          id: funcs.intPrimaryKey(),
          userId: forkedUserProfileSportUserProfilePublicId,
          sportId: forkedUserProfileSportSportPublicId,
          createdAt: funcs.default({
            defaultValue: new Date(),
          }),
          updatedAt: funcs.default({
            defaultValue: new Date(),
          }),
          deletedAt: funcs.default({
            defaultValue: null,
          }),
        },
        count: 100,
      },
      userObjectiveCategory: {
        columns: {
          id: funcs.intPrimaryKey(),
          objectiveType: objectiveCategoryObjectiveType,
          categoryType: objectiveCategoryCategoryType,
          createdAt: funcs.default({
            defaultValue: new Date(),
          }),
          updatedAt: funcs.default({
            defaultValue: new Date(),
          }),
          deletedAt: funcs.default({
            defaultValue: null,
          }),
        },
        count: objectiveCategoryTypes.length,
      },
      userObjective: {
        columns: {
          id: funcs.intPrimaryKey(),
          publicId: objectivePublicId,
          objectiveType: objectiveObjectiveType,
          createdAt: funcs.default({
            defaultValue: new Date(),
          }),
          updatedAt: funcs.default({
            defaultValue: new Date(),
          }),
          deletedAt: funcs.default({
            defaultValue: null,
          }),
        },
        count: objectiveCategoryTypes.length,
      },
      userUserProfileObjective: {
        columns: {
          id: funcs.intPrimaryKey(),
          userId: forkedUserProfileObjectiveUserProfilePublicId,
          objectiveId: forkedUserProfileObjectiveObjectivePublicId,
          createdAt: funcs.default({
            defaultValue: new Date(),
          }),
          updatedAt: funcs.default({
            defaultValue: new Date(),
          }),
          deletedAt: funcs.default({
            defaultValue: null,
          }),
        },
        count: 400,
      },
      clubClub: {
        columns: {
          id: funcs.intPrimaryKey(),
          groupId: clubGroupId,
          image: funcs.default({
            defaultValue: "/asset/club/badminton-default.jpg",
          }),
          description: funcs.loremIpsum({ sentencesCount: 4 }),
          location: funcs.default({
            defaultValue: null,
          }),
          locationDescription: funcs.streetAddress(),
          createdAt: funcs.default({
            defaultValue: new Date(),
          }),
          updatedAt: funcs.default({
            defaultValue: new Date(),
          }),
          deletedAt: funcs.default({
            defaultValue: null,
          }),
        },
        count: clubCount,
      },
      userUserGroup: {
        columns: {
          id: funcs.intPrimaryKey(),
          publicId: forkedUserUserGroupPublicId,
          creatorId: forkedUserUserGroupCreator,
          name: forkedUserUserGroupName,
          type: forkedUserUserGroupType,
          createdAt: funcs.default({
            defaultValue: new Date(),
          }),
          updatedAt: funcs.default({
            defaultValue: new Date(),
          }),
          deletedAt: funcs.default({
            defaultValue: null,
          }),
        },
        count: clubCount,
      },
    };
  });
  await db.transaction(async (tx) => {
    await Promise.all(
      Object.entries(resetSchema).map(async ([_, table]) => {
        if (is(table, Table)) {
          await tx.execute(
            sql`SELECT setval(pg_get_serial_sequence('${table.getSQL()}', 'id'), coalesce(max(id), 0) + 1, false) FROM ${table.getSQL()}`,
          );
        }
      }),
    );
  });
  console.log("seeded");
  process.exit(0);
}
main();
