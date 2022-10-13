const SEP = '/';

function dirname(path: string): string {
    return stackToPath(pathToStack(path).slice(0, -1));
}

function relative(from: string, to: string): string {
    if (!from) {
        return to;
    }

    const fromStack = pathToStack(from);
    const toStack = pathToStack(to);

    const firstDiffIdx = fromStack.findIndex((value, idx) => value != toStack[idx]);

    const resultStack: string[] = [];

    for (let i = firstDiffIdx; i < fromStack.length - 1; i++) {
        resultStack.push('..');
    }

    for (let i = firstDiffIdx; i < toStack.length; i++) {
        resultStack.push(toStack[i]);
    }

    return stackToPath(resultStack);
}

function pathToStack(path: string): string[] {
    return path.split(SEP);
}

function stackToPath(stack: string[]): string {
    return stack.join(SEP);
}

export { dirname, relative }
