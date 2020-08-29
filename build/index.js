const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs').promises;
const path = require('path');

process.on('unhandledRejection', e => { throw e; });

const main = async () => {
    // Create the form
    const form = new FormData();
    form.append('expiration', '99999');
    form.append('max_signups', '99999');
    form.append('set_active', 'true');
    form.append('token', process.env.SLACK_USER_TOKEN);

    // Send the request
    const resp = await fetch(
        'https://mattipv4.slack.com/api/users.admin.createSharedInvite',
        {
            method: 'POST',
            body: form,
        },
    );
    const data = await resp.json();

    // Generate the new files
    const template = await fs.readFile(path.join(__dirname, 'template.html'), 'utf8');
    const result = template.replace(/{{INVITE}}/g, data.url);
    await fs.writeFile(path.join(__dirname, '..', 'index.html'), result);
    await fs.writeFile(path.join(__dirname, '..', '404.html'), result);
};

main().catch(e => { throw e; });
