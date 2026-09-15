import type { GetServerSideProps } from 'next';
import { NextSeo } from 'next-seo';
import Head from 'next/head';
import Monitor, { MonitorProps } from '@/components/monitor';

export default function MonitorPage(props: MonitorProps) {
  return <><NextSeo title="Compromised wallet monitor"/><Head><meta key="robots" name="robots" content="noindex,nofollow,noarchive"/></Head><Monitor {...props}/></>;
}

const value = (input: string|string[]|undefined) => Array.isArray(input) ? input[0] ?? '' : input ?? '';
export const getServerSideProps: GetServerSideProps<MonitorProps> = async ({req,res,query}) => {
  const { requireAuth } = await import('@/server/monitor/auth');
  if (!requireAuth(req,res)) return { props:{unauthorized:true} };
  res.setHeader('Cache-Control','private, no-store');
  const { importWatchlist } = await import('@/server/monitor/db');
  const { overview,addressPage,activityPage } = await import('@/server/monitor/queries');
  importWatchlist();
  const filters={q:value(query.q),sort:value(query.sort)||'stake',type:value(query.type),direction:value(query.direction),success:value(query.success),sinceRestart:value(query.sinceRestart),sPage:value(query.sPage),aPage:value(query.aPage)};
  const pageSize=25;
  return { props:{overview:overview(),addresses:addressPage({page:Number(filters.sPage)||1,pageSize,q:filters.q,sort:filters.sort,denom:'ario',stakingOnly:true}),activity:activityPage({page:Number(filters.aPage)||1,pageSize,type:filters.type,direction:filters.direction,success:filters.success,address:'',sinceRestart:filters.sinceRestart==='1'}),filters} };
};
