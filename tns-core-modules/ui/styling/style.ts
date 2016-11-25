import { Style as StyleDefinition } from "ui/styling/style";
import { Observable } from "data/observable";
import { ViewBase } from "ui/core/view-base";
import { Color } from "color";
import { Font } from "ui/styling/font";
import { Background } from "ui/styling/background";
import { isIOS } from "platform";
import { Property, CssProperty, InheritedCssProperty, ShorthandProperty } from "ui/core/properties";
import { Length } from "ui/core/view";

import { FontWeight, FontStyle } from "ui/enums";

export class Style extends Observable implements StyleDefinition {
    constructor(public view: ViewBase) {
        super();
    }

    private _updateCounter = 0;
    // private _nativeSetters = new Map<Property, any>();

    public fontInternal: Font;
    public backgroundInternal: Background;

    public rotate: number;
    public scaleX: number;
    public scaleY: number;
    public translateX: number;
    public translateY: number;

    public clipPath: string;
    public color: Color;
    public tintColor: Color;
    public placeholderColor: Color;

    public backgroundColor: Color;
    public backgroundImage: string;
    public backgroundRepeat: "repeat" | "repeat-x" | "repeat-y" | "no-repeat";;
    public backgroundSize: string;
    public backgroundPosition: string;

    public borderColor: string | Color;
    public borderTopColor: Color;
    public borderRightColor: Color;
    public borderBottomColor: Color;
    public borderLeftColor: Color;
    public borderWidth: string | number;
    public borderTopWidth: Length;
    public borderRightWidth: Length;
    public borderBottomWidth: Length;
    public borderLeftWidth: Length;
    public borderRadius: string | number;
    public borderTopLeftRadius: number;
    public borderTopRightRadius: number;
    public borderBottomRightRadius: number;
    public borderBottomLeftRadius: number;

    public fontSize: number;
    public fontFamily: string;
    public fontStyle: "normal" | "italic";
    public fontWeight: string;
    public font: string;

    public zIndex: number;
    public opacity: number;
    public visibility: "visible" | "hidden" | "collapse" | "collapsed";

    public letterSpacing: number;
    public textAlignment: "left" | "center" | "right";
    public textDecoration: "none" | "underline" | "lineThrough";
    public textTransform: "none" | "capitalize" | "uppercase" | "lowercase";
    public whiteSpace: "normal" | "nowrap";

    // TODO: Change minWidth/Height to Length to support 'px'
    public minWidth: Length;
    public minHeight: Length;
    public width: Length;
    public height: Length;
    public margin: string;
    public marginLeft: Length;
    public marginTop: Length;
    public marginRight: Length;
    public marginBottom: Length;
    public padding: string;
    public paddingLeft: Length;
    public paddingTop: Length;
    public paddingRight: Length;
    public paddingBottom: Length;
    public horizontalAlignment: "left" | "center" | "middle" | "right" | "stretch";
    public verticalAlignment: "top" | "center" | "middle" | "bottom" | "stretch";

    // TabView-specific props
    public tabTextColor: Color;
    public tabBackgroundColor: Color;
    public selectedTabTextColor: Color;
    public androidSelectedTabHighlightColor: Color;

    //SegmentedBar-specific props
    public selectedBackgroundColor: Color;

    effectiveMinWidth: number;
    effectiveMinHeight: number;
    effectiveWidth: number;
    effectiveHeight: number;
    effectiveMarginTop: number;
    effectiveMarginRight: number;
    effectiveMarginBottom: number;
    effectiveMarginLeft: number;
    effectivePaddingTop: number;
    effectivePaddingRight: number;
    effectivePaddingBottom: number;
    effectivePaddingLeft: number;
    effectiveBorderTopWidth: number;
    effectiveBorderRightWidth: number;
    effectiveBorderBottomWidth: number;
    effectiveBorderLeftWidth: number;

    // public _updateTextDecoration() {
    //     if (this.textDecoration !== TextDecoration.none) {
    //         this._applyProperty(textDecorationProperty, this._getValue(textDecorationProperty));
    // }
    //     }

    // public _updateTextTransform() {
    //     if (this._getValue(textTransformProperty) !== TextTransform.none) {
    //         this._applyProperty(textTransformProperty, this._getValue(textTransformProperty));
    //     }
    // }

    // public _beginUpdate() {
    //     this._updateCounter++;
    // }

    // public _endUpdate() {
    //     this._updateCounter--;
    //     if (this._updateCounter < 0) {
    //         throw new Error("style._endUpdate() called, but no update is in progress.");
    //     }

    //     if (this._updateCounter === 0) {
    //         this._nativeSetters.forEach((newValue, property, map) => { this._applyStyleProperty(property, newValue); });
    //         this._nativeSetters.clear();
    //     }
    // }

    // public _resetCssValues() {
    //     this.view._unregisterAllAnimations();
    //     this._resetValues(ValueSource.Css);
    // }

