# 自动更新相对路径

## 插件作用

Obsidian 的 “Automatically update internal links” 选项实现的有问题。文件移动后，只会自动更新指向这个文件的链接，不会更新这个文件内指向其他文件的链接。这个插件就是用来解决这个问题的。另外还提供了一个批量修正所有已经存在的链接的命令。

例如有两个文件如下：

`dirA/fileA`:

```markdown
[fileB](../dirB/fileB.md)
```

`dirB/fileB`:

```markdown
[fileA](../dirA/fileA.md)
```

将 `fileA` 从 `dirA` 移动到 `dirB` 后：

`dirB/fileA`:

```markdown
[fileB](../dirB/fileB.md)
```

`dirB/fileB`:

```markdown
[fileA](fileA.md)
```

这个插件的作用，就是将 `dirB/fileA` 中的 `[fileB](../dirB/fileB.md)` 修复成 `[fileB](fileB.md)`。

## 使用方法

插件包含两个功能：

第一个功能：文件移动后，自动修复链接的相对路径。安装并启用插件后，移动文件会自动触发，无需其他操作。

第二个功能：批量将所有文件中的链接修复为相对路径。打开命令面板（默认快捷键是 `Ctrl + P`），搜索“Update all relative links”，回车执行。

## 插件限制

必须关闭 `Use [[Wikilinks]]` 选项，使用 Markdown 的链接语法。使用相对路径的意义也是为了让笔记更通用，如果还使用 Wiki Links，就没必要使用相对路径了。

## 为什么使用相对路径

Obsidian 的一大优势就是笔记完全由 Markdown 文件组成，不用担心迁移的问题。使用相对路径，可以使笔记有更好的通用性。例如使用其他 Markdown 编辑器查看、编辑笔记。如果使用 Git 同步笔记，还可以在网页上直接查看笔记。如果不使用相对路径，笔记中的链接，将只能在 Obsidian 中被识别。
