import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { withForm } from "@/utils/form";
import { formOptions } from "@tanstack/react-form";

const formOpts = formOptions({
  defaultValues: {
    radius: 8,
    ageRange: [22, 27],
    gender: [] as ("male" | "female" | "prefer_not_to_say")[],
    objectives: [] as ("casual" | "competitive" | "fitness")[],
  },
});

export const MatchFilterModal = withForm({
  ...formOpts,
  props: {
    children: (<></>) as React.ReactNode,
  },
  render: ({ form, children }) => {
    return (
      <Dialog>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="w-full max-w-md">
          <DialogHeader className="bg-gradient-to-r from-[#65D1F8] to-[#6CCFD0] bg-clip-text text-2xl font-extrabold text-transparent sm:text-center">
            Match Filters
          </DialogHeader>
          <DialogDescription className="text-center text-lg text-gray-600">
            Being more personalized match with your type of person!
          </DialogDescription>
          <div className="space-y-6">
            {/* Radius of Location */}
            <form.AppField
              name="radius"
              children={(field) => (
                <field.RangeInputField
                  label="Radius of location"
                  min={2}
                  max={10}
                  stepSize={1}
                  trailingText="km"
                />
              )}
            />

            {/* Age Range */}
            <form.AppField
              name="ageRange"
              children={(field) => (
                <field.RangeInputField
                  label="Age Range"
                  min={18}
                  max={60}
                  stepSize={1}
                />
              )}
            />

            <form.AppField
              name="gender"
              children={(field) => (
                <field.MultipleChoiceField
                  label="Gender preferences"
                  spread
                  options={[
                    { label: "Male", value: "male" },
                    { label: "Female", value: "female" },
                    { label: "Prefer not to say", value: "prefer_not_to_say" },
                  ]}
                />
              )}
            />

            <form.AppField
              name="objectives"
              children={(field) => (
                <field.MultipleChoiceField
                  label="Objectives"
                  spread
                  options={[
                    { label: "Casual", value: "casual" },
                    { label: "Competitive", value: "competitive" },
                    { label: "Fitness", value: "fitness" },
                  ]}
                />
              )}
            />
          </div>

          <DialogFooter className="flex gap-4">
            <DialogClose asChild>
              <Button
                type="button"
                className="flex-1 rounded bg-gradient-to-r from-[#65D1F8] to-[#6CCFD0] px-4 py-1 text-white hover:opacity-90"
              >
                Apply filters
              </Button>
            </DialogClose>
            <Button
              className="flex-1 rounded-lg bg-gray-300 px-4 py-1 text-gray-600"
              onClick={() => form.reset()}
            >
              Reset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  },
});
