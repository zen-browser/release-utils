import { create } from 'xmlbuilder2';
import releases from './releases.json';
import fs from 'fs';
import commandLineArgs from 'command-line-args';

const templateMetadata = `
<?xml version="1.0" encoding="UTF-8"?>
<component type="desktop-application">
    <metadata_license>MIT</metadata_license>
    <project_license>MPL-2.0</project_license>
    <id>app.zen_browser.zen</id>
    <name>Zen</name>
    <summary>Stay focused, browse faster</summary>
    <developer id="app.zen_browser.zen">
       <name>Zen Team</name>
    </developer>
    <replaces>
      <id>io.github.zen_browser.zen</id>
    </replaces>

    <description>
        <p>Zen is the best way to browse the web. Beautifully designed, privacy-focused, and packed with features. We care about your experience, not your data.</p>
        <ul>
            <li>Split view</li>
            <li>Web sidebar</li>
            <li>Tab groups</li>
            <li>Customizable interface</li>
            <li>Vertical tabs</li>
            <li>And more…</li>
        </ul>
    </description>

    <url type="homepage">https://zen-browser.app</url>
    <url type="bugtracker">https://github.com/zen-browser/desktop/issues</url>
    <url type="help">https://docs.zen-browser.app</url>
    <url type="faq">https://docs.zen-browser.app/faq</url>
    <url type="donation">https://www.patreon.com/zen_browser</url>
    <url type="translate">https://crowdin.com/project/zen-browser</url>
    <url type="contact">https://discord.gg/zen-browser</url>
    <url type="vcs-browser">https://github.com/zen-browser</url>
    <url type="contribute">https://docs.zen-browser.app/contribute/CONTRIBUTING</url>

    <branding>
        <color type="primary" scheme_preference="light">#d9d9d9</color>
        <color type="primary" scheme_preference="dark">#f5f5f5</color>
    </branding>

    <screenshots>
        <screenshot type="default">
            <image>https://raw.githubusercontent.com/zen-browser/www/refs/heads/main/src/assets/browser.png</image>
        </screenshot>
        <screenshot>
            <image>https://raw.githubusercontent.com/zen-browser/www/refs/heads/main/src/assets/browser-splitview.png</image>
        </screenshot>
        <screenshot>
            <image>https://raw.githubusercontent.com/zen-browser/www/refs/heads/main/src/assets/browser-compactmode.png</image>
        </screenshot>
    </screenshots>

    <content_rating type="oars-1.1" />
    <launchable type="desktop-id">app.zen_browser.zen.desktop</launchable>

    <requires>
        <display_length compare="ge">450</display_length>
    </requires>

    <recommends>
        <internet>always</internet>
    </recommends>

    <supports>
        <control>pointing</control>
        <control>keyboard</control>
    </supports>

</component>
`;


const metadata = create(templateMetadata);

interface Releases {
    [version: string]: {
        date: string;
    }
}

function createReleasesTag(releases: Releases) {
    let releasesTag = metadata.root().ele('releases');

    for (const [version, release] of Object.entries(releases).map((val) => val).reverse()) {
        releasesTag = releasesTag.ele('release', { version , date: release.date })
            .ele('url', { type: 'details' })
                .txt(`https://zen-browser.app/release-notes/${version}`)
                .up()
            .up();
    }
}

function createAndPushNewRelease(version: string): Releases {
    const date = new Date();
    const dateStr = date.toISOString();

    const releasesCopy: Releases = { ...releases };
    releasesCopy[version] = { date: dateStr };

    fs.writeFileSync(__dirname + '/releases.json', JSON.stringify(releasesCopy, null, 4));
    console.log(`New release ${version} added! (${__dirname}/releases.json)`);

    return releasesCopy;
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

    const releases = createAndPushNewRelease(options.version);
    createReleasesTag(releases);

    const xml = metadata.end({ prettyPrint: true });
    
    // write to releases.xml
    fs.writeFileSync('releases.xml', xml);
}

main();
