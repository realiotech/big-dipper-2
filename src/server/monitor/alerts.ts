import { monitorDb } from './db';
import { WEBHOOK_URL } from './config';

export async function deliverAlerts(limit = 50): Promise<{ delivered: number; failed: number; skipped: boolean }> {
  if (!WEBHOOK_URL) return { delivered: 0, failed: 0, skipped: true };
  const database = monitorDb(); const now = Date.now();
  const due = database.prepare(`SELECT id,payload,attempts FROM alert_outbox WHERE state IN ('pending','failed') AND next_attempt_at<=? AND attempts<8 ORDER BY id LIMIT ?`).all(now,limit) as {id:number;payload:string;attempts:number}[];
  let delivered=0;let failed=0;
  for(const item of due){
    const claimed=database.prepare("UPDATE alert_outbox SET state='delivering',attempts=attempts+1 WHERE id=? AND state IN ('pending','failed')").run(item.id).changes;
    if(!claimed)continue;
    try{
      const response=await fetch(WEBHOOK_URL,{method:'POST',headers:{'content-type':'application/json'},body:item.payload,signal:AbortSignal.timeout(15_000)});
      if(!response.ok)throw new Error(`webhook HTTP ${response.status}`);
      database.prepare("UPDATE alert_outbox SET state='delivered',delivered_at=?,last_error=NULL WHERE id=?").run(new Date().toISOString(),item.id);delivered+=1;
    }catch(error){
      const delay=Math.min(60*60_000,30_000*(2**item.attempts));
      database.prepare("UPDATE alert_outbox SET state='failed',next_attempt_at=?,last_error=? WHERE id=?").run(Date.now()+delay,(error as Error).message.slice(0,500),item.id);failed+=1;
    }
  }
  return {delivered,failed,skipped:false};
}
