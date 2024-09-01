import { create } from 'xmlbuilder2';
import releases from './releases.json';
import fs from 'fs';
import commandLineArgs from 'command-line-args';

const templateMetadata = `
<?xml version="1.0" encoding="UTF-8"?>
<component type="desktop-application">
    <id>io.github.zen_browser.zen</id>
    <url type="homepage">https://get-zen.vercel.app</url>
    <content_rating type="oars-1.1" />
    <developer id="io.github.zen_browser.zen">
        <name>Zen Team</name>
    </developer>

    <name>Zen Browser</name>
    <summary>A fast, beautifull browser</summary>

    <metadata_license>MIT</metadata_license>
    <project_license>MPL-2.0</project_license>

    <description>
        <p>Zen Browser is a firefox based browser that will change the way you surf the web!</p>

        <ul>
            <li>Split views</li>
            <li>Web Sidebar</li>
            <li>Tab Groups</li>
            <li>Customizable UI</li>
            <li>Vertical Tabs</li>
            <li>And more...</li>
        </ul>
    </description>

    <launchable type="desktop-id">io.github.zen_browser.zen.desktop</launchable>
    <screenshots>
        <screenshot type="default">
            <image>https://raw.githubusercontent.com/zen-browser/www/main/public/browser-1.png</image>
        </screenshot>
        <screenshot>
            <image>https://raw.githubusercontent.com/zen-browser/www/main/public/browser-2.png</image>
        </screenshot>
        <screenshot>
            <image>https://raw.githubusercontent.com/zen-browser/www/main/public/browser-3.png</image>
        </screenshot>
        <screenshot>
            <image>https://raw.githubusercontent.com/zen-browser/www/main/public/browser-4.png</image>
        </screenshot>
    </screenshots>

    <branding>
        <color type="primary" scheme_preference="light">#d9d9d9</color>
        <color type="primary" scheme_preference="dark">#f5f5f5</color>
    </branding>
</component>
`;


const metadata = create(templateMetadata);

interface Releases {
    [version: string]: {
        date: string;
    }
}

function createReleasesTag(releases: Releases) {
    const releasesTag = metadata.root().ele('releases');
    for (const [version, release] of Object.entries(releases)) {
        releasesTag.ele('release', { version , date: release.date })
            .ele('url', { type: 'details' })
                .txt(`https://zen-browser.app/release-notes/${version}`);
    }
}

function createAndPushNewRelease(version: string) {
    const date = new Date();
    const dateStr = date.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
    const releasesCopy: Releases = { ...releases };
    releasesCopy[version] = { date: dateStr };
    createReleasesTag(releases);
    fs.writeFileSync(__dirname + '/releases.json', JSON.stringify(releasesCopy, null, 4));
    console.log(`New release ${version} added! (${__dirname}/releases.json)`);
    return date;
}

const optionDefinitions = [
    { name: 'version', alias: 'v', type: String },
]

function main() {
    const options = commandLineArgs(optionDefinitions);
    if (!options.version) {
        console.error('version is required!');
        return;
    }
    createAndPushNewRelease(options.version);
    createReleasesTag(releases);

    const xml = metadata.end({ prettyPrint: true });
    
    // write to releases.xml
    fs.writeFileSync('releases.xml', xml);
}

main();

