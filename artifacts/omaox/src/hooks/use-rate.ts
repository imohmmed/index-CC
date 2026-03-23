import { useGetExchangeRate } from "@workspace/api-client-react";

export function useRate() {
  const { data, isLoading } = useGetExchangeRate({
    query: {
      refetchInterval: 10000,
      staleTime: 5000,
    },
  });

  return {
    rate: data?.rate ?? 1320,
    ratePerHundred: data?.ratePerHundred ?? 132000,
    isLoading,
  };
}
