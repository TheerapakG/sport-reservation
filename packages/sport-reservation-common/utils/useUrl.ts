export const useUrl = ({
  baseUrl,
  searchParams,
}: {
  baseUrl: string;
  searchParams: Record<string, string>;
}) => {
  const url = new URL(baseUrl);

  Object.entries(searchParams).forEach(([key, value]) =>
    url.searchParams.set(key, value),
  );

  return url;
};
