import hljs from 'highlight.js/lib/core';
import kotlin from 'highlight.js/lib/languages/kotlin';
import '../styles/darcula.css';  // We'll create this next

// Register Kotlin language
hljs.registerLanguage('kotlin', kotlin);

// Export for use in webview
window.hljs = hljs;