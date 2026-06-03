import { window } from 'vscode'
import { ExtensionModule } from '~/modules'
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
  usageReportProvider.view = window.createTreeView(ViewIds.usage, {
    treeDataProvider: usageReportProvider,
    showCollapseAll: true,
  })

  const feedbackView = window.createTreeView(ViewIds.feedback, {
    treeDataProvider: new HelpFeedbackProvider(ctx),
  })

  return [fileInExplorerView, fileView, progressView, treeView, usageReportProvider.view, feedbackView]
}

export default m
