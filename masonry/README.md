# Masonry Atlas

Static, GitHub Pages-compatible explorer for the Portuguese Masonry Experimental Database, v2 (17 April 2026), https://doi.org/10.5281/zenodo.19633664.

469 source records. Original CSV retained unchanged, MD5 c3e6ad528a71b7c26114d100fff03858. Source encoding is Mac Roman, delimiter semicolon. `records.json` preserves field contents, including whitespace. The original unnamed final header is represented as `SourceAttachment`; links are displayed as text without fetching external attachments. Empty values remain empty. Filters trim surrounding whitespace only for matching. Location field labels deliberately follow the source without reinterpreting administrative geography.

Data: CC BY 4.0. Curator António Simões; project leaders Rita Bento and Tiago Miguel Ferreira. Full attribution and citation at Zenodo. Original project: https://www.masonry.pt/.

Features: Portuguese/English interface (source data are not translated), all-field search, six combined filters, sorting, pagination, full-field record dialog, filtered UTF-8 CSV export, original CSV download, grouped Leaflet map, URL-persisted filters. Formula-like text in filtered exports is prefixed for spreadsheet safety; original CSV is untouched.

Run with `python3 -m http.server 8765` in this folder. Publish this directory under `/masonry/` in the existing GitHub Pages repository. Relative asset paths support subdirectory hosting. No build step or credentials required.

Map tiles: OpenStreetMap; map library: Leaflet 1.9.4 from unpkg. Google Fonts used for typography with local fallbacks. Those services need an internet connection. The table and record data are self-hosted. Locations may be approximate and are grouped only by identical coordinates; blank/invalid coordinates are excluded from the map and counted.

Submission and moderation remain on the original site via explicit links. This version does not store submissions or attachments. It is a separately designed explorer, not a representation that all original administration features have been migrated.

## Audited preview revision

The interface now uses the official Técnico ULisboa 2026 main logo, Source Sans 3 and official blue/slate palette. Typology reference images are preserved from masonry.pt.

The explorer loads `published-records.json`: 460 records after six out-of-vocabulary typology exclusions, two exact duplicate-copy exclusions and one withheld negative-modulus entry. All source rows remain in `records.json` and the untouched CSV. See `DATA_REVIEW.md`, `data/removed-records.csv`, `data/entry-audit.csv` and `data/audit-summary.json`. Reproduce using `python3 audit_dataset.py`. Missing types remain searchable; no TA codes were inferred. TA4 has no records but is shown in the reference catalogue.
