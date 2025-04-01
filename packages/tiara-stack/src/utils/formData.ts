import { type } from "arktype";
import destr from "destr";
import { effectType } from "~~/dist/utils/effectType";

export const typedFormData = <T extends type.Any<Record<string, unknown>>>(
  _type: T,
  data: T["inferIn"],
) => {
  const formData = new FormData();
  for (const key in data) {
    formData.append(
      key,
      data[key] instanceof File ? data[key] : JSON.stringify(data[key]),
    );
  }
  return formData;
};

export const readTypedFormData = <T extends type.Any<Record<string, unknown>>>(
  type: T,
  formData: FormData,
) =>
  effectType(
    type,
    Object.fromEntries(
      [...formData.keys()].map((key) => [key, destr(formData.get(key))]),
    ),
  );
