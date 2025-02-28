
const opts = [];
for (const j of game.journal.contents) opts.push({ label: j.name, value: j.uuid });

const selector = foundry.applications.fields.createSelectInput({
    options: opts,
    name: 'journalSelector'
})

console.log('journal select', selector);

const journalSelected = await new Promise(async () => {
    const journalDialog = await new foundry.applications.api.DialogV2({
        window: { title: 'Create New Feature' },
        content: await renderTemplate(this.TEMPLATES.CREATE),
        buttons: [{
            label: 'Cancel',
            action: 'cancel',
            callback: () => { reject('User Canceled') }
        }],
        close: () => { reject('User Canceled') },
        actions: {
            featureTrait: () => {
                resolve('trait');
                app.close();
            },
            featureItem: () => {
                resolve('item');
                app.close();
            },
            featureEffect: () => {
                resolve('effect');
                app.close();
            }
        }
    }).render(true);
});