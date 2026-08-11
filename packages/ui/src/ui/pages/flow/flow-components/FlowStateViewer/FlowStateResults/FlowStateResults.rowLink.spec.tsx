/**
 * @jest-environment jsdom
 */
import fs from 'fs';
import path from 'path';
import React from 'react';
import {render} from '@testing-library/react';
import {Icon, Link} from '@gravity-ui/uikit';
import {Database} from '@gravity-ui/icons';
import cn from 'bem-cn-lite';
import sass from 'sass';

const block = cn('yt-flow-state-results');

function readNodeModulesFile(relativePath: string) {
    return fs.readFileSync(path.join(process.cwd(), 'node_modules', relativePath), 'utf8');
}

function injectStylesheet(css: string) {
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
}

beforeAll(() => {
    injectStylesheet(readNodeModulesFile('@gravity-ui/uikit/build/esm/components/Icon/Icon.css'));
    injectStylesheet(readNodeModulesFile('@gravity-ui/uikit/build/esm/components/Link/Link.css'));

    const scssSource = fs.readFileSync(path.join(__dirname, 'FlowStateResults.scss'), 'utf8');
    const compiled = sass.compileString(scssSource);
    injectStylesheet(compiled.css);
});

test('row-link icon anchor is a centered flex container, not a bare inline anchor', () => {
    const {container} = render(
        <span className={block('hover-action')}>
            <Link className={block('row-link')} href="//path/to/state" title="Open state table">
                <Icon data={Database} size={14} />
            </Link>
        </span>,
    );

    const anchor = container.querySelector('a');
    expect(anchor).not.toBeNull();

    const computed = getComputedStyle(anchor as HTMLAnchorElement);
    expect(computed.display).toBe('inline-flex');
    expect(computed.alignItems).toBe('center');
});

test('un-fixed bare anchor falls back to plain inline display (regression guard)', () => {
    const {container} = render(
        <span className={block('hover-action')}>
            <Link href="//path/to/state" title="Open state table">
                <Icon data={Database} size={14} />
            </Link>
        </span>,
    );

    const anchor = container.querySelector('a');
    const computed = getComputedStyle(anchor as HTMLAnchorElement);
    expect(computed.display).not.toBe('inline-flex');
});
