import ComboBoxField from "@/components/form/ComboBoxField";
import DatePickerField from "@/components/form/DatePickerField";
import FileInputField from "@/components/form/FileInputField";
import ListSelectInputField from "@/components/form/ListSelectInputField";
import ListTextInputField from "@/components/form/ListTextInputField";
import MultipleChoiceField from "@/components/form/MultipleChoiceField";
import NumericInputField from "@/components/form/NumericInputField";
import SelectInputField from "@/components/form/SelectInputField";
import SingleChoiceField from "@/components/form/SingleChoiceField";
import StandaloneComboBoxField from "@/components/form/StandaloneComboBoxField";
import StandaloneDatePickerField from "@/components/form/StandaloneDatePickerField";
import StandaloneFileInputField from "@/components/form/StandaloneFileInputField";
import StandaloneListSelectInputField from "@/components/form/StandaloneListSelectInputField";
import StandaloneListTextInputField from "@/components/form/StandaloneListTextInputField";
import StandaloneMultipleChoiceField from "@/components/form/StandaloneMultipleChoiceField";
import StandaloneNumericInputField from "@/components/form/StandaloneNumericInputField";
import StandaloneSelectInputField from "@/components/form/StandaloneSelectInputField";
import StandaloneSingleChoiceField from "@/components/form/StandaloneSingleChoiceField";
import StandaloneTextInputField from "@/components/form/StandaloneTextInputField";
import StandaloneTimePickerField from "@/components/form/StandaloneTimePickerField";
import TextInputField from "@/components/form/TextInputField";
import TimePickerField from "@/components/form/TimePickerField";
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
    MultipleChoiceField,
    TextInputField,
    ComboBoxField,
    DatePickerField,
    TimePickerField,
    FileInputField,
    ListSelectInputField,
    ListTextInputField,
    StandaloneNumericInputField,
    StandaloneSelectInputField,
    StandaloneSingleChoiceField,
    StandaloneMultipleChoiceField,
    StandaloneTextInputField,
    StandaloneComboBoxField,
    StandaloneDatePickerField,
    StandaloneTimePickerField,
    StandaloneFileInputField,
    StandaloneListSelectInputField,
    StandaloneListTextInputField,
  },
});