    // public _resetLocalValues() {
    //     this._resetValues(ValueSource.Local);
    // }

    // public _inheritStyleProperties(parent: View) {
    //     parent.style._eachSetPropertyValue((property, value) => {
    //         if (property.inheritable) {
    //             // this._inheritStyleProperty(property, value);
    //             this._setValue(property, value, ValueSource.Inherited);
    //         }

    //         return true;
    //     });
    // }

    // public _onPropertyChanged(property: Property, oldValue: any, newValue: any) {
    //     if (trace.enabled) {
    //         trace.write(
    //             "Style._onPropertyChanged view:" + this._view +
    //             ", property: " + property.name +
    //             ", oldValue: " + oldValue +
    //             ", newValue: " + newValue, trace.categories.Style);
    //     }

    //     super._onPropertyChanged(property, oldValue, newValue);

    //     this._view._checkMetadataOnPropertyChanged(property.metadata);

    //     this._applyProperty(property, newValue);
    // }

    // public _sizeChanged() {
    //     if (!this.backgroundInternal.isEmpty()) {
    //         this._applyStyleProperty(backgroundInternalProperty, this.backgroundInternal);
    //     }

    //     let clipPathPropertyValue = this.clipPath;
    //     if (types.isString(clipPathPropertyValue) && clipPathPropertyValue !== "") {
    //         this._applyStyleProperty(clipPathProperty, clipPathPropertyValue);
    //     }
    // }

    // public _syncNativeProperties() {
    //     this._eachSetPropertyValue((property, value) => {
    //         this._applyStyleProperty(property, value);
    //         return true;
    //     });
    // }

    // private _applyProperty(property: Property, newValue: any) {
    //     this._applyStyleProperty(property, newValue);

    //     // The effective value of an inheritable property has changed
    //     // propagate the change down to the descendants to update their inherited properties.
    //     if (property.inheritable && this._view._childrenCount > 0) {
    //         this._view._eachChildView((child: View) => {
    //             // child.style._inheritStyleProperty(property);
    //             child.style._setValue(property, newValue, ValueSource.Inherited);
    //             return true;
    //         });
    //     }
    // }

    // private _applyStyleProperty(property: Property, newValue: any) {
    //     if (!this._view._shouldApplyStyleHandlers()) {
    //         return;
    //     }

    //     if (this._updateCounter > 0) {
    //         this._nativeSetters.set(property, newValue);
    //         return;
    //     }

    //     let handler: definition.StylePropertyChangedHandler = getHandler(property, this._view);
    //     if (!handler) {
    //         if (trace.enabled) {
    //             trace.write("No handler for property: " + property.name + " with id: " + property.id + ", view:" + this._view, trace.categories.Style);
    //         }
    //     }
    //     else {
    //         if (trace.enabled) {
    //             trace.write("Found handler for property: " + property.name + ", view:" + this._view, trace.categories.Style);
    //         }

    //         let shouldReset = false;
    //         if (property.equalityComparer) {
    //             shouldReset = property.equalityComparer(newValue, property.defaultValue);
    //         }
    //         else {
    //             shouldReset = (newValue === property.defaultValue);
    //         }

    //         if (shouldReset) {
    //             (<any>handler).resetProperty(property, this._view);
    //         } else {
    //             (<any>handler).applyProperty(property, this._view, newValue);
    //         }

    //         this._view._onStylePropertyChanged(property);
    //     }
    // }

    // get _nativeView(): any {
    //     return this._view._nativeView;
    // }

    // private _setShorthandProperty(name: string, value: any): void {
    //     let pairs = styleProperty.getShorthandPairs(name, value);
    //     if (pairs) {
    //         this._beginUpdate();
    //         for (let j = 0; j < pairs.length; j++) {
    //             let pair = pairs[j];
    //             this._setValue(pair.property, pair.value, ValueSource.Local);
    //         }
    //         this._endUpdate();
    //     }
    // }
}

Style.prototype.effectiveMinWidth = 0;
Style.prototype.effectiveMinHeight = 0;
Style.prototype.effectiveWidth = 0;
Style.prototype.effectiveHeight = 0;
Style.prototype.effectiveMarginTop = 0;
Style.prototype.effectiveMarginRight = 0;
Style.prototype.effectiveMarginBottom = 0;
Style.prototype.effectiveMarginLeft = 0;
Style.prototype.effectivePaddingTop = 0;
Style.prototype.effectivePaddingRight = 0;
Style.prototype.effectivePaddingBottom = 0;
Style.prototype.effectivePaddingLeft = 0;
Style.prototype.effectiveBorderTopWidth = 0;
Style.prototype.effectiveBorderRightWidth = 0;
Style.prototype.effectiveBorderBottomWidth = 0;
Style.prototype.effectiveBorderLeftWidth = 0;
// Property registration

