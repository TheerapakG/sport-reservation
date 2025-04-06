import { Client } from "@openauthjs/openauth/client";
import { createSubjects } from "@openauthjs/openauth/subject";
import { type } from "arktype";

const user = type({
  id: "string",
  "name?": "string",
  "avatar?": "string",
  membership: "'free' | 'plus'",
});

export const subjects = createSubjects({
  user,
});

export const getSubjectsFromToken = async ({
  client,
  accessToken,
  refreshToken,
}: {
  client: Client;
  accessToken: string | undefined;
  refreshToken: string | undefined;
}) => {
  if (!accessToken) {
    return undefined;
  }

  const verified = await client.verify(subjects, accessToken, {
    refresh: refreshToken,
  });

  if (verified.err) {
    return undefined;
  }

  return verified.subject;
};

export const getSubjectTypeFromToken = async <T extends keyof typeof subjects>({
  type,
  client,
  accessToken,
  refreshToken,
}: {
  client: Client;
  type: T;
  accessToken: string | undefined;
  refreshToken: string | undefined;
}): Promise<(typeof subjects)[T]["infer"] | undefined> => {
  const tokenSubject = await getSubjectsFromToken({
    client,
    accessToken,
    refreshToken,
  });
  if (tokenSubject?.type !== type) {
    return undefined;
  }
  return tokenSubject.properties;
};
