import { ofetch } from "ofetch";
import { z } from "zod";
import { config } from "../config";

export const authFetch = ofetch.create({ baseURL: config.authBaseUrl });

export const authGet = async () => {
  return await z.string().parseAsync(await authFetch("/", { method: "GET" }));
};
