// Run daily via GitHub Actions / Vercel Cron / Netlify Scheduled Functions
// node scripts/generateInsights.js
const Parser = require('rss-parser');
const fs = require('fs');
const path = require('path');
const sources = require('../lib/sources');
const signalRules = require('../lib/signals');
const { findProspect } = require('../lib/apollo');
const { syncInsightsToSheet } = require('../lib/sheets');

const parser = new Parser();
const APOLLO_ENRICH_TOP_N = parseInt(process.env.APOLLO_ENRICH_TOP_N || '10', 10);

function detectSignals(text) {
  const hits = [];
  for (const rule of signalRules) {
    if (rule.keyword.test(text)) {
      hits.push({ signalType: rule.signalType, score: rule.score, angle: rule.angle });
    }
  }
  return hits;
}

function guessSegment(text) {
  if (/higher ed|university|college/i.test(text)) return 'Higher Education';
  if (/k-?12|school district|primary|secondary school/i.test(text)) return 'K-12';
  if (/corporate|l&d|learning and development|workforce/i.test(text)) return 'Corporate L&D';
  if (/publish(er|ing)/i.test(text)) return 'Publishing';
  if (/government|ministry|public sector|b2g/i.test(text)) return 'Government/B2G';
  return 'General EdTech';
}

function roleKeywordsForSegment(segment) {
  if (segment === 'Government/B2G') return ['Procurement Officer', 'Head of Digital Learning'];
  if (segment === 'Corporate L&D') return ['Head of L&D', 'Chief Learning Officer'];
  if (segment === 'Publishing') return ['Head of Digital Publishing', 'Product Director'];
  return ['Head of EdTech', 'VP Academics'];
}

function buildLinkedInSearchUrl(companyName, roleKeywords) {
  const q = encodeURIComponent(`${companyName} ${roleKeywords.join(' OR ')}`);
  return `https://www.linkedin.com/search/results/people/?keywords=${q}`;
}

async function run() {
  const insights = [];
  for (const src of sources) {
    if (!src.rss) continue; // Non-RSS sources are covered manually or via Perplexity/Apollo lookups
    try {
      const feed = await parser.parseURL(src.rss);
      for (const item of feed.items.slice(0, 15)) {
        const text = `${item.title} ${item.contentSnippet || ''}`;
        const signals = detectSignals(text);
        if (signals.length === 0) continue;
        const top = signals.sort((a, b) => b.score - a.score)[0];
        const companyGuess = item.title.split(/[:\-\|]/)[0].trim();
        const segment = guessSegment(text);
        const roleKeywords = roleKeywordsForSegment(segment);
        insights.push({
          region: src.region,
          source: src.name,
          company: companyGuess,
          segment,
          buyingSignal: top.signalType,
          signalScore: top.score,
          outreachAngle: top.angle,
          headline: item.title,
          link: item.link,
          publishedAt: item.pubDate || null,
          prospectRoleSuggestion: roleKeywords.join(' / '),
          linkedinSearchUrl: buildLinkedInSearchUrl(companyGuess, roleKeywords),
          _roleKeywords: roleKeywords
        });
      }
    } catch (e) {
      console.error('Failed source', src.name, e.message);
    }
  }

  insights.sort((a, b) => b.signalScore - a.signalScore);

  // Enrich only the top N highest-scoring leads to conserve Apollo credits
  const toEnrich = insights.slice(0, APOLLO_ENRICH_TOP_N);
  for (const lead of toEnrich) {
    const prospect = await findProspect(lead.company, lead._roleKeywords);
    if (prospect) Object.assign(lead, prospect);
  }
  insights.forEach(i => delete i._roleKeywords);

  const output = { generatedAt: new Date().toISOString(), insights };
  fs.writeFileSync(path.join(__dirname, '..', 'data', 'latest.json'), JSON.stringify(output, null, 2));
  console.log(`Generated ${insights.length} insights, enriched top ${toEnrich.length} via Apollo.`);

  await syncInsightsToSheet(insights);
}

run();