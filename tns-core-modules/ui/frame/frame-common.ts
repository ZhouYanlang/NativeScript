﻿import { Frame as FrameDefinition, NavigationEntry, BackstackEntry, NavigationTransition } from "ui/frame";
import { View, CustomLayoutView } from "ui/core/view";
import { Page } from "ui/page";
import { isString, isFunction, isDefined } from "utils/types";
import { resolveFileName } from "file-system/file-name-resolver";
import { isIOS, isAndroid } from "platform";
import * as trace from "trace";
import * as fs from "file-system";
import * as builder from "ui/builder";

let frameStack: Array<FrameBase> = [];

function buildEntryFromArgs(arg: any): NavigationEntry {
    let entry: NavigationEntry;
    if (arg instanceof Page) {
        throw new Error("Navigating to a Page instance is no longer supported. Please navigate by using either a module name or a page factory function.");
    } else if (isString(arg)) {
        entry = {
            moduleName: arg
        };
    } else if (isFunction(arg)) {
        entry = {
            create: arg
        }
    } else {
        entry = arg;
    }

    return entry;
}

export function reloadPage(): void {
    let frame = topmost();
    if (frame) {
        if (frame.currentPage && frame.currentPage.modal) {
            frame.currentPage.modal.closeModal();
        }

        let currentEntry = frame._currentEntry.entry;
        let newEntry: NavigationEntry = {
            animated: false,
            clearHistory: true,
            context: currentEntry.context,
            create: currentEntry.create,
            moduleName: currentEntry.moduleName,
            backstackVisible: currentEntry.backstackVisible
        }

        frame.navigate(newEntry);
    }
}

export function resolvePageFromEntry(entry: NavigationEntry): Page {
    let page: Page;

    if (entry.create) {
        page = entry.create();

        if (!(page && page instanceof Page)) {
            throw new Error("Failed to create Page with entry.create() function.");
        }
    }
    else if (entry.moduleName) {
        // Current app full path.
        let currentAppPath = fs.knownFolders.currentApp().path;
        //Full path of the module = current app full path + module name.
        let moduleNamePath = fs.path.join(currentAppPath, entry.moduleName);

        let moduleExports;
        if (global.moduleExists(entry.moduleName)) {
            if (trace.enabled) {
                trace.write("Loading pre-registered JS module: " + entry.moduleName, trace.categories.Navigation);
            }
            moduleExports = global.loadModule(entry.moduleName);
        } else {
            let moduleExportsResolvedPath = resolveFileName(moduleNamePath, "js");
            if (moduleExportsResolvedPath) {
                if (trace.enabled) {
                    trace.write("Loading JS file: " + moduleExportsResolvedPath, trace.categories.Navigation);
                }

                // Exclude extension when doing require.
                moduleExportsResolvedPath = moduleExportsResolvedPath.substr(0, moduleExportsResolvedPath.length - 3)
                moduleExports = global.loadModule(moduleExportsResolvedPath);
            }
        }

        if (moduleExports && moduleExports.createPage) {
            if (trace.enabled) {
                trace.write("Calling createPage()", trace.categories.Navigation);
            }
            page = moduleExports.createPage();
        }
        else {
            page = pageFromBuilder(moduleNamePath, moduleExports);
        }

        if (!(page && page instanceof Page)) {
            throw new Error("Failed to load Page from entry.moduleName: " + entry.moduleName);
        }

        // Possible CSS file path. Add it only if CSS not already specified and loaded from cssFile Page attribute in XML.
        let cssFileName = resolveFileName(moduleNamePath, "css");
        if (cssFileName && !page["cssFile"]) {
            page.addCssFile(cssFileName);
        }
    }

    return page;
}

function pageFromBuilder(moduleNamePath: string, moduleExports: any): Page {
    let page: Page;
    let element: View;

    // Possible XML file path.
    let fileName = resolveFileName(moduleNamePath, "xml");
    if (fileName) {
        if (trace.enabled) {
            trace.write("Loading XML file: " + fileName, trace.categories.Navigation);
        }

        // Or check if the file exists in the app modules and load the page from XML.
        element = builder.load(fileName, moduleExports);
        if (element instanceof Page) {
            page = <Page>element;
        }
    }

    return page;
}

export interface NavigationContext {
    entry: BackstackEntry;
    isBackNavigation: boolean;
}

export class FrameBase extends CustomLayoutView implements FrameDefinition {
    public static androidOptionSelectedEvent = "optionSelected";

    private _animated: boolean;
    public _currentEntry: BackstackEntry;
    private _backStack: Array<BackstackEntry>;
    private _transition: NavigationTransition;
    private _navigationQueue: Array<NavigationContext>;

