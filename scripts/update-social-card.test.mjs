import assert from 'node:assert/strict'
import test from 'node:test'
import { spawn } from 'node:child_process'
import { createServer } from 'node:http'
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { CURRENT_POLICY, LEGACY_POLICY, states } from '../src/data/liangzi.mjs'
import { parsePublishedSnapshot, parseSnapshot, resolveTodaySnapshot } from './update-social-card.mjs'
import { formatPosition, canAdvanceSnapshot } from '../src/data/snapshot.mjs'

const at = Date.parse('2026-09-02T08:00:00.000Z')
const publicSnapshot = {
  business_date:'2026-09-02', case_id:'case-2026-09-02', case_title:'DeepSeek Harness是夯还是拉',
  up_ratio:.75, up_votes:3, down_votes:1, total_incense:4, unique_voters:2,
  liangzi_state:'liang_shen', policy_version:LEGACY_POLICY, snapshot_version:12,
  updated_at:new Date(at).toISOString(), server_time:at, captured_at:at, source:'live',
}
function backend(data = publicSnapshot) {
  return { schema_version:1, business_date:data.business_date, server_time:data.server_time,
    active_case:{ id:data.case_id, title:data.case_title, business_date:data.business_date, liangzi_policy_version:data.policy_version },
    global_snapshot:{ case_id:data.case_id, business_date:data.business_date, up_votes:data.up_votes, down_votes:data.down_votes,
      up_ratio:data.up_ratio, down_ratio:data.up_ratio===null ? null : 1-data.up_ratio,
      total_incense:data.total_incense, unique_voters:data.unique_voters, liangzi_state:data.liangzi_state,
      policy_version:data.policy_version, sequence:data.snapshot_version, captured_at:data.captured_at },
  }
}

