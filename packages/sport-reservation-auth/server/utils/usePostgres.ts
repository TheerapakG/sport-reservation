export const usePostgres = () => {
  const config = useRuntimeConfig();
  return config.postgresUrl;
};