    public _isInFrameStack = false;
    public static defaultAnimatedNavigation = true;
    public static defaultTransition: NavigationTransition;

    // TODO: Currently our navigation will not be synchronized in case users directly call native navigation methods like Activity.startActivity.

    constructor() {
        super();

        this._backStack = new Array<BackstackEntry>();
        this._navigationQueue = new Array<NavigationContext>();
    }

    public canGoBack(): boolean {
        return this._backStack.length > 0;
    }

    /**
     * Navigates to the previous entry (if any) in the back stack.
     * @param to The backstack entry to navigate back to.
     */
    public goBack(backstackEntry?: BackstackEntry) {
        if (trace.enabled) {
            trace.write(`GO BACK`, trace.categories.Navigation);
        }
        if (!this.canGoBack()) {
            // TODO: Do we need to throw an error?
            return;
        }

        if (!backstackEntry) {
            backstackEntry = this._backStack.pop();
        } else {
            let backIndex = this._backStack.indexOf(backstackEntry);
            if (backIndex < 0) {
                return;
            }
            this._backStack.splice(backIndex);
        }

        let navigationContext: NavigationContext = {
            entry: backstackEntry,
            isBackNavigation: true
        }

        this._navigationQueue.push(navigationContext);

        if (this._navigationQueue.length === 1) {
            this._processNavigationContext(navigationContext);
        }
        else {
            if (trace.enabled) {
                trace.write(`Going back scheduled`, trace.categories.Navigation);
            }
        }
    }

    public navigate(param: any) {
        if (trace.enabled) {
            trace.write(`NAVIGATE`, trace.categories.Navigation);
        }

        let entry = buildEntryFromArgs(param);
        let page = resolvePageFromEntry(entry);

        this._pushInFrameStack();

        let backstackEntry: BackstackEntry = {
            entry: entry,
            resolvedPage: page,
            navDepth: undefined,
            fragmentTag: undefined,
            isBack: undefined,
            isNavigation: true
        };

        let navigationContext: NavigationContext = {
            entry: backstackEntry,
            isBackNavigation: false
        }

        this._navigationQueue.push(navigationContext);

        if (this._navigationQueue.length === 1) {
            this._processNavigationContext(navigationContext);
        }
        else {
            if (trace.enabled) {
                trace.write(`Navigation scheduled`, trace.categories.Navigation);
            }
        }
    }

    public _processNavigationQueue(page: Page) {
        if (this._navigationQueue.length === 0) {
            // This could happen when showing recreated page after activity has been destroyed.
            return;
        }

        let entry = this._navigationQueue[0].entry;
        let currentNavigationPage = entry.resolvedPage;
        if (page !== currentNavigationPage) {
            throw new Error(`Corrupted navigation stack; page: ${page}; currentNavigationPage: ${currentNavigationPage}`);
        }

        // remove completed operation.
        this._navigationQueue.shift();

        if (this._navigationQueue.length > 0) {
            let navigationContext = this._navigationQueue[0];
            this._processNavigationContext(navigationContext);
        }

        this._updateActionBar();
    }

    public navigationQueueIsEmpty(): boolean {
        return this._navigationQueue.length === 0;
    }

    public static _isEntryBackstackVisible(entry: BackstackEntry): boolean {
        if (!entry) {
            return false;
        }

        let backstackVisibleValue = entry.entry.backstackVisible;
        let backstackHidden = isDefined(backstackVisibleValue) && !backstackVisibleValue;

        return !backstackHidden;
    }

    public _updateActionBar(page?: Page) {
        //trace.write("calling _updateActionBar on Frame", trace.categories.Navigation);
    }

    protected _processNavigationContext(navigationContext: NavigationContext) {
        if (navigationContext.isBackNavigation) {
            this.performGoBack(navigationContext);
        }
        else {
            this.performNavigation(navigationContext);
        }
    }

    private performNavigation(navigationContext: NavigationContext) {
        let navContext = navigationContext.entry;

        // TODO: This should happen once navigation is completed.
        if (navigationContext.entry.entry.clearHistory) {
            this._backStack.length = 0;
        }
        else if (FrameBase._isEntryBackstackVisible(this._currentEntry)) {
            this._backStack.push(this._currentEntry);
        }

        this._onNavigatingTo(navContext, navigationContext.isBackNavigation);

        this._navigateCore(navContext);
    }

    private performGoBack(navigationContext: NavigationContext) {
        let navContext = navigationContext.entry;
        this._onNavigatingTo(navContext, navigationContext.isBackNavigation);
        this._goBackCore(navContext);
    }

    public _goBackCore(backstackEntry: BackstackEntry) {
        if (trace.enabled) {
            trace.write(`GO BACK CORE(${this._backstackEntryTrace(backstackEntry)}); currentPage: ${this.currentPage}`, trace.categories.Navigation);
        }
    }

