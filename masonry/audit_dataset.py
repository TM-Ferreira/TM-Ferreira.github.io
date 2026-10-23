"""Reproducible field-consistency audit. Never edits the original dataset."""
import csv,json,re,hashlib,collections
from pathlib import Path
P=Path(__file__).parent; data=P/'data'; raw=data.joinpath('MasonryPT_Dataset_v2.csv').read_bytes()
assert hashlib.md5(raw).hexdigest()=='c3e6ad528a71b7c26114d100fff03858'
rows=list(csv.reader(raw.decode('mac_roman').splitlines(),delimiter=';')); headers=rows[0][:-1]+['SourceAttachment']; assert all(len(x)==31 for x in rows)
records=[dict(zip(headers,r)) for r in rows[1:]]; assert records==json.loads(data.joinpath('records.json').read_text())
valid={f'TA{i}' for i in range(1,12)}; seen={}; ids=collections.Counter(r['AutomaticIdentifier'].strip() for r in records)
numfields=[k for k in headers if k.endswith('_MPa') or k.endswith('_kN_m3') or k.startswith('TestedPanelDimensions_')]
number=r'[-+]?\d+(?:[,.]\d+)?'; value=re.compile(rf'{number}(?:\s*[-/]\s*{number})?(?:\s*\(\s*~?\s*{number}\s*%?\s*\))?')
audit=[]; excluded=[]; published=[]
for idx,r in enumerate(records,2):
 reasons=[]; flags=[]; typ=r['MasonryType'].strip(); sig=tuple(r.values()); duplicate_of=seen.get(sig)
 if typ and typ not in valid:reasons.append('NON_TA_TYPOLOGY: source value '+typ+' is outside the TA1–TA11 typology vocabulary; excluded from this masonry-typology explorer, not declared scientifically invalid')
 if duplicate_of:reasons.append('EXACT_DUPLICATE: all 31 source fields identical to CSV row '+str(duplicate_of)+'; first occurrence retained')
 else:seen[sig]=idx
 if not typ:flags.append('MISSING_TYPOLOGY')
 if ids[r['AutomaticIdentifier'].strip()]>1:flags.append('REPEATED_IDENTIFIER: distinct entries retained unless exact duplicate')
 for k in ['TestType','UnitType','CrossSectionType','MortarType','ReferenceSource']:
  if r[k].strip() in ('','-'):flags.append('MISSING_'+k)
 coords=[]
 for k in ['Latitude','Longitude']:
  try:coords.append(float(r[k].strip().replace(',','.')))
  except ValueError:coords.append(None)
 if any(x is None for x in coords):flags.append('MISSING_OR_INVALID_COORDINATES')
 elif not (-90<=coords[0]<=90 and -180<=coords[1]<=180):flags.append('COORDINATES_OUT_OF_RANGE')
 for k in numfields:
  v=r[k].strip()
  if v not in ('','-') and not value.fullmatch(v):flags.append('CHECK_NUMERIC_FORMAT_'+k+': '+v)
  if v and re.fullmatch(number,v) and float(v.replace(',','.'))<0:
   flags.append('NEGATIVE_VALUE_'+k+': '+v)
   if k in ('EstaticE_MPa','DynamicE_MPa','G_MPa'):reasons.append('NEGATIVE_ELASTIC_MODULUS: '+k+' = '+v+' is not usable as a positive material stiffness parameter; withheld pending source confirmation, not corrected')
 if r['TestType'].strip() not in ('','MP-D','CU','S-D','CD','CC','S-I','RF'):flags.append('UNRECOGNISED_TEST_CODE')
 if any(v!=v.strip() for v in r.values()):flags.append('SURROUNDING_WHITESPACE: trimmed in filters only')
 disposition='excluded' if reasons else 'retained_with_flags' if flags else 'retained'
 audit.append({'SourceCSVRow':idx,'AutomaticIdentifier':r['AutomaticIdentifier'],'Disposition':disposition,'Reasons':' | '.join(reasons),'ReviewFlags':' | '.join(flags)})
 if reasons:excluded.append({'SourceCSVRow':idx,'Reasons':' | '.join(reasons),**r})
 else:published.append(r)
data.joinpath('published-records.json').write_text(json.dumps(published,ensure_ascii=False),encoding='utf-8')
for filename,items in [('entry-audit.csv',audit),('removed-records.csv',excluded)]:
 with data.joinpath(filename).open('w',encoding='utf-8-sig',newline='') as f:
  w=csv.DictWriter(f,fieldnames=list(items[0]));w.writeheader();w.writerows(items)
summary={'source_records':len(records),'published_records':len(published),'excluded_records':len(excluded),'non_ta_typology':sum('NON_TA' in e['Reasons'] for e in excluded),'exact_duplicate_copies':sum('EXACT_DUPLICATE' in e['Reasons'] for e in excluded),'negative_modulus_withheld':sum('NEGATIVE_ELASTIC' in e['Reasons'] for e in excluded),'missing_typology_retained':sum(not r['MasonryType'].strip() for r in published),'repeated_identifier_groups':sum(n>1 for n in ids.values()),'numeric_format_flags':[a for a in audit if 'CHECK_NUMERIC' in a['ReviewFlags']],'source_md5':hashlib.md5(raw).hexdigest()}
data.joinpath('audit-summary.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2));print(json.dumps(summary,ensure_ascii=False,indent=2))
