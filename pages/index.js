import { useEffect, useState } from 'react';

const REGIONS = ['All','Global/Europe','UK','Europe','USA','Middle East','APAC','India','Africa','Australia','South America','Canada'];

export default function Home() {
  const [data, setData] = useState({ generatedAt: null, insights: [] });
  const [region, setRegion] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/insights?region=${region}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); });
  }, [region]);

  return (
    <div style={{fontFamily:'Inter, sans-serif', maxWidth:1400, margin:'0 auto', padding:24}}>
      <h1>EdTech Daily Sales Insights</h1>
      <p style={{color:'#666'}}>
        Last generated: {data.generatedAt ? new Date(data.generatedAt).toLocaleString() : 'Not yet run'}
        {' '}| Synced to Google Sheet: {process.env.NEXT_PUBLIC_SHEET_LINK ? <a href={process.env.NEXT_PUBLIC_SHEET_LINK} target="_blank" rel="noreferrer">Open Sheet</a> : 'configure GOOGLE_SHEET_ID'}
      </p>
      <div style={{marginBottom:16}}>
        <label>Filter by region: </label>
        <select value={region} onChange={e => setRegion(e.target.value)}>
          {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>
      {loading ? <p>Loading...</p> : (
        <table border="1" cellPadding="8" style={{borderCollapse:'collapse', width:'100%', fontSize:12}}>
          <thead style={{background:'#f5f5f5'}}>
            <tr>
              <th>Region</th><th>Company</th><th>Segment</th><th>Buying Signal</th>
              <th>Score</th><th>Outreach Angle</th><th>Prospect Name</th><th>Prospect Title</th>
              <th>LinkedIn</th><th>Business Email</th><th>Headline / Source</th>
            </tr>
          </thead>
          <tbody>
            {data.insights.map((row, i) => (
              <tr key={i}>
                <td>{row.region}</td>
                <td>{row.company}</td>
                <td>{row.segment}</td>
                <td>{row.buyingSignal}</td>
                <td>{row.signalScore}</td>
                <td>{row.outreachAngle}</td>
                <td>{row.prospectName || '—'}</td>
                <td>{row.prospectTitle || '—'}</td>
                <td><a href={row.linkedinUrl || row.linkedinSearchUrl} target="_blank" rel="noreferrer">{row.linkedinUrl ? 'Profile' : 'Search'}</a></td>
                <td>{row.businessEmail || 'Enrich via Apollo'}</td>
                <td><a href={row.link} target="_blank" rel="noreferrer">{row.headline}</a> ({row.source})</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}