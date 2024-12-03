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
        webviewPanel.webview.options = {
            enableScripts: true
        };

        const updateWebview = () => {
            webviewPanel.webview.html = this.getHtmlForWebview(
                webviewPanel.webview,
                document.getText()
            );
        };

        updateWebview();

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
        // Escape the code to prevent XSS
        const escapedCode = this.escapeHtml(code);
        
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} https://cdnjs.cloudflare.com; script-src ${webview.cspSource} https://cdnjs.cloudflare.com 'unsafe-inline';">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.10.0/styles/base16/darcula.min.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.10.0/highlight.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.10.0/languages/kotlin.min.js"></script>
</head>
<body>
    <pre><code class="language-kotlin">${escapedCode}</code></pre>

    <script>
        // Wait for the DOM to be fully loaded
        document.addEventListener('DOMContentLoaded', (event) => {
            // Initialize highlight.js
            hljs.configure({ languages: ['kotlin'] });
            
            // Highlight all code blocks
            document.querySelectorAll('pre code').forEach((block) => {
                hljs.highlightElement(block);
            });
        });

        // Re-highlight when the content changes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'characterData' || mutation.type === 'childList') {
                    hljs.highlightElement(mutation.target);
                }
            });
        });

        // Start observing the code block for changes
        const codeBlock = document.querySelector('pre code');
        if (codeBlock) {
            observer.observe(codeBlock, {
                characterData: true,
                childList: true,
                subtree: true
            });
        }
    </script>
</body>
</html>`;
    }

    private escapeHtml(unsafe: string): string {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
}