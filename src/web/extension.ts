import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.window.registerCustomEditorProvider(
            'kotlin.highlightjs.editor',
            new KotlinHighlightJsEditorProvider(context),
            {
                webviewOptions: {retainContextWhenHidden: true},
                supportsMultipleEditorsPerDocument: false
            }
        )
    );
}

class KotlinHighlightJsEditorProvider implements vscode.CustomTextEditorProvider {
    constructor(private readonly context: vscode.ExtensionContext) {
    }

    public async resolveCustomTextEditor(
        document: vscode.TextDocument,
        webviewPanel: vscode.WebviewPanel,
        _token: vscode.CancellationToken
    ): Promise<void> {
        // Set up the initial content for the webview
        webviewPanel.webview.options = {enableScripts: true};

        const updateWebview = () => {
            webviewPanel.webview.html = this.getHtmlForWebview(
                webviewPanel.webview,
                document.getText()
            );
        };

        // Initial content
        updateWebview();

        // Update the content when the document changes
        const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument(
            e => {
                if (e.document.uri.toString() === document.uri.toString()) {
                    updateWebview();
                }
            }
        );

        webviewPanel.onDidDispose(() => {
            changeDocumentSubscription.dispose();
        });
    }

    private getHtmlForWebview(webview: vscode.Webview, code: string): string {

        return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.10.0/styles/base16/darcula.min.css">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.10.0/highlight.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.10.0/languages/kotlin.min.js"></script>
  <script>
    hljs.highlightAll();
  </script>
</head>
<body>
  <pre><code class="language-kotlin">${code}</code></pre>

<script>
   hljs.initHighlightingOnLoad();
</script>
</body>
</html>`;
    }
}
