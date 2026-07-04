// Apollo.io enrichment: given a company name + suggested role, find a matching
// prospect (name, title, LinkedIn URL, verified email) using Apollo's People Search + Email Enrichment APIs.
// Docs: https://apolloio.github.io/apollo-api-docs/
const fetch = require('node-fetch');

const APOLLO_API_KEY = process.env.APOLLO_API_KEY;
const APOLLO_BASE = 'https://api.apollo.io/v1';

async function findProspect(companyName, roleKeywords) {
  if (!APOLLO_API_KEY) return null;
  try {
    const res = await fetch(`${APOLLO_BASE}/mixed_people/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' },
      body: JSON.stringify({
        api_key: APOLLO_API_KEY,
        q_organization_name: companyName,
        person_titles: roleKeywords,
        page: 1,
        per_page: 1
      })
    });
    const data = await res.json();
    const person = data.people && data.people[0];
    if (!person) return null;

    // Enrich to reveal verified email + LinkedIn URL (consumes Apollo credits)
    const enrichRes = await fetch(`${APOLLO_BASE}/people/match`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: APOLLO_API_KEY,
        first_name: person.first_name,
        last_name: person.last_name,
        organization_name: companyName,
        reveal_personal_emails: false
      })
    });
    const enriched = await enrichRes.json();
    const p = enriched.person || person;

    return {
      prospectName: `${p.first_name || ''} ${p.last_name || ''}`.trim(),
      prospectTitle: p.title || null,
      linkedinUrl: p.linkedin_url || null,
      businessEmail: p.email || null,
      emailStatus: p.email_status || 'unknown'
    };
  } catch (e) {
    console.error('Apollo enrichment failed for', companyName, e.message);
    return null;
  }
}

module.exports = { findProspect };