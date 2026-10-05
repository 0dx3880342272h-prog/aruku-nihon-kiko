export const KEY='aruku-nihon-kiko-v2',LEGACY='aruku-tokaido-v1';
export const today=()=>new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
const copy=o=>JSON.parse(JSON.stringify(o));
const emptyCourse=()=>({records:[],read:[]});
export const empty=()=>({version:2,settings:{preview:false,font:18},courses:{},migrationDone:false});
export function validDate(d){if(typeof d!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(d)||d<'1900-01-01'||d>today())return false;const t=new Date(d+'T00:00:00Z');return !isNaN(t)&&t.toISOString().slice(0,10)===d}
const safeId=x=>typeof x==='string'&&/^[a-zA-Z0-9_-]{1,100}$/.test(x)&&!['__proto__','constructor','prototype'].includes(x);
function checkCourse(c){if(!c||!Array.isArray(c.records)||c.records.length>10000)throw Error('歩行記録の形式・件数を確認してください。');const ids=new Set();const records=c.records.map(r=>{if(!r||!safeId(r.id)||ids.has(r.id)||!validDate(r.date)||!Number.isSafeInteger(r.meters)||r.meters<1||r.meters>1000000||typeof (r.note??'')!=='string'||(r.note??'').length>300)throw Error('記録の日付・距離・ID・メモに不正な値があります。');ids.add(r.id);return {id:r.id,date:r.date,meters:r.meters,note:r.note??''}});if(c.read!==undefined&&(!Array.isArray(c.read)||c.read.length>10000||c.read.some(x=>!safeId(x))))throw Error('読了データを確認してください。');return {records,read:[...new Set(c.read||[])]}}
export function validate(o){if(!o||typeof o!=='object')throw Error('対応するJSONではありません。');if(o.version===1){return {version:2,settings:settings(o.settings),courses:{hizakurige:checkCourse(o)},migrationDone:true,legacyImport:true}}if(o.version!==2||!o.courses||Array.isArray(o.courses)||typeof o.courses!=='object'||Object.keys(o.courses).length>100)throw Error('この保存データの形式には対応していません。');const c={};for(const [id,v] of Object.entries(o.courses)){if(!safeId(id))throw Error('コースIDが不正です。');c[id]=checkCourse(v)}return {version:2,settings:settings(o.settings),courses:c,migrationDone:!!o.migrationDone}}
function settings(s){return {preview:s?.preview===true,font:[16,18,20,22,24].includes(s?.font)?s.font:18}}
let issue='',migrated=false,state=empty(),raw=null;
try{raw=localStorage.getItem(KEY);if(raw)state=validate(JSON.parse(raw));else {const old=localStorage.getItem(LEGACY);if(old){state=validate(JSON.parse(old));delete state.legacyImport;state.migrationDone=true;migrated=true}}}catch(e){issue='保存データを読み込めませんでした。元データは消さずに残しています。バックアップを取り込み直してください。';try{if(raw)localStorage.setItem(KEY+'-recovery-'+Date.now(),raw)}catch{}}
export function getState(){return state}
export function getCourse(id){return state.courses[id]||emptyCourse()}
export function total(id){return getCourse(id).records.reduce((s,r)=>s+r.meters,0)}
export function status(){return {issue,migrated}}
export function save(next){const checked=validate(next);try{localStorage.setItem(KEY,JSON.stringify(checked));issue='';state=checked;window.dispatchEvent(new CustomEvent('storage-status'));return true}catch(e){state=checked;issue='端末への保存ができていません。この画面を閉じる前にJSONを書き出してください。';window.dispatchEvent(new CustomEvent('storage-status'));return false}}
export function updateCourse(id,fn){const n=copy(state),c=n.courses[id]||emptyCourse();fn(c);n.courses[id]=c;return save(n)}
export function setSettings(patch){return save({...copy(state),settings:{...state.settings,...patch}})}
export function importData(input,mode='merge'){const incoming=validate(input),n=copy(state);if(mode==='replace'&&!incoming.legacyImport){return save({...incoming,migrationDone:true})}for(const [id,c] of Object.entries(incoming.courses)){if(mode==='replace'){n.courses[id]=c;continue}const before=n.courses[id]||emptyCourse();const ids=new Map(before.records.map(r=>[r.id,r]));for(const r of c.records){if(ids.has(r.id)&&JSON.stringify(ids.get(r.id))!==JSON.stringify(r))throw Error('同じIDで内容が異なる記録があります。置換するか、バックアップを確認してください。');ids.set(r.id,r)}n.courses[id]={records:[...ids.values()],read:[...new Set([...before.read,...c.read])]}}n.migrationDone=true;return save(n)}
export function exportJSON(){return JSON.stringify({...state,exportedAt:new Date().toISOString()},null,2)}
if(migrated)save(state);
window.addEventListener('storage',e=>{if(e.key===KEY&&e.newValue){try{state=validate(JSON.parse(e.newValue));window.dispatchEvent(new CustomEvent('records-external'))}catch{}}});