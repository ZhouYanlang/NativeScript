﻿/**
 * Contains the ActivityIndicator class, which represents a widget for showing that something is currently busy.
 */
declare module "ui/activity-indicator" {
    import { View } from "ui/core/view";
    import { Property } from "ui/core/properties";

    /**
     * Represents a UI widget which displays a progress indicator hinting the user for some background operation running.
     */
    export class ActivityIndicator extends View {
        /**
         * Gets the native [android widget](http://developer.android.com/reference/android/widget/ProgressBar.html) that represents the user interface for this component. Valid only when running on Android OS.
         */
        android: any /* android.widget.ProgressBar */;

        /**
         * Gets the native iOS [UIActivityIndicatorView](https://developer.apple.com/library/ios/documentation/UIKit/Reference/UIActivityIndicatorView_Class/index.html) that represents the user interface for this component. Valid only when running on iOS.
         */
        ios: any /* UIActivityIndicatorView */;

        /**
         * Gets or sets a value indicating whether the widget is currently displaying progress.
         */
        busy: boolean;
    }

    /**
     * Represents the busy property of the ActivityIndicator class.
     */
    let busyProperty: Property<ActivityIndicator, boolean>;
}