import NumericInputField from "@/components/form/NumericInputField";
import SelectInputField from "@/components/form/SelectInputField";
import SingleChoiceField from "@/components/form/SingleChoiceField";
import StandaloneNumericInputField from "@/components/form/StandaloneNumericInputField";
import StandaloneSelectInputField from "@/components/form/StandaloneSelectInputField";
import StandaloneSingleChoiceField from "@/components/form/StandaloneSingleChoiceField";
import StandaloneTextInputField from "@/components/form/StandaloneTextInputField";
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
    StandaloneNumericInputField,
    StandaloneSelectInputField,
    StandaloneSingleChoiceField,
    StandaloneTextInputField,
  },
});
