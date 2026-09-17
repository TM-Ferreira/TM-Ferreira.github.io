---
layout: archive
title: "Complete list of articles published in Web of Science Core Collection (Science Citation Index Expanded)-indexed journals"
permalink: /journal-articles/
author_profile: true
---

<div class="journal-tools" role="search" aria-label="Filter journal articles">
  <div class="journal-tools__fields">
    <div>
      <label for="journal-search">Search the list</label>
      <input id="journal-search" type="search" placeholder="Title, author, journal, DOI or ARI number" autocomplete="off">
    </div>
    <div>
      <label for="journal-year">Year</label>
      <select id="journal-year">
        <option value="">All years</option>
        {% assign journal_years = site.data.journal_articles | group_by: "year" %}
        {% for journal_year in journal_years %}
          <option value="{{ journal_year.name }}">{{ journal_year.name }} ({{ journal_year.items | size }})</option>
        {% endfor %}
      </select>
    </div>
  </div>
  <p class="journal-tools__status" aria-live="polite"><span id="journal-count">{{ site.data.journal_articles | size }}</span> articles shown</p>
</div>

<p id="journal-no-results" class="notice--warning" hidden>No articles match the selected filters.</p>

<div id="journal-list">
{% assign journal_groups = site.data.journal_articles | group_by: "year" %}
{% for journal_group in journal_groups %}
  <section class="journal-year" data-journal-year="{{ journal_group.name }}">
    <h2>{{ journal_group.name }}</h2>
    <ol class="journal-articles">
    {% for article in journal_group.items %}
      {% capture article_search %}{{ article.id }} {{ article.year }} {{ article.authors }} {{ article.title }} {{ article.journal }} {{ article.doi }}{% endcapture %}
      <li class="journal-article" data-id="{{ article.id | downcase }}" data-year="{{ article.year }}" data-search="{{ article_search | strip_html | strip_newlines | downcase | escape }}">
        <p class="journal-article__citation">
          <span class="journal-article__id">{{ article.id }}</span>
          {{ article.authors }} ({{ article.year }}).
          <a class="journal-article__title" href="{{ article.url }}" target="_blank" rel="noopener">{{ article.title }}</a>.
          <em>{{ article.journal }}</em>{% if article.volume != "" %}, {{ article.volume }}{% if article.issue != "" %}({{ article.issue }}){% endif %}{% endif %}{% if article.pages != "" %}, {{ article.pages }}{% endif %}.
          <a class="journal-article__doi" href="{{ article.url }}" target="_blank" rel="noopener">doi:{{ article.doi }}</a>
        </p>
      </li>
    {% endfor %}
    </ol>
  </section>
{% endfor %}
</div>

<style>
  .journal-tools {
    margin: 1.5rem 0 2rem;
    padding: 1rem;
    border: 1px solid var(--global-border-color);
    border-radius: 4px;
    background: var(--global-code-background-color);
  }

  .journal-tools__fields {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(9rem, 0.28fr);
    gap: 0.8rem;
    align-items: end;
  }

  .journal-tools label {
    display: block;
    margin-bottom: 0.3rem;
    font-size: 0.82rem;
    font-weight: 600;
  }

  .journal-tools input,
  .journal-tools select {
    width: 100%;
    min-height: 2.5rem;
    margin: 0;
    padding: 0.45rem 0.6rem;
    border: 1px solid var(--global-border-color);
    border-radius: 3px;
    color: var(--global-text-color);
    background: var(--global-bg-color);
    font: inherit;
  }

  .journal-tools__status {
    margin: 0.7rem 0 0;
    font-size: 0.82rem;
  }

  .journal-year[hidden],
  .journal-article[hidden],
  #journal-no-results[hidden] {
    display: none;
  }

  .journal-articles {
    margin-left: 1.25rem;
    padding-left: 0.35rem;
  }

  .journal-article {
    margin-bottom: 1rem;
    padding: 0 0 0.9rem 0.2rem;
    border-bottom: 1px solid var(--global-border-color);
  }

  .journal-article__citation {
    margin: 0;
    line-height: 1.55;
  }

  .journal-article__id {
    display: inline-block;
    margin-right: 0.35rem;
    padding: 0.08rem 0.35rem;
    border-radius: 3px;
    color: var(--global-text-color-light);
    background: var(--global-border-color);
    font-size: 0.7rem;
    font-weight: 600;
    vertical-align: 0.08rem;
  }

  .journal-article__title {
    font-weight: 600;
  }

  .journal-article__doi {
    white-space: normal;
    overflow-wrap: anywhere;
    font-size: 0.82rem;
  }

  @media screen and (max-width: 640px) {
    .journal-tools__fields {
      grid-template-columns: 1fr;
    }
  }
</style>

<script>
  document.addEventListener("DOMContentLoaded", function () {
    var searchInput = document.getElementById("journal-search");
    var yearSelect = document.getElementById("journal-year");
    var entries = Array.prototype.slice.call(document.querySelectorAll(".journal-article"));
    var yearGroups = Array.prototype.slice.call(document.querySelectorAll(".journal-year"));
    var count = document.getElementById("journal-count");
    var noResults = document.getElementById("journal-no-results");

    function normalise(value) {
      return (value || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
    }

    function applyFilters() {
      var query = normalise(searchInput.value);
      var year = yearSelect.value;
      var visible = 0;
      var ariQuery = query.match(/^ari\s*(\d+)$/);

      entries.forEach(function (entry) {
        var matchesQuery = !query || (
          ariQuery
            ? normalise(entry.getAttribute("data-id")) === "ari " + ariQuery[1]
            : normalise(entry.getAttribute("data-search")).indexOf(query) !== -1
        );
        var matchesYear = !year || entry.getAttribute("data-year") === year;
        var show = matchesQuery && matchesYear;
        entry.hidden = !show;
        if (show) visible += 1;
      });

      yearGroups.forEach(function (group) {
        group.hidden = !group.querySelector(".journal-article:not([hidden])");
      });

      count.textContent = visible;
      noResults.hidden = visible !== 0;
    }

    searchInput.addEventListener("input", applyFilters);
    yearSelect.addEventListener("change", applyFilters);
  });
</script>
