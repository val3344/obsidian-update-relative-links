import { Notice, Plugin, TFile } from 'obsidian';
import { posix as path } from 'path';

export default class UpdateRelativeLinksPlugin extends Plugin {
    async onload() {
        const { metadataCache, vault } = this.app;

        this.addCommand({
            id: 'update-all-relative-links',
            name: 'Update all relative links',
            callback() {
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
            }
        });

        this.registerEvent(vault.on('rename', (file, oldPath) => {
            if (!oldPath
                || !file.path.toLocaleLowerCase().endsWith('.md')
                || file.parent.path === path.dirname(oldPath)) {
                return;
            }

            if (file instanceof TFile) {
                setTimeout(() => replace(file, true), 100);
            }
        }));

        function replace(file: TFile, notice: boolean) {
            const metadata = metadataCache.getFileCache(file);
            const links = [...(metadata?.links ?? []), ...(metadata?.embeds ?? [])];
            const replacePairs = links.map(({ link, original }) => {
                const linkFile = metadataCache.getFirstLinkpathDest(link, file.path);

                if (!linkFile) {
                    return null;
                }

                const newLink = file.parent.path === '/' ? linkFile.path : path.relative(file.parent.path, linkFile.path);

                if (link === newLink) {
                    return null;
                }

                const newOriginal = replaceOriginal(original, link, newLink);
                return [original, newOriginal];
            }).filter(pair => pair);

            if (!replacePairs?.length) {
                return Promise.resolve(0);
            }

            return vault.read(file).then(content => {
                const replacedContent = replacePairs.reduce((tmpContent, pair) => {
                    return pair?.length === 2 ? tmpContent.replace(pair[0], pair[1]) : tmpContent;
                }, content);

                return vault.modify(file, replacedContent);
            }).then(() => {
                const msg = `Update ${replacePairs.length} links in ${file.path}.`;
                console.log(msg);
                if (notice) {
                    new Notice(msg);
                }
                return replacePairs.length;
            }).catch(err => {
                console.error(err);
                if (notice) {
                    new Notice('Update links error, see console.');
                }
                return Promise.reject(err);
            });
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
