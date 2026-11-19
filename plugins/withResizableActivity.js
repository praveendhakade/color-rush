const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = (config) =>
  withAndroidManifest(config, (configWithManifest) => {
    const mainActivity = configWithManifest.modResults.manifest.application[0]
      .activity.find((activity) => activity.$['android:name']?.endsWith('.MainActivity'));

    if (!mainActivity) {
      throw new Error('Could not find the Android MainActivity in the manifest.');
    }

    mainActivity.$['android:resizeableActivity'] = 'true';

  const features = configWithManifest.modResults.manifest['uses-feature'] ?? [];
  const microphoneFeature = features.find(
    (feature) => feature.$['android:name'] === 'android.hardware.microphone',
  );
  if (microphoneFeature) {
    microphoneFeature.$['android:required'] = 'false';
  } else {
    features.push({
      $: {
        'android:name': 'android.hardware.microphone',
        'android:required': 'false',
      },
    });
  }
  configWithManifest.modResults.manifest['uses-feature'] = features;
    return configWithManifest;
  });
