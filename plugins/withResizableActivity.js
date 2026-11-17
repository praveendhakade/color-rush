const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = (config) =>
  withAndroidManifest(config, (configWithManifest) => {
    const mainActivity = configWithManifest.modResults.manifest.application[0]
      .activity.find((activity) => activity.$['android:name']?.endsWith('.MainActivity'));

    if (!mainActivity) {
      throw new Error('Could not find the Android MainActivity in the manifest.');
    }

    mainActivity.$['android:resizeableActivity'] = 'true';
    return configWithManifest;
  });
