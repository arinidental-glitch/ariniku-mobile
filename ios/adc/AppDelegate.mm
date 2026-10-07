#import "AppDelegate.h"

#import <Firebase/Firebase.h>
#import <FirebaseCore/FirebaseCore.h>

#import <React/RCTBundleURLProvider.h>
#import <React/RCTLinkingManager.h>
#import <React/RCTBridge.h>

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application
    didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
    // Firebase
    [FIRApp configure];

    NSLog(@"🔥 DEFAULT FIREBASE APP = %@", [FIRApp defaultApp]);

    self.moduleName = @"main";
    self.initialProps = @{};

    NSLog(@"===== BEFORE SUPER APP =====");

    BOOL result = [super application:application
        didFinishLaunchingWithOptions:launchOptions];

    NSLog(@"===== AFTER SUPER APP: %d =====", result);

    return result;
}

// IMPORTANT:
// Expo SDK 54 expects sourceURLForBridge:
- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
#if DEBUG
    NSURL *url =
        [[RCTBundleURLProvider sharedSettings]
            jsBundleURLForBundleRoot:@".expo/.virtual-metro-entry"];

    NSLog(@"===== BUNDLE URL: %@ =====", url);

    return url;
#else
    NSURL *url =
        [[NSBundle mainBundle]
            URLForResource:@"main"
            withExtension:@"jsbundle"];

    NSLog(@"===== RELEASE BUNDLE URL: %@ =====", url);

    return url;
#endif
}

// Linking API
- (BOOL)application:(UIApplication *)application
            openURL:(NSURL *)url
            options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options
{
    return [super application:application
                       openURL:url
                       options:options]
        || [RCTLinkingManager application:application
                                   openURL:url
                                   options:options];
}

// Universal Links
- (BOOL)application:(UIApplication *)application
 continueUserActivity:(nonnull NSUserActivity *)userActivity
 restorationHandler:(nonnull void (^)(NSArray<id<UIUserActivityRestoring>> * _Nullable))restorationHandler
{
    BOOL result =
        [RCTLinkingManager application:application
                 continueUserActivity:userActivity
                   restorationHandler:restorationHandler];

    return [super application:application
        continueUserActivity:userActivity
          restorationHandler:restorationHandler] || result;
}

// Remote notifications
- (void)application:(UIApplication *)application
didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken
{
    [super application:application
didRegisterForRemoteNotificationsWithDeviceToken:deviceToken];
}

- (void)application:(UIApplication *)application
didFailToRegisterForRemoteNotificationsWithError:(NSError *)error
{
    [super application:application
didFailToRegisterForRemoteNotificationsWithError:error];
}

- (void)application:(UIApplication *)application
didReceiveRemoteNotification:(NSDictionary *)userInfo
fetchCompletionHandler:(void (^)(UIBackgroundFetchResult))completionHandler
{
    [super application:application
didReceiveRemoteNotification:userInfo
fetchCompletionHandler:completionHandler];
}

@end