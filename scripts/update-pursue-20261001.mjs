// One-time, reproducible refresh. Inputs are saved public gallery HTML pages;
// the 116 row identifiers and release metadata were verified in the official UI.
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const root = new URL('../', import.meta.url);
const stamp = '2026-10-01T21:00:00Z';
const decode = text => text.replace(/&#(x[0-9a-f]+|\d+);/gi, (_, n) => String.fromCodePoint(n[0].toLowerCase() === 'x' ? parseInt(n.slice(1),16) : Number(n))).replaceAll('&amp;','&').replaceAll('&quot;','"').replaceAll('&#39;',"'").replaceAll('&lt;','<').replaceAll('&gt;','>').replaceAll('&nbsp;',' ');
const plain = html => decode(html.replace(/<[^>]+>/g,' ')).replace(/\s+/g,' ').trim();
const sha = text => createHash('sha256').update(text).digest('hex');
const snapshot = JSON.parse(await readFile(new URL('data/source/pursue.snapshot.json',root),'utf8'));
const additions = [];
const sources = [];
for (const n of [5,6]) {
  const html = await readFile(process.argv[n-3] ?? `/private/tmp/pursue-release-0${n}.html`,'utf8');
  sources.push({id:`silv-release-0${n}-mirror`,role:'Auxiliary public mirror for source descriptions and media URLs; no editorial ratings imported',url:`https://uap.silv.app/release-${n}/`,fetchedAt:stamp,retrievalMethod:'HTTP GET; card HTML extraction',contentHashAlgorithm:'sha256',contentHash:sha(html)});
  for (const match of html.matchAll(/<article\b([^>]*)>([\s\S]*?)<\/article>/g)) {
    const [,,card]=match;
    const attr=match[1];
    const title=plain((card.match(/<h2[^>]*>([\s\S]*?)<\/h2>/)?.[1]??'').replace(/<span class="featured-pin"[\s\S]*?<\/span><\/span>/,''));
    const field=key=>plain(card.match(new RegExp(`<span class="tag tag-${key}"[^>]*>([\\s\\S]*?)<\\/span>`))?.[1]??'');
    const type=attr.match(/data-type="([^"]+)"/)?.[1];
    const source=decode(card.match(/<a class="source-link" href="([^"]+)"/)?.[1]??'');
    const descriptionOriginal=Array.from((card.match(/<div class="card-description">([\s\S]*)/)?.[1]??'').matchAll(/<p>([\s\S]*?)<\/p>/g),m=>plain(m[1])).join('\n\n');
    const mediaUrl=decode(card.match(/<source src="([^"]+)"/)?.[1]??'')||null;
    const assetUrl=decode(card.match(/<div class="media pdf-link">\s*<a href="([^"]+)"/)?.[1]??card.match(/<img[^>]+src="([^"]+)"/)?.[1]??'')||mediaUrl;
    const thumbnailUrl=decode(card.match(/poster="([^"]+)"/)?.[1]??'')||null;
    if(!title||!source||!type)throw new Error('Incomplete mirror card');
    additions.push({title,type,agency:field('agency'),release:`release_${n}`,releaseDate:n===5?'8/7/26':'9/18/26',incidentDate:field('date')||null,incidentLocation:field('location')||null,descriptionOriginal,descriptionZh:null,translationMatch:null,assetUrl,thumbnailUrl,mediaUrl,mediaMimeType:mediaUrl?'video/mp4':null,sourcePageUrl:source,sourceAttribution:`silv-release-0${n}-mirror`,officialFeatured:false});
  }
}
// Officially typed as audio, despite using an MP4 container in the mirror.
const ruppelt=additions.find(r=>r.title.startsWith('DOW-UAP-PR160,'));
if(ruppelt)ruppelt.type='AUD';
for (const record of additions) {
  if(record.incidentLocation==='Location Unknown')record.incidentLocation='N/A';
  if(record.incidentDate==='Date Unknown')record.incidentDate=null;
  if(record.title.startsWith('LLE-UAP-PR004,')) {
    record.title='LLE-UAP-PR004, Unresolved UAP Report, Colorado, January 2024';
    record.metadataNote='The official title and transcript identify January 2024, but the official index date field says October 2023. Both source values are preserved.';
  }
}
const redaction="Redactions have been made to protect the identity of eyewitnesses, the location of government facilities, or potentially sensitive information about military sites not related to UAP. No redactions have been made to any files released under President Trump's directive concerning information about the nature or existence of any encounter reported as a UAP or related phenomena.";
for(const [id,duration,month,year] of [['002','15-minute','October','2023'],['003','27-second','October','2023'],['004','1-minute, 42-second','January','2024']]){
  const title=`LLE-UAP-D${id}, Transcript of an Unresolved UAP Report, Colorado, ${month} ${year}`;
  const description=`This document is a transcript of a ${duration} video recording contained in this collection under the title LLE-UAP-PR${id}, captured by a law enforcement officer in Colorado in ${month} ${year}. AARO removed the audio from the original recording to protect information whose release could reasonably be expected to affect the privacy or other protected interests of a U.S. person or commercial entity. This transcript is also redacted to protect the identity of the reporter and sensitive law enforcement information.All descriptive and estimative language in this transcript reflects the reporter’s subjective interpretation at the time of the event. Such characterizations should not be interpreted as a conclusive indication of the presence or absence of any intrinsic object features or performance characteristics.`;
  if(!additions.some(r=>r.title.startsWith(`LLE-UAP-D${id},`))) additions.push({title,type:'PDF',agency:'Local Law Enforcement',release:'release_6',releaseDate:'9/18/26',incidentDate:`${month}, ${year}`,incidentLocation:'Colorado',descriptionOriginal:description+(id==='003'?'':`\n\n${redaction}`),descriptionZh:null,assetUrl:null,mediaUrl:null,thumbnailUrl:`https://www.war.gov/medialink/ufo/sept-18/release-06/thumbs/LLE-UAP-D${id}_Transcript-of-an-Unresolved-UAP-Report-Colorado-${month}-${year}.jpg`,sourceAttribution:'war-pursue-20261001',officialFeatured:false});
}
if(additions.length!==116 || additions.filter(r=>r.release==='release_5').length!==41)throw new Error(`Unexpected counts: ${additions.length}`);
const ids=additions.map(r=>r.title.split(',')[0]);
if(new Set(ids).size!==116)throw new Error('Duplicate new record identifier');
const checks=JSON.parse(await readFile(new URL('data/source/official-row-checks-20261001.json',root),'utf8'));
for(const r of additions){
  const row=[r.title,r.agency,r.release.slice(-1).padStart(2,'0'),r.incidentDate,r.incidentLocation,r.type].map(x=>(x??'').replace(/\s+/g,' ').trim()).join('|');
  let h=2166136261;for(let i=0;i<row.length;i++){h^=row.charCodeAt(i);h=Math.imul(h,16777619);}
  if((h>>>0).toString(16)!==checks.rows[r.title.split(',')[0]])throw new Error(`Official row mismatch: ${r.title}`);
}
snapshot.records=snapshot.records.filter(r=>!['release_5','release_6'].includes(r.release)).concat(additions);
snapshot.fetchedAt=stamp;
snapshot.sources=snapshot.sources.filter(s=>!s.id.includes('20261001')&&!s.id.startsWith('silv-release')).concat(sources,{id:'war-pursue-20261001',role:'Primary verification of all 116 Release 05 and 06 index rows, release dates and bundle links; full descriptions for LLE transcripts',url:'https://www.war.gov/UFO/',fetchedAt:stamp,retrievalMethod:'Browser-rendered official index, all 4 Release 05 pages and all 7 Release 06 pages',license:'U.S. federal-government originals where 17 U.S.C. §105 applies; check per-asset markings'});
snapshot.officialVerification={...snapshot.officialVerification,previousVerifiedRecordCount:334,newVerifiedRecordCount:116,renderedRecordCount:450,uniqueRenderedTitles:450,checkedAt:stamp,releaseCounts:{'release-01':158,'release-02':64,'release-03':72,'release-04':40,'release-05':41,'release-06':75},note:'Release 01-04 verification retained from July 18; Release 05-06 index verified October 1. Mirror descriptions attributed separately. Three new transcript direct PDF URLs are not asserted; official record links remain available.'};
await writeFile(new URL('data/source/pursue.snapshot.json',root),JSON.stringify(snapshot,null,2)+'\n');
console.log(JSON.stringify({records:snapshot.records.length,newRecords:additions.length,newIds:ids,missingAssets:additions.filter(r=>!r.assetUrl).map(r=>r.title)},null,2));
