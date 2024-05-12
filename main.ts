import { App, Modal, Notice, Plugin, Setting, TFile } from 'obsidian';
import { dirname, relative } from './lib/path';

class ConfirmModal extends Modal {
    content: string;
    onConfirm: () => void;

    constructor(app: App, content: string, onConfirm: () => void) {
        super(app);

        this.content = content;
        this.onConfirm = onConfirm;
    }

    onOpen() {
        const { contentEl } = this;

        contentEl.createEl('h1', { text: 'Update Releate Links Plugin' });
        contentEl.createEl('p', { text: this.content });

        new Setting(contentEl)
            .addButton((btn) => btn
                .setButtonText('Yes')
                .setCta()
                .onClick(() => {
                    this.close();
                    this.onConfirm();
                }))
            .addButton((btn) => btn
                .setButtonText('No')
                .onClick(() => {
                    this.close();
                }));
    }

    onClose() {
        this.contentEl.empty();
    }
}

export default class UpdateRelativeLinksPlugin extends Plugin {
    async onload() {
        const { app } = this;
        const { metadataCache, vault } = app;

        this.addCommand({
            id: 'update-all-relative-links',
            name: 'Update all relative links',
            callback() {
                new ConfirmModal(app, 'Are you sure you want to convert all relative links?', () => {
                    const promises = vault.getMarkdownFiles().map(file => replace(file, false));

                    Promise.all(promises).then(linkCounts => {
                        const updatedLinkCounts = linkCounts.filter(count => count > 0);

                        const linkCount = updatedLinkCounts.reduce((sum, count) => sum + count, 0);
                        const fileCount = updatedLinkCounts.length;

                        new Notice(`Update ${linkCount} links in ${fileCount} file${fileCount > 1 ? 's' : ''}.`);
                    }).catch(err => {
                        new Notice('Update links error, see console.');
                        console.error(err);
                    });
                }).open();
            }
        });

        this.registerEvent(vault.on('rename', (file, oldPath) => {
            if (!oldPath
                || !file.path.toLocaleLowerCase().endsWith('.md')
                || file.parent?.path === dirname(oldPath)) {
                return;
            }

            if (file instanceof TFile) {
                setTimeout(() => replace(file, true), 100);
            }
        }));

        async function replace(file: TFile, notice: boolean) {
            const metadata = metadataCache.getFileCache(file);
            const links = [...(metadata?.links ?? []), ...(metadata?.embeds ?? [])];
            const replacePairs = links.map(({ link, original }) => {
                const linkPath = link.replace(/#.*$/, '');

                if (!linkPath) {
                    return null;
                }

                const linkFile = metadataCache.getFirstLinkpathDest(linkPath, file.path);

                if (!linkFile) {
                    return null;
                }

                const newLinkPath = file.parent?.path === '/' ? linkFile.path : relative(file.path, linkFile.path);

                if (linkPath === newLinkPath) {
                    return null;
                }

                const newOriginal = replaceOriginal(original, linkPath, newLinkPath);
                return [original, newOriginal];
            }).filter(pair => pair);

            if (!replacePairs?.length) {
                return 0;
            }

            try {
                const content = await vault.read(file);

                const replacedContent = replacePairs.reduce((tmpContent, pair) => {
                    return pair?.length === 2 ? tmpContent.replace(pair[0], pair[1]) : tmpContent;
                }, content);

                await vault.modify(file, replacedContent);

                const msg = `Update ${replacePairs.length} links in ${file.path}.`;
                console.log(msg);
                if (notice) {
                    new Notice(msg);
                }
                return replacePairs.length;
            } catch (e) {
                console.error(e);
                if (notice) {
                    new Notice('Update links error, see console.');
                }
                throw e;
            }
        }

        function replaceOriginal(original: string, link: string, newLink: string) {
            let newOriginal = replaceWithFormat(original, link, newLink, s => s.replace(/ /g, '%20'));
            if (original === newOriginal) {
                newOriginal = replaceWithFormat(original, link, newLink, encodeURI);
            }
            if (original === newOriginal) {
                newOriginal = original.replace(/^(!?\[.*?\]).*$/, `$1(${encodeURI(newLink)})`)
            }
            return newOriginal;
        }

        function replaceWithFormat(str: string, from: string, to: string, format: (s: string) => string) {
            return str.replace(format(from), format(to));
        }
    }
}
