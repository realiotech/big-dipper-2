import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import Database from 'better-sqlite3';
import { addressRoles, counterpartiesFor, directionFor } from './activity';
import { csvCell, csvRow } from './csv';
import { acquireLease, migrate, openMonitorDatabase } from './db';
import { assertOrdered } from './tail';
import { authorized } from './auth';
import { overview } from './queries';
import { pruneSnapshots } from './retention';

const source='realio1s3n5vzt0ynwyrl48ph5fp43fgt6edsccj65nln';
const target='realio10vzxfu5q4l6yk7nvtm9l2mp0w7sd062chay5f0';

describe('wallet monitor correctness',()=>{
  test('derives roles and counterparties from payload fields',()=>{
    const roles=addressRoles({from_address:source,to_address:target,amount:[{denom:'ario',amount:'1'}]});
    expect(directionFor(source,roles)).toBe('outgoing');
    expect(directionFor(target,roles)).toBe('incoming');
    expect(counterpartiesFor(source,roles)).toEqual([target]);
  });

  test('rejects lossy or duplicate cursor ordering',()=>{
    const row=(hash:string)=>({height:10,index:0,type:'x',transaction_hash:hash,involved_accounts_addresses:[],value:{},transaction:null});
    expect(()=>assertOrdered([row('A'),row('B')],{height:9,transaction_hash:'',index:-1})).not.toThrow();
    expect(()=>assertOrdered([row('A'),row('A')],{height:9,transaction_hash:'',index:-1})).toThrow(/ordering/);
  });

  test('migrates once, preserves independent message identities, and leases jobs',()=>{
    const dir=fs.mkdtempSync(path.join(os.tmpdir(),'realio-monitor-')); const file=path.join(dir,'db.sqlite');
    const db=openMonitorDatabase(file);
    try{
      const insert=db.prepare("INSERT INTO activity_message VALUES(?,?,0,'x','[]','[]','[]',1,'{}',NULL,'now')");
      insert.run(10,'A');insert.run(10,'B');
      expect((db.prepare('SELECT COUNT(*) count FROM activity_message').get() as any).count).toBe(2);
      const lease=acquireLease('activity',db);
      expect(()=>acquireLease('activity',db)).toThrow(/already running/);
      lease.release();expect(()=>acquireLease('activity',db)).not.toThrow();
      migrate(db);expect(db.pragma('user_version',{simple:true})).toBe(2);
    }finally{db.close();fs.rmSync(dir,{recursive:true,force:true});}
  });

  test('rejects a database created by newer code',()=>{
    const db=new Database(':memory:');db.pragma('user_version = 99');
    expect(()=>migrate(db)).toThrow(/newer than supported/);db.close();
  });

  test('removes the obsolete validator exposure index when upgrading',()=>{
    const db=new Database(':memory:');
    db.exec('CREATE TABLE stake_snapshot(snapshot_id INTEGER, validator TEXT)');
    db.exec('CREATE INDEX stake_snapshot_validator ON stake_snapshot(snapshot_id,validator)');
    db.pragma('user_version = 1');
    migrate(db);
    expect(db.prepare("SELECT name FROM sqlite_master WHERE type='index' AND name='stake_snapshot_validator'").get()).toBeUndefined();
    expect(db.pragma('user_version',{simple:true})).toBe(2);
    db.close();
  });

  test('totals stake and balance per denom without float rounding',()=>{
    const dir=fs.mkdtempSync(path.join(os.tmpdir(),'realio-monitor-totals-')); const file=path.join(dir,'db.sqlite');
    const db=openMonitorDatabase(file);
    try{
      db.prepare("INSERT INTO snapshot(id,started_at,finished_at,captured_head_height,status) VALUES(1,'t','t',100,'ok')").run();
      const stake=db.prepare('INSERT INTO stake_snapshot VALUES(1,?,?,?,?,100)');
      stake.run(source,'realiovaloper1a','ario','1000000000000000000');
      stake.run(source,'realiovaloper1b','ario','2000000000000000001');
      stake.run(target,'realiovaloper1a','arst','5000000000000000000');
      const balance=db.prepare('INSERT INTO balance_snapshot VALUES(1,?,?,?,100)');
      balance.run(source,'ario','3');
      balance.run(target,'arst','4');
      const data=overview(db);
      expect(data.stakeByDenom).toEqual([
        {denom:'arst',amount:'5000000000000000000'},
        {denom:'ario',amount:'3000000000000000001'},
      ]);
      expect(data.balanceByDenom).toEqual([{denom:'arst',amount:'4'},{denom:'ario',amount:'3'}]);
    }finally{db.close();fs.rmSync(dir,{recursive:true,force:true});}
  });

  test('prunes superseded snapshots while keeping activity evidence',()=>{
    const dir=fs.mkdtempSync(path.join(os.tmpdir(),'realio-monitor-prune-')); const file=path.join(dir,'db.sqlite');
    const db=openMonitorDatabase(file);
    try{
      const snapshot=db.prepare("INSERT INTO snapshot(id,started_at,finished_at,captured_head_height,status) VALUES(?,'t','t',100,'ok')");
      const stake=db.prepare('INSERT INTO stake_snapshot VALUES(?,?,?,?,?,100)');
      const balance=db.prepare('INSERT INTO balance_snapshot VALUES(?,?,?,?,100)');
      [1,2,3,4,5].forEach((id)=>{snapshot.run(id);stake.run(id,source,'realiovaloper1a','ario','1');balance.run(id,source,'ario','1');});
      db.prepare("INSERT INTO activity_message VALUES(10,'A',0,'x','[]','[]','[]',1,'{}',NULL,'now')").run();
      db.prepare("INSERT INTO alert_outbox(dedupe_key,height,tx_hash,msg_index,address,payload,state,created_at,delivered_at) VALUES('k',10,'A',0,?,'{}','delivered','t',datetime('now','-60 days'))").run(source);
      const result=pruneSnapshots({keep:2,alertDays:30,database:db});
      expect(result).toMatchObject({removedSnapshots:3,removedRows:6,removedAlerts:1,keptFrom:4});
      expect((db.prepare('SELECT COUNT(*) n FROM snapshot').get() as any).n).toBe(2);
      expect((db.prepare('SELECT MIN(snapshot_id) n FROM stake_snapshot').get() as any).n).toBe(4);
      expect((db.prepare('SELECT COUNT(*) n FROM activity_message').get() as any).n).toBe(1);
      expect(pruneSnapshots({keep:2,alertDays:30,database:db}).removedSnapshots).toBe(0);
    }finally{db.close();fs.rmSync(dir,{recursive:true,force:true});}
  });

  test('CSV quotes fields and neutralizes spreadsheet formulas',()=>{
    expect(csvCell('a"b')).toBe('"a""b"');
    expect(csvRow(['=cmd',12])).toBe('"\'=cmd","12"');
  });

  test('optional Basic Auth fails closed when configured',()=>{
    const oldUser=process.env.MONITOR_BASIC_AUTH_USER;const oldPassword=process.env.MONITOR_BASIC_AUTH_PASSWORD;const oldPublic=process.env.MONITOR_PUBLIC;const oldNodeEnv=process.env.NODE_ENV;
    try{
      delete process.env.MONITOR_BASIC_AUTH_USER;delete process.env.MONITOR_BASIC_AUTH_PASSWORD;delete process.env.MONITOR_PUBLIC;
      expect(authorized(undefined)).toBe(true);
      process.env.NODE_ENV='production';
      expect(authorized(undefined)).toBe(false);
      process.env.MONITOR_PUBLIC='true';
      expect(authorized(undefined)).toBe(true);
      delete process.env.MONITOR_PUBLIC;
      process.env.MONITOR_BASIC_AUTH_USER='operator';process.env.MONITOR_BASIC_AUTH_PASSWORD='secret';
      expect(authorized(undefined)).toBe(false);
      expect(authorized(`Basic ${Buffer.from('operator:secret').toString('base64')}`)).toBe(true);
      expect(authorized(`Basic ${Buffer.from('operator:wrong').toString('base64')}`)).toBe(false);
    }finally{
      if(oldUser==null)delete process.env.MONITOR_BASIC_AUTH_USER;else process.env.MONITOR_BASIC_AUTH_USER=oldUser;
      if(oldPassword==null)delete process.env.MONITOR_BASIC_AUTH_PASSWORD;else process.env.MONITOR_BASIC_AUTH_PASSWORD=oldPassword;
      if(oldPublic==null)delete process.env.MONITOR_PUBLIC;else process.env.MONITOR_PUBLIC=oldPublic;
      process.env.NODE_ENV=oldNodeEnv;
    }
  });
});
