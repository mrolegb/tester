/*
  Agentic testing demo:
  1) Run jest and produce JSON report
  2) Ask OpenAI model to evaluate test quality and suggest improvements
*/
const fs = require('fs');
const { execSync } = require('child_process');

async function run() {
  try {
    execSync('npm run test:json', { stdio: 'inherit' });
  } catch (_e) {
    // keep going; we still want to analyze failing test output
  }

  if (!process.env.OPENAI_API_KEY) {
    console.error('OPENAI_API_KEY is missing.');
    process.exit(1);
  }

  const reportPath = 'jest-results.json';
  const report = fs.existsSync(reportPath)
    ? fs.readFileSync(reportPath, 'utf-8')
    : '{}';

  const prompt = `You are a senior QA engineer.

Given this Jest JSON report, provide:
1) quick status summary
2) whether tests look meaningful or shallow
3) 3 concrete additional tests to increase confidence
4) high-risk blind spots

JEST REPORT:
${report.slice(0, 12000)}`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are precise and concise.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.2,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error('OpenAI API error:', text);
    process.exit(1);
  }

  const data = await response.json();
  const answer = data.choices?.[0]?.message?.content || 'No response';

  fs.mkdirSync('reports', { recursive: true });
  fs.writeFileSync('reports/agentic-test-review.md', answer, 'utf-8');
  console.log('\n=== Agentic Test Review ===\n');
  console.log(answer);
  console.log('\nSaved: reports/agentic-test-review.md');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
