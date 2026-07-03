import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();

const CITY_CENTERS = {
  "Quezon City":[14.676,121.0437],"Makati":[14.5547,121.0244],"Taguig":[14.5176,121.0509],
  "Cebu City":[10.3157,123.8854],"Davao City":[7.1907,125.4553],"Baguio":[16.4023,120.596],
};
function h(s){let x=2166136261;for(let i=0;i<s.length;i++){x^=s.charCodeAt(i);x=Math.imul(x,16777619);}return x>>>0;}
const unit=s=>(h(s)%2000)/1000-1;
const jitter=([la,ln],s)=>{const r=0.0035;return [la+unit(s+"a")*r,ln+unit(s+"b")*r];};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

const listings = await p.listing.findMany({ select:{id:true,city:true,barangay:true} });
let n=0;
for (const l of listings) {
  const fallback = CITY_CENTERS[l.city] || [12.8797,121.774];
  let coords = jitter(fallback, `${l.barangay}|${l.city}`);
  try {
    const q = encodeURIComponent(`${l.barangay}, ${l.city}, Philippines`);
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${q}`, { headers:{ "User-Agent":"Balay/1.0 (rental marketplace)" }});
    if (res.ok) { const d = await res.json(); if (d.length) coords = jitter([parseFloat(d[0].lat),parseFloat(d[0].lon)], `${l.barangay}|${l.city}`); }
  } catch {}
  await p.listing.update({ where:{id:l.id}, data:{ latitude:coords[0], longitude:coords[1] } });
  console.log(`✓ ${l.barangay}, ${l.city} → ${coords[0].toFixed(4)}, ${coords[1].toFixed(4)}`);
  n++;
  await sleep(1100); // respect Nominatim 1 req/sec
}
console.log(`Backfilled ${n} listings`);
await p.$disconnect();
