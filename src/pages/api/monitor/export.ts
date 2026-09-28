import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAuth } from '@/server/monitor/auth';
import { csvRow } from '@/server/monitor/csv';
import { importWatchlist, latestSnapshotId, monitorDb } from '@/server/monitor/db';

export default function handler(req:NextApiRequest,res:NextApiResponse){
  if(!requireAuth(req,res))return res.end('Authentication required');
  if(req.method!=='GET'){res.setHeader('Allow','GET');return res.status(405).end('Method not allowed');}
  try{
    importWatchlist(); const database=monitorDb(); const snapshot=latestSnapshotId(database);
    const rows=snapshot?database.prepare(`SELECT s.address,s.validator,s.denom,s.amount,s.source_height
      FROM stake_snapshot s JOIN watchlist_tag t ON t.address=s.address AND t.tag='compromised'
      WHERE s.snapshot_id=? ORDER BY s.address,s.validator,s.denom`).all(snapshot) as any[]:[];
    res.setHeader('Content-Type','text/csv; charset=utf-8');res.setHeader('Content-Disposition',`attachment; filename="realio-monitor-staking-${new Date().toISOString().slice(0,10)}.csv"`);res.setHeader('Cache-Control','private, no-store');
    res.write('\uFEFF'+csvRow(['address','validator','denom','amount_base_units','source_height'])+'\r\n');
    rows.forEach((row)=>res.write(csvRow([row.address,row.validator,row.denom,row.amount,row.source_height])+'\r\n'));res.end();
  }catch(error){res.status(500).end(`Monitor export failed: ${(error as Error).message}`);}
}
