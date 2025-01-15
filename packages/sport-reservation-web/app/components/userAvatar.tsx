import { currentUserProfileQueryOptions } from "@/api/auth";
import {
  AvatarFallback as AvatarFallbackPrimitive,
  AvatarImage as AvatarImagePrimitive,
  Avatar as AvatarPrimitive,
} from "@/components/ui/avatar";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Suspense } from "react";
import { userProfile } from "sport-reservation-user/models";

const AvatarFallback = () => {
  return (
    <AvatarFallbackPrimitive>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="size-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
        />
      </svg>
    </AvatarFallbackPrimitive>
  );
};

const UserAvatarImageBase = ({
  profile,
}: {
  profile: typeof userProfile.infer;
}) => {
  return profile.avatar ? (
    <AvatarImagePrimitive src={profile.avatar}></AvatarImagePrimitive>
  ) : profile.name ? (
    <AvatarFallbackPrimitive>
      {profile.name.slice(0, 2)}
    </AvatarFallbackPrimitive>
  ) : (
    <AvatarFallback />
  );
};

const CurrentUserAvatarImage = () => {
  const currentUserProfileQuery = useSuspenseQuery(
    currentUserProfileQueryOptions(),
  );

  return currentUserProfileQuery.data.profile ? (
    <UserAvatarImageBase profile={currentUserProfileQuery.data.profile} />
  ) : (
    <AvatarFallback />
  );
};

const CurrentUserAvatar = () => {
  return (
    <AvatarPrimitive>
      <Suspense fallback={<AvatarFallback />}>
        <CurrentUserAvatarImage />
      </Suspense>
    </AvatarPrimitive>
  );
};

const NavUserAvatarImage = () => {
  const currentUserProfileQuery = useSuspenseQuery(
    currentUserProfileQueryOptions(),
  );

  return currentUserProfileQuery.data.profile ? (
    <UserAvatarImageBase profile={currentUserProfileQuery.data.profile} />
  ) : (
    <Link to="/login">
      <AvatarFallback />
    </Link>
  );
};

const NavUserAvatar = () => {
  return (
    <AvatarPrimitive>
      <Suspense fallback={<AvatarFallback />}>
        <NavUserAvatarImage />
      </Suspense>
    </AvatarPrimitive>
  );
};

export { CurrentUserAvatar, NavUserAvatar };
