import { window } from 'vscode'
import { ExtensionModule } from '~/modules'
import { Analyst } from '~/core'
import { ViewIds } from './ViewIds'
import {
  CurrentFileLocalesTreeProvider,
  HelpFeedbackProvider,
  ProgressProvider,
  LocalesTreeProvider,
} from './providers'
import { UsageReportProvider } from './providers/UsageReportProvider'

export * from './items'
export * from './providers'

const m: ExtensionModule = ctx => {
  const currentFileTreeProvider = new CurrentFileLocalesTreeProvider(ctx)

  // Explorer tab
  const fileInExplorerView = window.createTreeView(ViewIds.file_in_explorer, {
    treeDataProvider: currentFileTreeProvider,
    showCollapseAll: true,
  })

  // Extension tab
  const fileView = window.createTreeView(ViewIds.file, {
    treeDataProvider: currentFileTreeProvider,
    showCollapseAll: true,
  })

  const progressView = window.createTreeView(ViewIds.progress, {
    treeDataProvider: new ProgressProvider(ctx),
    showCollapseAll: true,
  })

  const treeView = window.createTreeView(ViewIds.tree, {
    treeDataProvider: new LocalesTreeProvider(ctx),
    showCollapseAll: true,
  })

  const usageReportProvider = new UsageReportProvider(ctx)
  const usageView = window.createTreeView(ViewIds.usage, {
    treeDataProvider: usageReportProvider,
    showCollapseAll: true,
  })
  usageReportProvider.view = usageView
  const usageVisibility = usageView.onDidChangeVisibility(e => {
    if (!e.visible) Analyst.invalidateCache()
  })

  const feedbackView = window.createTreeView(ViewIds.feedback, {
    treeDataProvider: new HelpFeedbackProvider(ctx),
  })

  return [fileInExplorerView, fileView, progressView, treeView, usageView, usageVisibility, feedbackView]
}

export default m
