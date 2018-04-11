/* global Prism, MutationObserver */

'use strict';

import { h } from 'dom-chef';
import elementReady from 'element-ready';
import debounce from '../debounce';
import { getLanguageClass } from '../syntax-highlight/source-handler';

import '../syntax-highlight/prism.css';
import '../syntax-highlight/fix.css';

const codeContainerObserver = new MutationObserver(mutations => {
    mutations.forEach(mutation =>
        syntaxHighlightSourceCodeLines($(mutation.target))
    );
});

let debouncedSideDiffHandler = null;

export default function syntaxHighlight(diff, afterWordDiff) {
    // File was only renamed, there's no diff
    if (diff.querySelector('.content-container')) {
        return;
    }
    // Diff failed because pull request is too big
    if (diff.querySelector('div.too-big-message')) {
        return;
    }

    const languageClass = getLanguageClass(diff);

    if (!languageClass) {
        return;
    }

    if (!diff.classList.contains(languageClass)) {
        diff.classList.add(languageClass);
    }

    const $diff = $(diff);
    syntaxHighlightSourceCodeLines($diff);

    afterWordDiff(() => syntaxHighlightSourceCodeLines($diff));

    const codeContainer = diff.querySelector('.refract-content-container');
    codeContainerObserver.observe(codeContainer, { childList: true });
}

function syntaxHighlightSourceCodeLines($diff) {
    const sourceLines = Array.from(
        $diff.find('pre:not([class*=language]), pre:has(ins), pre:has(del)')
    );

    sourceLines.forEach(preElement => {
        Prism.highlightElement(preElement);
    });
}
