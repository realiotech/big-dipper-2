import { useEffect, useState } from 'react';
import { useChainParamsQuery } from '@/graphql/types/general_types';

/** GET a chain REST endpoint (NEXT_PUBLIC_RPC_API); `null` until loaded or on failure. */
export const useChainRest = <T,>(path: string) => {
  const [data, setData] = useState<T | null>(null);
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_RPC_API}${path}`)
      .then((res) => (res.ok ? res.json() : null))
      .then(setData)
      .catch(() => setData(null));
  }, [path]);
  return data;
};

type Module = { params: Record<string, any>; height: number } | null;

export const useChainParams = () => {
  const { data, loading } = useChainParamsQuery();
  const pick = (rows?: Array<{ params: any; height: any }>): Module =>
    rows?.[0] ? { params: rows[0].params ?? {}, height: Number(rows[0].height) } : null;

  const nodeInfo = useChainRest<{
    default_node_info?: { network?: string; version?: string };
    application_version?: { version?: string; cosmos_sdk_version?: string };
  }>('/cosmos/base/tendermint/v1beta1/node_info');
  const consensus = useChainRest<{ params?: Record<string, unknown> }>('/cosmos/consensus/v1/params');

  return {
    loading,
    staking: pick(data?.staking),
    slashing: pick(data?.slashing),
    mint: pick(data?.mint),
    distribution: pick(data?.distribution),
    gov: pick(data?.gov),
    nodeInfo,
    consensus: consensus?.params ?? null,
  };
};
