import { TreeItem, ExtensionContext, TreeDataProvider, EventEmitter, Event } from 'vscode'
import throttle from 'lodash.throttle'
import { notEmpty } from '../../utils/utils'
import { BaseTreeItem } from '../items/Base'
import { ProgressRootItem } from '../items/ProgressRootItem'
import { EditorPanel } from '../../webview/panel'
import { THROTTLE_DELAY } from '../../meta'
import { Global, CurrentFile } from '~/core'

export class ProgressProvider implements TreeDataProvider<BaseTreeItem> {
  protected name = 'ProgressProvider'
  private _onDidChangeTreeData: EventEmitter<BaseTreeItem | undefined> = new EventEmitter<BaseTreeItem | undefined>()
  readonly onDidChangeTreeData: Event<BaseTreeItem | undefined> = this._onDidChangeTreeData.event

  constructor(private ctx: ExtensionContext) {
    const throttledRefresh = throttle(() => this.refresh(), THROTTLE_DELAY)
    EditorPanel.onDidChange(throttledRefresh)
    // CurrentFile.loader is a session-long singleton whose composed loader propagates child loader changes,
    // so subscribe once instead of re-subscribing on every onDidChangeLoader emission
    CurrentFile.loader.onDidChange(throttledRefresh)
    Global.onDidChangeLoader(throttledRefresh)
    Global.onDidChangeEnabled(throttledRefresh)
  }

  refresh(): void {
    this._onDidChangeTreeData.fire(undefined)
  }

  getTreeItem(element: BaseTreeItem): TreeItem {
    return element
  }

  async getChildren(element?: BaseTreeItem) {
    if (element) return await element.getChildren()
    return Object.values(Global.allLocales)
      .map(node => CurrentFile.loader.getCoverage(node))
      .filter(notEmpty)
      .map(cov => new ProgressRootItem(this.ctx, cov))
  }
}
