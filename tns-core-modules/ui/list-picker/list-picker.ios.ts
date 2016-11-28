﻿import { ListPickerBase, selectedIndexProperty, itemsProperty } from "./list-picker-common";
import { ItemsSource } from "ui/list-picker";

export * from "./list-picker-common";

export class ListPicker extends ListPickerBase {
    private _ios: UIPickerView;
    private _dataSource: ListPickerDataSource;
    private _delegate: ListPickerDelegateImpl;
    private itemsSet: boolean;

    constructor() {
        super();

        this._ios = UIPickerView.new();
        this._ios.dataSource = this._dataSource = ListPickerDataSource.initWithOwner(new WeakRef(this));
        this._delegate = ListPickerDelegateImpl.initWithOwner(new WeakRef(this));
    }

    public onLoaded() {
        super.onLoaded();
        this._ios.delegate = this._delegate;
    }

    public onUnloaded() {
        this._ios.delegate = null;
        super.onUnloaded();
    }

    get ios(): UIPickerView {
        return this._ios;
    }

    private updateSelectedValue(): void {
        let selectedIndex = this.getSelectedIndex(this.items);
        if (selectedIndex >= 0) {
            this.ios.selectRowInComponentAnimated(selectedIndex, 0, false);
        }
    }

    private onItemsPropertyChanged(items: any[] | ItemsSource) {
        this.ios.reloadAllComponents();
        this.updateSelectedValue();
    }

    get [selectedIndexProperty.native](): number {
        return -1;
    }
    set [selectedIndexProperty.native](value: number) {
        if (this.itemsSet) {
            this.updateSelectedValue();
        }
    }

    get [itemsProperty.native](): any[] {
        return null;
    }
    set [itemsProperty.native](value: any[] | ItemsSource) {
        this.onItemsPropertyChanged(value);
        // items are cleared - set selectedIndex to -1
        if (!value) {
            this.itemsSet = false;
            this.selectedIndex = -1;
        } else if (this.selectedIndex < 0) {
            // items are set and selectedIndex is set - update maxValue & value.
            this.selectedIndex = 0;
            // set this flag later so no native call happens
            this.itemsSet = true;
        }
    }
}

class ListPickerDataSource extends NSObject implements UIPickerViewDataSource {
    public static ObjCProtocols = [UIPickerViewDataSource];

    private _owner: WeakRef<ListPicker>;

    public static initWithOwner(owner: WeakRef<ListPicker>): ListPickerDataSource {
        let dataSource = <ListPickerDataSource>ListPickerDataSource.new();
        dataSource._owner = owner;
        return dataSource;
    }

    public numberOfComponentsInPickerView(pickerView: UIPickerView) {
        return 1;
    }

    public pickerViewNumberOfRowsInComponent(pickerView: UIPickerView, component: number) {
        let owner = this._owner.get();
        return (owner && owner.items) ? owner.items.length : 0;
    }
}

class ListPickerDelegateImpl extends NSObject implements UIPickerViewDelegate {
    public static ObjCProtocols = [UIPickerViewDelegate];

    private _owner: WeakRef<ListPicker>;

    public static initWithOwner(owner: WeakRef<ListPicker>): ListPickerDelegateImpl {
        let delegate = <ListPickerDelegateImpl>ListPickerDelegateImpl.new();
        delegate._owner = owner;
        return delegate;
    }

    public pickerViewTitleForRowForComponent(pickerView: UIPickerView, row: number, component: number): string {
        let owner = this._owner.get();
        if (owner) {
            return owner._getItemAsString(row);
        }

        return row.toString();
    }

    public pickerViewDidSelectRowInComponent(pickerView: UIPickerView, row: number, component: number): void {
        let owner = this._owner.get();
        if (owner) {
            owner.nativePropertyChanged(selectedIndexProperty, row);
        }
    }
}