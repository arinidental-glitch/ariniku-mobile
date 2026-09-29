import Expo
import React
import ReactAppDependencyProvider

class ReactNativeDelegate: ExpoReactNativeFactoryDelegate {

  override func sourceURL(for bridge: RCTBridge) -> URL? {
    return bridge.bundleURL ?? bundleURL()
  }

  override func bundleURL() -> URL? {
#if DEBUG
    return RCTBundleURLProvider.sharedSettings().jsBundleURL(
      forBundleRoot: ".expo/.virtual-metro-entry"
    )
#else
    return Bundle.main.url(
      forResource: "main",
      withExtension: "jsbundle"
    )
#endif
  }
}