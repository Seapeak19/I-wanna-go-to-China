const fs=require('node:fs'),zlib=require('node:zlib'),path=require('node:path'),root=path.join(__dirname,'../..');let pack,source;
const read=file=>JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(root,file))));
exports.load=()=>{if(pack)return pack;const i=JSON.parse(fs.readFileSync(path.join(root,'i18n/index.json')));pack={...read('i18n/common.json.gz'),...read('i18n/zh-Hant.json.gz'),messages:{}};for(const[code,files]of Object.entries(i.languages))if(code!=='zh-Hant')pack.messages[code]=Object.assign({},...files.map(read));return pack;};
exports.source=()=>source||(source='globalThis.TRAVEL_TRANSLATIONS='+JSON.stringify(exports.load())+';');