    public _navigateCore(backstackEntry: BackstackEntry) {
        if (trace.enabled) {
            trace.write(`NAVIGATE CORE(${this._backstackEntryTrace(backstackEntry)}); currentPage: ${this.currentPage}`, trace.categories.Navigation);
        }
    }

    public _onNavigatingTo(backstackEntry: BackstackEntry, isBack: boolean) {
        if (this.currentPage) {
            this.currentPage.onNavigatingFrom(isBack);
        }

        backstackEntry.resolvedPage.onNavigatingTo(backstackEntry.entry.context, isBack, backstackEntry.entry.bindingContext);
    }

    public get animated(): boolean {
        return this._animated;
    }

    public set animated(value: boolean) {
        this._animated = value;
    }

    public get transition(): NavigationTransition {
        return this._transition;
    }

    public set transition(value: NavigationTransition) {
        this._transition = value;
    }

    get backStack(): Array<BackstackEntry> {
        return this._backStack.slice();
    }

    get currentPage(): Page {
        if (this._currentEntry) {
            return this._currentEntry.resolvedPage;
        }

        return null;
    }

    get currentEntry(): NavigationEntry {
        if (this._currentEntry) {
            return this._currentEntry.entry;
        }

        return null;
    }

    public _pushInFrameStack() {
        if (this._isInFrameStack) {
            return;
        }

        frameStack.push(this);
        this._isInFrameStack = true;
    }

    public _popFromFrameStack() {
        if (!this._isInFrameStack) {
            return;
        }

        let top = topmost();
        if (top !== this) {
            throw new Error("Cannot pop a Frame which is not at the top of the navigation stack.");
        }

        frameStack.pop();
        this._isInFrameStack = false;
    }

    get _childrenCount(): number {
        if (this.currentPage) {
            return 1;
        }

        return 0;
    }

    public _eachChildView(callback: (child: View) => boolean) {
        if (this.currentPage) {
            callback(this.currentPage);
        }
    }

    public _getIsAnimatedNavigation(entry: NavigationEntry): boolean {
        if (entry && isDefined(entry.animated)) {
            return entry.animated;
        }

        if (isDefined(this.animated)) {
            return this.animated;
        }

        return FrameBase.defaultAnimatedNavigation;
    }
    public _getNavigationTransition(entry: NavigationEntry): NavigationTransition {

        if (entry) {
            if (isIOS && isDefined(entry.transitioniOS)) {
                return entry.transitioniOS;
            }

            if (isAndroid && isDefined(entry.transitionAndroid)) {
                return entry.transitionAndroid;
            }

            if (isDefined(entry.transition)) {
                return entry.transition;
            }
        }

        if (isDefined(this.transition)) {
            return this.transition;
        }

        return FrameBase.defaultTransition;
    }

    public get navigationBarHeight(): number {
        return 0;
    }

    public _getNavBarVisible(page: Page): boolean {
        throw new Error();
    }

    // We don't need to put Page as visual child. Don't call super.
    public _addViewToNativeVisualTree(child: View): boolean {
        return true;
    }

    // We don't need to put Page as visual child. Don't call super.
    public _removeViewFromNativeVisualTree(child: View): void {
        child._isAddedToNativeVisualTree = false;
    }

    public _printFrameBackStack() {
        let length = this.backStack.length;
        let i = length - 1;
        console.log(`Frame Back Stack: `);
        while (i >= 0) {
            let backstackEntry = <BackstackEntry>this.backStack[i--];
            console.log(`\t${backstackEntry.resolvedPage}`);
        }
    }

    public _backstackEntryTrace(b: BackstackEntry): string {
        let result = `${b.resolvedPage}`;

        let backstackVisible = FrameBase._isEntryBackstackVisible(b);
        if (!backstackVisible) {
            result += ` | INVISIBLE`;
        }

        if (b.entry.clearHistory) {
            result += ` | CLEAR HISTORY`;
        }

        let animated = this._getIsAnimatedNavigation(b.entry);
        if (!animated) {
            result += ` | NOT ANIMATED`;
        }

        let t = this._getNavigationTransition(b.entry);
        if (t) {
            result += ` | Transition[${JSON.stringify(t)}]`;
        }

        return result;
    }
}

export function topmost(): FrameBase {
    if (frameStack.length > 0) {
        return frameStack[frameStack.length - 1];
    }

    return undefined;
}

export function goBack(): boolean {
    let top = topmost();
    if (top.canGoBack()) {
        top.goBack();
        return true;
    }

    if (frameStack.length > 1) {
        top._popFromFrameStack();
    }

    return false;
}

export function stack(): Array<FrameBase> {
    return frameStack;
}