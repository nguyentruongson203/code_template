import type { FileType } from "@/types/file-system"

export function buildPreviewHTML(files: FileType[]): string {
  const htmlFile = files.find((f) => f.name === "index.html") || files.find((f) => f.name.endsWith(".html"))

  if (!htmlFile || !htmlFile.content) {
    return `<!DOCTYPE html>
<html><body><h1>No HTML file found</h1></body></html>`
  }

  let htmlContent = htmlFile.content

  // Replace script src with inline scripts
  htmlContent = htmlContent.replace(/<script\s+src\s*=\s*["']([^"']+)["'][^>]*><\/script>/gi, (match, src) => {
    const jsFile = files.find((f) => f.name === src || f.name === src.split("/").pop())

    if (jsFile && jsFile.content) {
      return `<script>\n${jsFile.content}\n</script>`
    }
    return `<!-- Script not found: ${src} -->`
  })

  // Replace link href with inline styles
  htmlContent = htmlContent.replace(/<link\s+[^>]*href\s*=\s*["']([^"']+)["'][^>]*>/gi, (match, href) => {
    if (!href.endsWith(".css")) return match

    const cssFile = files.find((f) => f.name === href || f.name === href.split("/").pop())

    if (cssFile && cssFile.content) {
      return `<style>\n${cssFile.content}\n</style>`
    }
    return `<!-- Stylesheet not found: ${href} -->`
  })

  // Add console capture script
  const consoleScript = `
  <script>
    (function() {
      const originalConsole = {
        log: console.log,
        error: console.error,
        warn: console.warn,
        info: console.info
      };
      
      function sendToParent(level, args) {
        try {
          const serializedArgs = args.map(arg => {
            if (typeof arg === 'object' && arg !== null) {
              try {
                return JSON.stringify(arg, null, 2);
              } catch (e) {
                return '[Object]';
              }
            }
            return String(arg);
          });
          
          window.parent.postMessage({
            type: 'console',
            level: level,
            args: serializedArgs
          }, '*');
        } catch (e) {
          // Silent fail
        }
      }
      
      console.log = function(...args) {
        sendToParent('log', args);
        originalConsole.log.apply(console, args);
      };
      
      console.error = function(...args) {
        sendToParent('error', args);
        originalConsole.error.apply(console, args);
      };
      
      console.warn = function(...args) {
        sendToParent('warn', args);
        originalConsole.warn.apply(console, args);
      };
      
      console.info = function(...args) {
        sendToParent('info', args);
        originalConsole.info.apply(console, args);
      };
      
      window.addEventListener('error', function(e) {
        sendToParent('error', [e.message + ' at ' + (e.filename || 'unknown') + ':' + (e.lineno || 'unknown')]);
      });
      
      window.addEventListener('unhandledrejection', function(e) {
        sendToParent('error', ['Unhandled Promise Rejection:', e.reason]);
      });
    })();
  </script>
`

  // Insert console script at the beginning of body
  if (htmlContent.includes("<body>")) {
    htmlContent = htmlContent.replace("<body>", `<body>\n${consoleScript}`)
  } else {
    htmlContent += consoleScript
  }

  return htmlContent
}
