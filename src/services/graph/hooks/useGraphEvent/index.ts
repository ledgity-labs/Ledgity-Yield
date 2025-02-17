import { useQuery } from "@tanstack/react-query";
import { useCurrentChain } from "@/hooks/useCurrentChain";
import {
  graphClientWithChain,
  ChainId,
} from "@/services/graph/requests/client";

export function useGraphEvent(query: string, variables: any): any {
  const chain = useCurrentChain();
  return useQuery({
    queryKey: [query, chain?.id],
    queryFn: () => {
      return graphClientWithChain(chain?.id as ChainId).request(
        query,
        variables,
      );
    },
  });
}
