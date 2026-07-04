// Buying-signal keyword taxonomy mapped to outreach angles.
// Score = urgency weight (higher = warmer lead)
module.exports = [
  {keyword: /tender|rfp|invitation to bid|request for proposal/i, signalType:"Active Tender/RFP", score:9,
    angle:"They have an open procurement process — position as a compliant, evaluated vendor and offer a scoping call before the deadline."},
  {keyword: /contract award(ed)?|awarded to|wins contract/i, signalType:"Contract Awarded (Competitor)", score:6,
    angle:"A competitor just won this account — reach out to the runner-up stakeholders or adjacent departments for a future-proofing / multi-vendor conversation."},
  {keyword: /funding|raises|series [a-e]|investment|grant/i, signalType:"Funding Round / Grant", score:8,
    angle:"Fresh capital often means budget for new tools — congratulate them and pitch how your platform helps scale faster."},
  {keyword: /partnership|collaborat(e|ion)|mou signed/i, signalType:"New Partnership", score:5,
    angle:"New partnerships often need integration or LMS support — offer to be the technology backbone for the initiative."},
  {keyword: /hiring|job opening|is looking for|new role|vacancy/i, signalType:"Key Hiring Signal", score:7,
    angle:"A newly hired decision-maker (Head of L&D, Procurement Lead) is evaluating vendors in their first 90 days — reach out with a welcome + intro pitch."},
  {keyword: /digital transformation|going digital|adopts? (a |an )?(lms|platform)|migrat(e|ion) to/i, signalType:"Digital Transformation Initiative", score:8,
    angle:"They are actively modernizing infrastructure — position your platform as the modern alternative to legacy systems."},
  {keyword: /expands?|expansion|new market|launches in/i, signalType:"Market Expansion", score:6,
    angle:"Expansion usually needs scalable training/content infrastructure — pitch localization and multi-region rollout support."},
  {keyword: /report|whitepaper|survey|research shows/i, signalType:"Market Research Signal", score:3,
    angle:"Use this as a conversation starter referencing the report's findings relevant to their strategy."}
];