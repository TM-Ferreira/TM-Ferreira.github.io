---
layout: archive
title: "Selected publications"
permalink: /publications/
author_profile: true
---

This page presents a selective set of recent and representative publications.

For a searchable chronological record, see the [full list of my journal articles](/journal-articles/), which includes full citation details and direct DOI links to the journal pages.

For additional bibliographic information and citation metrics, see my [Google Scholar](https://scholar.google.com/citations?user=Cn4bkiAAAAAJ&hl=en), [ORCID](https://orcid.org/0000-0001-6454-7927) or [Scopus](https://www.scopus.com/authid/detail.uri?authorId=55509289200&origin=AuthorEval) profiles.

{% include base_path %}

{% for post in site.publications reversed %}
  {% include archive-single.html %}
{% endfor %}
