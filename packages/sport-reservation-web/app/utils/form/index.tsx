import NumericInputField from "@/components/form/NumericInputField";
import SelectInputField from "@/components/form/SelectInputField";
import SingleChoiceField from "@/components/form/SingleChoiceField";
import TextInputField from "@/components/form/TextInputField";
import { createFormHook } from "@tanstack/react-form";
import { fieldContext, formContext } from "./context";

export const { useAppForm, withForm } = createFormHook({
  formContext,
  fieldContext,
  formComponents: {},
  fieldComponents: {
    NumericInputField,
    SelectInputField,
    SingleChoiceField,
    TextInputField,
  },
});
