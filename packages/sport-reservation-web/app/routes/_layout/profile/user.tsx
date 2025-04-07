import {
  getCurrentUserProfileQueryOptions,
  useAssociateLocationMutation,
  useAssociateObjectiveMutation,
  useAssociateSportMutation,
  useDissociateLocationMutation,
  useDissociateObjectiveMutation,
  useDissociateSportMutation,
  useUpdateCurrentUserProfileMutation,
} from "@/api/user";
import MatchingCardComponent from "@/components/matching/MatchingCardComponent";
import { useAppForm } from "@/utils/form";
import { objectives, objectivesList } from "@/utils/lookup/objective";
import { sports, sportsList } from "@/utils/lookup/sport";
import { useStore } from "@tanstack/react-form";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { type } from "arktype";

function IndexComponent() {
  const currentUserProfile = useSuspenseQuery(
    getCurrentUserProfileQueryOptions(),
  );

  const updateCurrentUserProfileMutation =
    useUpdateCurrentUserProfileMutation();

  const associateLocationMutation = useAssociateLocationMutation();
  const associateObjectiveMutation = useAssociateObjectiveMutation();
  const associateSportMutation = useAssociateSportMutation();

  const dissociateLocationMutation = useDissociateLocationMutation();
  const dissociateObjectiveMutation = useDissociateObjectiveMutation();
  const dissociateSportMutation = useDissociateSportMutation();

  const currentUser = currentUserProfile.data.profile;

  const form = useAppForm({
    defaultValues: {
      name: currentUser?.name,
      birthDate: currentUser?.birthDate
        ? new Date(currentUser.birthDate)
        : undefined,
      sports: currentUser?.sports.map((sport) => ({
        id: sport.sportId,
        label: sports[sport.sportType].label,
        value: sport.sportType,
      })) as {
        id: string | undefined;
        label: string;
        value: NonNullable<typeof currentUser>["sports"][number]["sportType"];
      }[],
      objectives: currentUser?.objectives.map((objective) => ({
        id: objective.objectiveId,
        label: objectives[objective.objectiveType].label,
        value: objective.objectiveType,
      })) as {
        id: string | undefined;
        label: string;
        value: NonNullable<
          typeof currentUser
        >["objectives"][number]["objectiveType"];
      }[],
      availability: currentUser?.availability,
      locations: currentUser?.locations.map((location) => ({
        id: location.locationId,
        value: location.locationDescription,
      })) as { id: string | undefined; value: string | undefined }[],
    },
    onSubmit: ({ value }) => {
      updateCurrentUserProfileMutation.mutate({
        data: {
          name: value.name,
          birthDate: value.birthDate?.toISOString(),
        },
      });

      const removedSports = currentUser?.sports.filter(
        (sport) => !value.sports?.some((s) => s.id === sport.sportId),
      );
      const removedObjectives = currentUser?.objectives.filter(
        (objective) =>
          !value.objectives?.some((o) => o.id === objective.objectiveId),
      );
      const removedLocations = currentUser?.locations.filter(
        (location) =>
          !value.locations?.some((l) => l.id === location.locationId),
      );

      const addedSports = value.sports.filter(
        (sport) => sport.id === undefined,
      );
      const addedObjectives = value.objectives.filter(
        (objective) => objective.id === undefined,
      );
      const addedLocations = value.locations.filter(
        (location) => location.id === undefined,
      );

      if (removedSports && removedSports.length > 0) {
        dissociateSportMutation.mutate({
          data: { sportIds: removedSports.map((sport) => sport.sportId) },
        });
      }

      if (removedObjectives && removedObjectives.length > 0) {
        dissociateObjectiveMutation.mutate({
          data: {
            objectiveIds: removedObjectives.map(
              (objective) => objective.objectiveId,
            ),
          },
        });
      }

      if (removedLocations && removedLocations.length > 0) {
        dissociateLocationMutation.mutate({
          data: {
            locationIds: removedLocations.map(
              (location) => location.locationId,
            ),
          },
        });
      }

      if (addedSports && addedSports.length > 0) {
        associateSportMutation.mutate({
          data: {
            sports: addedSports.map((sport) => ({ sportType: sport.value })),
          },
        });
      }

      if (addedObjectives && addedObjectives.length > 0) {
        associateObjectiveMutation.mutate({
          data: {
            objectives: addedObjectives.map((objective) => ({
              objectiveType: objective.value,
            })),
          },
        });
      }

      if (addedLocations && addedLocations.length > 0) {
        associateLocationMutation.mutate({
          data: {
            locations: addedLocations.map((location) => ({
              locationDescription: location.value,
            })),
          },
        });
      }
    },
  });

  const formValues = useStore(form.store, (state) => state.values);

  const mergedCurrentUserWithFormValues = currentUser
    ? {
        ...currentUser,
        name: formValues.name,
        birthDate: formValues.birthDate?.toISOString(),
        sports:
          formValues.sports?.map((sport) => ({
            sportId: sport.id ?? "",
            sportType: sport.value,
          })) ?? [],
        objectives:
          formValues.objectives?.map((objective) => ({
            objectiveId: objective.id ?? "",
            objectiveType: objective.value,
          })) ?? [],
        availability: formValues.availability,
        locations:
          formValues.locations?.map((location) => ({
            locationId: location.id ?? "",
            locationDescription: location.value,
          })) ?? [],
      }
    : undefined;

  if (!currentUserProfile.data?.profile) {
    return <div>No profile found</div>;
  }

  return (
    <form className="relative flex min-h-screen flex-col items-center justify-center gap-y-4 p-4">
      <div className="flex items-center justify-center gap-x-8">
        {mergedCurrentUserWithFormValues && (
          <div className="flex items-center justify-center gap-x-4">
            <MatchingCardComponent
              user={mergedCurrentUserWithFormValues}
              matchedUser={mergedCurrentUserWithFormValues}
            />
            <MatchingCardComponent
              user={mergedCurrentUserWithFormValues}
              matchedUser={mergedCurrentUserWithFormValues}
              flipped={true}
            />
          </div>
        )}
        <div className="flex w-96 flex-col gap-y-4">
          <form.AppField
            name="name"
            validators={{ onBlur: type("string") }}
            children={(field) => <field.TextInputField label="Name" />}
          />
          <form.AppField
            name="birthDate"
            validators={{ onBlur: type("Date") }}
            children={(field) => <field.DatePickerField label="Birthdate" />}
          />
          <form.AppField
            name="sports"
            children={(field) => (
              <field.ListSelectInputField
                label="Sport Interests"
                options={sportsList}
                style="badge"
              />
            )}
          />
          <form.AppField
            name="objectives"
            children={(field) => (
              <field.ListSelectInputField
                label="Why I'm here..."
                options={objectivesList}
                style="badge"
              />
            )}
          />
          <form.AppField
            name="availability"
            children={(field) => (
              <field.TextInputField label="Preferred Play Time" />
            )}
          />
          <form.AppField
            name="locations"
            children={(field) => (
              <field.ListTextInputField label="Preferred Locations" />
            )}
          />
        </div>
      </div>
      <form.Subscribe
        selector={(state) => [state.canSubmit, state.isSubmitting]}
        children={([canSubmit, isSubmitting]) => (
          <div className="mt-6 flex justify-center space-x-4">
            <button
              type="submit"
              disabled={!canSubmit}
              className="rounded bg-gradient-to-r from-[#65D1F8] to-[#6CCFD0] px-4 py-2 text-white hover:opacity-90"
            >
              {isSubmitting ? "Saving..." : "Save"}
            </button>
          </div>
        )}
      />
    </form>
  );
}

export const Route = createFileRoute("/_layout/profile/user")({
  component: IndexComponent,
});