test('normalizes a valid backend response without losing integer counts or case identity', () => {
  assert.deepEqual(parseSnapshot(backend()),publicSnapshot)
})
test('rejects ratio/count and state/ratio disagreement', () => {
  assert.throws(()=>parsePublishedSnapshot({...publicSnapshot,total_incense:0,unique_voters:0}),/ratio and vote count disagree/)
  assert.throws(()=>parsePublishedSnapshot({...publicSnapshot,liangzi_state:'liang_sheng'}),/state and ratio disagree/)
  assert.throws(()=>parsePublishedSnapshot({...publicSnapshot,up_votes:2}),/raw vote counts disagree/)
  assert.throws(()=>parsePublishedSnapshot({...publicSnapshot,up_votes:2,down_votes:2}),/raw counts and ratio disagree/)
})
test('rejects nonfinite ratios and prototype state names', () => {
  for(const up_ratio of [NaN,Infinity,-Infinity]) assert.throws(()=>parsePublishedSnapshot({...publicSnapshot,up_ratio}),/ratio is invalid/)
  assert.throws(()=>parsePublishedSnapshot({...publicSnapshot,liangzi_state:'constructor'}),/state is invalid/)
})
test('preserves a last-known-good result through a backend outage',async()=>{
  let localReads=0
  const result=await resolveTodaySnapshot({live:async()=>{throw Error('offline')},published:async()=>parsePublishedSnapshot(publicSnapshot),local:async()=>{localReads++;return publicSnapshot}})
  assert.equal(result.source,'published');assert.equal(result.today.source,'cached');assert.equal(result.today.snapshot_version,12);assert.equal(localReads,0)
})
test('uses the recorded local result if both network sources fail',async()=>{
  const result=await resolveTodaySnapshot({live:async()=>{throw Error('offline')},published:async()=>{throw Error('offline')},local:async()=>parsePublishedSnapshot(publicSnapshot)})
  assert.equal(result.source,'local');assert.equal(result.today.business_date,'2026-09-02')
})
test('uses real WAITING only when all three sources are unavailable',async()=>{
  const fail=async()=>{throw Error('unavailable')}
  const result=await resolveTodaySnapshot({live:fail,published:fail,local:fail},new Date('2026-09-02T00:00:00Z'))
  assert.equal(result.source,'fallback');assert.equal(result.today.liangzi_state,'waiting');assert.equal(result.today.up_ratio,null)
})
test('historical snapshots retain their recorded policy',()=>{
  const legacy={...publicSnapshot,up_ratio:.1,up_votes:1,down_votes:9,total_incense:10,liangzi_state:'liang_gong'}
  assert.equal(parsePublishedSnapshot(legacy).liangzi_state,'liang_gong')
  const {policy_version,...old}=legacy
  assert.equal(parsePublishedSnapshot(old).policy_version,LEGACY_POLICY)
  assert.throws(()=>parsePublishedSnapshot({...legacy,policy_version:CURRENT_POLICY}),/state and ratio disagree/)
  assert.throws(()=>parsePublishedSnapshot({...legacy,policy_version:'unknown-policy'}),/unknown Liangzi policy/)
})
for(const [ratio,state] of [[0,'xiao_nan_liang'],[.24999999,'xiao_nan_liang'],[.25,'liang_gong'],[.49999999,'liang_gong'],[.5,'liang_zong'],[.7,'liang_shen'],[.85,'liang_sheng'],[.95,'liang_zu']]){
  test(`current boundary ${ratio} renders ${state} and truncates six decimals`,()=>{
    const up=Math.round(ratio*100_000_000)
    const parsed=parseSnapshot(backend({...publicSnapshot,up_ratio:ratio,up_votes:up,down_votes:100_000_000-up,total_incense:100_000_000,liangzi_state:state,policy_version:CURRENT_POLICY}))
    assert.equal(parsed.liangzi_state,state);assert.ok(states[state].image)
    assert.equal(formatPosition(parsed),`${(Math.floor(ratio*100_000_000)/1_000_000).toFixed(6)}%`)
  })
}
test('a voted zero is small figure; zero votes are WAITING with no fabricated percentage',()=>{
  const empty={...publicSnapshot,up_ratio:null,up_votes:0,down_votes:0,total_incense:0,unique_voters:0,liangzi_state:'waiting',policy_version:CURRENT_POLICY}
  assert.equal(parseSnapshot(backend(empty)).liangzi_state,'waiting');assert.equal(formatPosition(empty),'--')
  assert.throws(()=>parsePublishedSnapshot({...empty,liangzi_state:'xiao_nan_liang'}),/state and ratio disagree/)
})
test('one mixed case, policy or business date rejects the entire response',()=>{
  const wrongCase=backend();wrongCase.global_snapshot.case_id='previous-case';assert.throws(()=>parseSnapshot(wrongCase),/identities disagree/)
  const wrongDate=backend();wrongDate.global_snapshot.business_date='2026-09-01';assert.throws(()=>parseSnapshot(wrongDate),/identities disagree/)
  const wrongPolicy=backend();wrongPolicy.global_snapshot.policy_version=CURRENT_POLICY;assert.throws(()=>parseSnapshot(wrongPolicy),/policies disagree/)
  const future=backend();future.global_snapshot.captured_at=at+1;assert.throws(()=>parseSnapshot(future),/newer than server clock/)
})
test('late replies and same-version conflicting counts cannot replace a good frame',()=>{
  assert.equal(canAdvanceSnapshot(publicSnapshot,{...publicSnapshot,snapshot_version:11}),false)
  assert.equal(canAdvanceSnapshot(publicSnapshot,{...publicSnapshot,server_time:at-1,snapshot_version:13}),false)
  assert.equal(canAdvanceSnapshot(publicSnapshot,{...publicSnapshot,total_incense:5}),false)
  assert.equal(canAdvanceSnapshot(publicSnapshot,{...publicSnapshot,server_time:at+1000}),true)
  assert.equal(canAdvanceSnapshot(publicSnapshot,{...publicSnapshot,snapshot_version:13,total_incense:5}),true)
})
test('new cases may reset their sequence, and the authoritative business day may roll over',()=>{
  assert.equal(canAdvanceSnapshot(publicSnapshot,{...publicSnapshot,case_id:'replacement-case',snapshot_version:1,server_time:at+1000}),true)
  assert.equal(canAdvanceSnapshot(publicSnapshot,{...publicSnapshot,case_id:'tomorrow-case',business_date:'2026-09-03',snapshot_version:1,server_time:at+86400000}),true)
  assert.equal(canAdvanceSnapshot(publicSnapshot,{...publicSnapshot,business_date:'2026-09-01',server_time:at+1000}),false)
})
test('large integer fractions never round a displayed value across a boundary',()=>{
  const total=9_000_000_000_000_001,up=2_250_000_000_000_000
  assert.equal(formatPosition({up_ratio:up/total,total_incense:total,up_votes:up}),'24.999999%')
})
test('the build requests the current capability and publishes the same integer snapshot and policy',async()=>{
  const directory=await mkdtemp(join(tmpdir(),'liangxiang-site-test-'));let requestedPolicy
  const server=createServer((request,response)=>{
    requestedPolicy=request.headers['x-liangxiang-liangzi-policy'];response.setHeader('content-type','application/json')
    response.end(JSON.stringify(backend({...publicSnapshot,up_ratio:.1,up_votes:1,down_votes:9,total_incense:10,liangzi_state:'xiao_nan_liang',policy_version:CURRENT_POLICY})))
  })
  try{
    await mkdir(join(directory,'src/data'),{recursive:true});await mkdir(join(directory,'public/media/social'),{recursive:true})
    await writeFile(join(directory,'public/media/social/xiao_nan_liang.png'),'synthetic-card')
    await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve))
    const url=`http://127.0.0.1:${server.address().port}/v1/snapshot`
    const child=spawn(process.execPath,[fileURLToPath(new URL('./update-social-card.mjs',import.meta.url))],{cwd:directory,env:{...process.env,LIANGXIANG_SNAPSHOT_URL:url,LIANGXIANG_PUBLISHED_SNAPSHOT_URL:url},stdio:'ignore'})
    const code=await new Promise((resolve,reject)=>{child.once('error',reject);child.once('exit',resolve)})
    assert.equal(code,0);assert.equal(requestedPolicy,CURRENT_POLICY)
    const data=JSON.parse(await readFile(join(directory,'public/data/today.json'),'utf8'))
    assert.equal(data.liangzi_state,'xiao_nan_liang');assert.equal(data.policy_version,CURRENT_POLICY);assert.equal(data.up_votes,1);assert.equal(formatPosition(data),'10.000000%')
  }finally{server.closeAllConnections();if(server.listening)await new Promise(resolve=>server.close(resolve));await rm(directory,{recursive:true,force:true})}
})
