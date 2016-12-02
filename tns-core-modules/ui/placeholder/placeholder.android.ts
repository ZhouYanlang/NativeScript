﻿import { Placeholder as PlaceholderDefinition, CreateViewEventData } from "ui/placeholder"
import { View } from "ui/core/view";

export class Placeholder extends PlaceholderDefinition {
    public static creatingViewEvent = "creatingView";

    private _android: android.view.View;

    public _createUI() {
        let args = <CreateViewEventData>{ eventName: Placeholder.creatingViewEvent, object: this, view: undefined, context: this._context };
        this.notify(args);
        this._android = <android.view.View>args.view;
    }

    get android(): android.view.View {
        return this._android;
    }

    get _nativeView(): android.view.View {
        return this._android;
    }
}