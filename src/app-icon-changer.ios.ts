import { AppIconChangeOptions, AppIconChangerApi } from './app-icon-changer.common';
import * as application from "application";
import { topmost } from "tns-core-modules/ui/frame";

export class AppIconChanger implements AppIconChangerApi {
  _supportsAlternateIcons(): boolean {
    // available since iOS 10.3
    return application.ios.nativeApp.supportsAlternateIcons;
  }

  _suppressUserNotification(): void {
    const suppressAlertVC = UIViewController.new();
    topmost().ios.controller.presentViewControllerAnimatedCompletion(
        suppressAlertVC,
        false,
        () => suppressAlertVC.dismissViewControllerAnimatedCompletion(false, null));
  }

  isSupported(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      resolve(this._supportsAlternateIcons());
    });
  }

  currentAlternateIcon(): string {
    return this._supportsAlternateIcons() ? application.ios.nativeApp.alternateIconName : null;
  }

  changeIcon(options?: AppIconChangeOptions): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        if (!this.isSupported()) {
          reject("This version of iOS doesn't support alternate icons");
          return;
        }

        // note that this icon must be listed in the app's plist
        application.ios.nativeApp.setAlternateIconNameCompletionHandler(
            options ? options.iconName : null,
            (error?: NSError) => {
              if (error !== null) {
                reject({
                  code: error.code,
                  message: error.localizedDescription
                });
              } else {
                resolve();
              }
            });

        if (options.suppressUserNotification !== false) {
          this._suppressUserNotification();
        }
      } catch (e) {
        reject({
          code: -1,
          message: e
        });
      }
    });
  }
}