export let fontInternalProperty = new CssProperty<Style, Font>({ name: "fontInternal", cssName: "_fontInternal", defaultValue: Font.default });

export let fontFamilyProperty = new InheritedCssProperty<Style, string>({
    name: "fontFamily", cssName: "font-family", valueChanged: (target, newValue) => {
        let currentFont = target.fontInternal;
        if (currentFont.fontFamily !== newValue) {
            target.fontInternal = currentFont.withFontFamily(newValue);
        }
    }
});
fontFamilyProperty.register(Style);

export let fontSizeProperty = new InheritedCssProperty<Style, number>({
    name: "fontSize", cssName: "font-size", valueChanged: (target, newValue) => {
        let currentFont = target.fontInternal;
        if (currentFont.fontSize !== newValue) {
            target.fontInternal = currentFont.withFontSize(newValue);
        }
    },
    valueConverter: (v) => parseFloat(v)
});
fontSizeProperty.register(Style);

export let fontStyleProperty = new InheritedCssProperty<Style, string>({
    name: "fontStyle", cssName: "font-style", defaultValue: FontStyle.normal, valueChanged: (target, newValue) => {
        if (newValue !== FontStyle.normal && newValue !== FontStyle.italic) {
            throw new Error(`font-style should be 'normal' or 'italic'. value: ${newValue}`)
        }

        let currentFont = target.fontInternal;
        if (currentFont.fontStyle !== newValue) {
            target.fontInternal = currentFont.withFontStyle(newValue);
        }
    }
});
fontStyleProperty.register(Style);

export let fontWeightProperty = new InheritedCssProperty<Style, string>({
    name: "fontWeight", cssName: "font-weight", defaultValue: FontWeight.normal, valueChanged: (target, newValue) => {
        if (!newValue) {
            console.trace();
        }

        if (!(newValue === FontWeight.thin
            || newValue === FontWeight.extraLight
            || newValue === FontWeight.light
            || newValue === FontWeight.normal || newValue === "400"
            || newValue === FontWeight.medium
            || newValue === FontWeight.semiBold
            || newValue === FontWeight.bold || newValue === "700"
            || newValue === FontWeight.extraBold
            || newValue === FontWeight.black)) {
            throw new Error(`Invalid font-weight value: ${newValue}`);
        }

        let currentFont = target.fontInternal;
        if (currentFont.fontWeight !== newValue) {
            target.fontInternal = currentFont.withFontWeight(newValue);
        }
    }
});
fontWeightProperty.register(Style);

function onFontChanged(style: Style, oldValue: Font, newValue: Font): void {
    // TODO: Do we need these here?
    style.fontFamily = newValue.fontFamily;
    style.fontStyle = newValue.fontStyle;
    style.fontWeight = newValue.fontWeight;
    style.fontSize = newValue.fontSize;
}

export let fontProperty = new ShorthandProperty<Style>({
    name: "font", cssName: "font",
    getter: function (this: Style) {
        return `${this.fontStyle} ${this.fontWeight} ${this.fontSize} ${this.fontFamily}`;
    },
    converter: function (value: string) {
        return parseFont(value);
    }
})
fontProperty.register(Style);

function parseFont(font: string): [CssProperty<any, any>, any][] {
    let fontSize: number;
    let fontFamily: string;
    let fontStyle: "normal" | "italic" = "normal";
    let fontWeight = "normal";

    let elements = font.split(/\s+/);
    let element: string;
    while (element = elements.shift()) {
        switch (element) {
            case "normal":
                break;

            // TODO: add support for oblique font style.
            case "italic":
                // case "oblique":
                fontStyle = "italic";
                break;

            case FontWeight.thin:
            case FontWeight.extraLight:
            case FontWeight.light:
            case FontWeight.normal:
            case "400":
            case FontWeight.medium:
            case FontWeight.semiBold:
            case FontWeight.bold:
            case "700":
            case FontWeight.extraBold:
            case FontWeight.black:
                fontWeight = element;
                break;

            default:
                if (!fontSize) {
                    let parts = element.split("/");
                    // TODO: add support for px support.
                    fontSize = parseFloat(parts[0]);
                    // TODO: add support for lineHeight.
                    // if (parts.length > 1) {
                    //     lineHeight = parts[1];
                    // }
                    break;
                }

                fontFamily = element;
            // if (elements.length) {
            //     fontFamily += " " + elements.join(" ");
            // }
        }
    }

    return [
        [fontStyleProperty, fontStyle],
        [fontWeightProperty, fontWeight],
        [fontSizeProperty, fontSize],
        [fontFamilyProperty, fontFamily]
    ]
}


// register default shorthand callbacks.
// styleProperty.registerShorthandCallback("font", onFontChanged);
// styleProperty.registerShorthandCallback("margin", onMarginChanged);
// styleProperty.registerShorthandCallback("padding", onPaddingChanged);
// styleProperty.registerShorthandCallback("transform", onTransformChanged);