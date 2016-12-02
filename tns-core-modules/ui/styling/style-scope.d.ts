﻿//@private
declare module "ui/styling/style-scope" {
    import { View } from "ui/core/view";
    import { SyntaxTree } from "css";
    import { RuleSet, Node, SelectorCore, ChangeMap } from "ui/styling/css-selector";
    import { KeyframeAnimationInfo } from "ui/animation/keyframe-animation";

    export class CssState {
        /**
         * Re-evaluate the selectors and apply any changes to the underlying view.
         */
        public apply(): void;

        /**
         * Gets the static selectors that match the view and the dynamic selectors that may potentially match the view.
         */
        public changeMap: ChangeMap<View>;
    }

    export class StyleScope {
        public css: string;
        public addCss(cssString: string, cssFileName: string): void;

        public static createSelectorsFromCss(css: string, cssFileName: string, keyframes: Object): RuleSet[];
        public static createSelectorsFromImports(tree: SyntaxTree, keyframes: Object): RuleSet[];
        public ensureSelectors(): boolean;

        public applySelectors(view: View): void
        public query(options: Node): SelectorCore[];

        public getKeyframeAnimationWithName(animationName: string): KeyframeAnimationInfo;
        public getAnimations(ruleset: RuleSet): KeyframeAnimationInfo[];
    }

    export function applyInlineSyle(view: View, style: string): void;
}
