import { readFile, writeFile } from 'node:fs/promises';

// See https://github.com/jackellenberger/emojme#finding-a-slack-token for SLACK_USER_TOKEN + SLACK_USER_COOKIE

// Create the form
const form = new FormData();
form.append('expiration', '99999');
form.append('max_signups', '100');
form.append('set_active', 'true');
form.append('token', process.env.SLACK_USER_TOKEN);

// Send the request
const resp = await fetch(
    'https://mattipv4.slack.com/api/users.admin.createSharedInvite',
    {
        method: 'POST',
        headers: {
            Cookie: `d=${encodeURIComponent(process.env.SLACK_USER_COOKIE)}`,
        },
        body: form,
    },
);

// Get the response
if (!resp.ok) throw new Error(`Slack API returned ${resp.status}: ${resp.statusText}\n${await resp.text().catch(() => '')}`);
const data = await resp.json();
if (!data.ok) throw new Error(`Slack API returned error: ${data.error}`);

// Generate the new files
const template = await readFile(new URL('./template.html', import.meta.url), 'utf8');
const result = template.replace(/\{\{INVITE}}/g, data.url);
await writeFile(new URL('../index.html', import.meta.url), result);
await writeFile(new URL('../404.html', import.meta.url), result);
