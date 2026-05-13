import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

type ChatChoice = { message?: { content?: string } };
type ChatResponse = { choices?: ChatChoice[] };

function readSafe(filePath: string): string {
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf-8') : '';
}

function callOpenAI(prompt: string): Promise<string> {
  if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY is missing.');

  return fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      temperature: 0.2,
      messages: [
        { role: 'system', content: 'You are a strict backend QA + code reviewer.' },
        { role: 'user', content: prompt },
      ],
    }),
  })
    .then(async (response) => {
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`OpenAI API error: ${response.status} ${text}`);
      }
      return (await response.json()) as ChatResponse;
    })
    .then((data) => data.choices?.[0]?.message?.content || 'No response');
}

async function run() {
  const root = path.resolve(__dirname, '..');
  const reportsDir = path.join(root, 'reports');
  const reviewPath = path.join(reportsDir, 'agentic-test-review.md');
  const generatedTestsPath = path.join(root, 'tests', 'agent.generated.test.ts');

  try {
    execSync('npm run test:json', { stdio: 'inherit' });
  } catch {
    // keep going to analyze failures
  }

  const jestReport = readSafe(path.join(root, 'jest-results.json')).slice(0, 20000);

  const sourceFiles = ['src/app.ts', 'src/db.ts', 'src/server.ts', 'tests/users.test.ts']
    .map((p) => `\n===== ${p} =====\n${readSafe(path.join(root, p))}`)
    .join('\n');

  const reviewPrompt = `Review this project code + Jest results.\n\nReturn markdown sections:\n1) Status\n2) Critical risks\n3) Missing tests\n4) Code improvements\n\nJEST JSON:\n${jestReport}\n\nCODE:\n${sourceFiles}`;

  const generatedTestPrompt = `Based on the code below, generate ONE complete Jest+Supertest TypeScript test file that adds high-value missing API tests.\n\nRules:\n- Return ONLY code, no markdown fences\n- File must run under ts-jest\n- Focus on edge cases and error handling\n\nCODE:\n${sourceFiles}`;

  const [review, generatedTests] = await Promise.all([
    callOpenAI(reviewPrompt),
    callOpenAI(generatedTestPrompt),
  ]);

  fs.mkdirSync(reportsDir, { recursive: true });
  fs.writeFileSync(reviewPath, review, 'utf-8');

  const cleaned = generatedTests.replace(/^```[a-zA-Z]*\n?/, '').replace(/```\s*$/, '');
  fs.writeFileSync(generatedTestsPath, cleaned, 'utf-8');

  console.log(`Saved review: ${reviewPath}`);
  console.log(`Saved generated tests: ${generatedTestsPath}`);
}

run().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
