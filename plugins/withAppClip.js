const { withXcodeProject, withDangerousMod, withPlugins } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const TARGET_NAME = 'GoodRunssClip';
const BUNDLE_ID = 'com.goodrunss.app.Clip';

const withAppClipXcode = (config) => {
    return withXcodeProject(config, (config) => {
        const project = config.modResults;
        const projectRoot = config.modRequest.projectRoot; // Provide access to project root for file ops

        // --- 1. File Copying (Assets -> iOS) ---
        const iosDir = path.join(projectRoot, 'ios');
        const clipDir = path.join(iosDir, TARGET_NAME);
        if (!fs.existsSync(clipDir)) {
            fs.mkdirSync(clipDir, { recursive: true });
        }

        // Copy persistent assets to the native directory
        const assetsClipDir = path.join(projectRoot, 'assets', 'clip');
        if (fs.existsSync(assetsClipDir)) {
            ['Info.plist', 'GoodRunssClip.entitlements', 'main.m'].forEach(file => {
                if (fs.existsSync(path.join(assetsClipDir, file))) {
                    fs.copyFileSync(path.join(assetsClipDir, file), path.join(clipDir, file));
                }
            });
        }

        // --- 2. Target Creation ---
        if (project.pbxTargetByName(TARGET_NAME)) {
            return config;
        }

        // Create target (workaround: use 'application' type then patch)
        const target = project.addTarget(TARGET_NAME, 'application', TARGET_NAME, BUNDLE_ID);

        // Patch Product Type to App Clip
        const targetUuid = target.uuid;
        const nativeTarget = project.pbxNativeTargetSection()[targetUuid];
        if (nativeTarget) {
            nativeTarget.productType = '"com.apple.product-type.application.on-demand-install-capable"';
        }

        // --- 3. Build Phases ---

        // Add "Bundle React Native" Phase
        // This is critical. It must point to index.clip.js via ENTRY_FILE
        project.addBuildPhase(
            [],
            'PBXShellScriptBuildPhase',
            'Bundle React Native code and images',
            targetUuid,
            {
                shellPath: '/bin/sh',
                shellScript: `
export NODE_BINARY=node
export ENTRY_FILE=index.clip.js
export BUNDLE_COMMAND=ram-bundle
../node_modules/react-native/scripts/react-native-xcode.sh
`
            }
        );

        // --- 4. Main App Embedding ---
        const mainTargetUuid = project.findTargetKey(config.ios?.bundleIdentifier || 'com.goodrunss.app');
        if (mainTargetUuid) {
            // Build phase to embed the clip
            project.addBuildPhase(
                [],
                'PBXCopyFilesBuildPhase',
                'Embed App Clips',
                mainTargetUuid,
                'app_clip' // This usually sets dstSubfolderSpec to 16 automatically in modern xcode lib? Verify if needed.
            );
        }

        // --- 5. Add Files to Target (Basic) ---
        // Manually adding the files we copied to the PBXGroup and Target checks
        // This part is often simplified in Expo plugins, assuming Xcode picks up the folder structure
        // or using 'project.addFile' if specific references are needed.
        // For now, we rely on the files existing on disk.

        return config;
    });
};

const withAppClipPodfile = (config) => {
    return withDangerousMod(config, [
        'ios',
        async (config) => {
            const podfilePath = path.join(config.modRequest.projectRoot, 'ios', 'Podfile');
            let podfileContent = fs.readFileSync(podfilePath, 'utf8');

            if (!podfileContent.includes(`target '${TARGET_NAME}' do`)) {
                // Insert after the main target block
                // Simple heuristic: simple Append for now, or look for 'post_install'

                const podInsertion = `
target '${TARGET_NAME}' do
  use_expo_modules!
  config = use_native_modules!

  use_frameworks! :linkage => :static

  use_react_native!(
    :path => config[:reactNativePath],
    :hermes_enabled => true,
    :fabric_enabled => false,
    :app_path => "#{Pod::Config.instance.installation_root}/.."
  )
end
`;
                // Append to end of Podfile (before the final 'end' if it exists, or just append)
                // Integrating properly into the main block structure is better.
                // We'll append it before the `post_install` block if possible, or just at the end.

                podfileContent += podInsertion;
                fs.writeFileSync(podfilePath, podfileContent);
            }
            return config;
        }
    ]);
};


module.exports = (config) => {
    return withPlugins(config, [
        withAppClipXcode,
        withAppClipPodfile
    ]);
};
