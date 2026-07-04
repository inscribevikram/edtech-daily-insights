import fs from 'fs';
import path from 'path';

// Serves the latest generated insights JSON to the frontend.
export default function handler(req, res) {
  const filePath = path.join(process.cwd(), 'data', 'latest.json');
  if (!fs.existsSync(filePath)) {
    return res.status(200).json({ generatedAt: null, insights: [] });
  }
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const { region } = req.query;
  if (region && region !== 'All') {
    data.insights = data.insights.filter(i => i.region === region);
  }
  res.status(200).json(data);
}