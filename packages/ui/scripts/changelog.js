const {execFileSync} = require('child_process');
const {stdout} = require('process');

const {version} = require('../package.json');

function execArc(args) {
    return execFileSync('arc', args, {encoding: 'utf-8'});
}

function getRecentVersionCommit() {
    const changelogBlame = execArc(['blame', '--json', 'CHANGELOG.md']);
    const {annotation} = JSON.parse(changelogBlame);
    const {commit} = annotation.find((x) => x.text.startsWith('##'));
    return commit;
}

function getPrsSince(commit) {
    const log = execArc(['log', '--json', `${commit}..HEAD`, '.']);
    const commits = JSON.parse(log);
    const prs = commits.filter((x) => x.attributes?.['pr.id']).map((x) => x.attributes['pr.id']);
    return prs;
}

function getPrDescription(pr) {
    const status = execArc(['pr', 'status', '--json', pr]);
    const {description} = JSON.parse(status);
    return description;
}

function getChangelog(prDescription) {
    const changelogRe = /<!-- yt changelog start -->([\s\S]+)<!-- yt changelog end -->/;
    const match = changelogRe.exec(prDescription);
    return match?.[1]?.trim?.();
}

function collect() {
    const versionCommit = getRecentVersionCommit();
    const prsSinceBump = getPrsSince(versionCommit);
    const descriptions = prsSinceBump.map(getPrDescription);
    const changes = descriptions.map(getChangelog).filter(Boolean);

    stdout.write(`## ${version}\n`);
    changes.forEach((x) => stdout.write(`${x}\n`));
}

function check(pr) {
    const description = getPrDescription(pr);
    const change = getChangelog(description);

    process.exit(change ? 0 : 1);
}

switch (process.argv[2]) {
    case 'collect': {
        collect();
        break;
    }
    case 'check': {
        check(process.argv[3]);
        break;
    }
}
