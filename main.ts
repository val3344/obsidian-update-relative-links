import { Notice, Plugin, TAbstractFile } from 'obsidian';
import { posix as path } from 'path';

export default class UpdateRelativeLinksPlugin extends Plugin {
    async onload() {
        const { metadataCache, vault } = this.app;

        this.addCommand({
            id: 'update-all-relative-links',
            name: 'Update all relative links',
            callback() {
                const promises = vault.getMarkdownFiles().map((file, idx, arr) => {
                    console.log(`start ${idx + 1}/${arr.length}`);
                    return replace(file, false).finally(() => console.log(`end ${idx + 1}/${arr.length}`));
                });

                Promise.all(promises).finally(() => console.log('all done'));
            }
        });

        this.registerEvent(vault.on('rename', (file, oldPath) => {
            if (!oldPath
                || !file.path.toLocaleLowerCase().endsWith('.md')
                || file.parent.path === path.dirname(oldPath)) {
                return;
            }

            setTimeout(() => replace(file, true), 100);
        }));

        function replace(file: TAbstractFile, notice: boolean) {
            const metadata = metadataCache.getCache(file.path);
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

                const newOriginal = original.replace(link, newLink);
                return [original, newOriginal];
            }).filter(pair => pair);

            if (!replacePairs?.length) {
                return Promise.resolve();
            }

            return vault.adapter.read(file.path).then(content => {
                const replacedContent = replacePairs.reduce((tmpContent, pair) => {
                    return pair?.length === 2 ? tmpContent.replace(pair[0], pair[1]) : tmpContent;
                }, content);

                return vault.adapter.write(file.path, replacedContent);
            }).then(() => {
                const msg = `Update ${replacePairs.length} links in ${file.path}.`;
                console.log(msg);
                if (notice) {
                    new Notice(msg)
                }
            }).catch(err => {
                console.error(err);
                if (notice) {
                    new Notice('Update links error, see console.');
                }
            });
        }
    }
}
