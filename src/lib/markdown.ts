import { escapeHtml } from './utils';

function parseCodeBlocks(text: string): string {
  return text.replace(/```([\s\S]*?)```/g, (match, code) => {
    const escaped = escapeHtml(code.trim());
    return `<pre><code>${escaped}</code></pre>`;
  });
}

function parseTables(text: string): string {
  const lines = text.split('\n');
  let result: string[] = [];
  let i = 0;
  
  while (i < lines.length) {
    const line = lines[i];
    
    if (line.includes('|')) {
      const nextLine = lines[i + 1];
      
      if (nextLine && /^\|[\s\-:|]+\|$/.test(nextLine.trim())) {
        const tableLines = [line];
        i++;
        i++;
        
        while (i < lines.length && lines[i].includes('|')) {
          tableLines.push(lines[i]);
          i++;
        }
        
        result.push(buildTable(tableLines));
        continue;
      }
    }
    
    result.push(line);
    i++;
  }
  
  return result.join('\n');
}

function buildTable(lines: string[]): string {
  if (lines.length === 0) return '';
  
  const headerCells = lines[0].split('|')
    .map(cell => cell.trim())
    .filter(cell => cell.length > 0);
  
  const bodyRows = lines.slice(1).map(line => 
    line.split('|')
      .map(cell => cell.trim())
      .filter(cell => cell.length > 0)
  );
  
  let html = '<table>';
  
  html += '<thead><tr>';
  headerCells.forEach(cell => {
    html += `<th>${escapeHtml(cell)}</th>`;
  });
  html += '</tr></thead>';
  
  html += '<tbody>';
  bodyRows.forEach(row => {
    html += '<tr>';
    row.forEach(cell => {
      html += `<td>${escapeHtml(cell)}</td>`;
    });
    html += '</tr>';
  });
  html += '</tbody>';
  
  html += '</table>';
  return html;
}

function parseBlockquotes(text: string): string {
  return text.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');
}

function parseHorizontalRules(text: string): string {
  return text.replace(/^---$/gm, '<hr>');
}

function parseHeaders(text: string): string {
  text = text.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  text = text.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  text = text.replace(/^# (.+)$/gm, '<h1>$1</h1>');
  return text;
}

function parseLists(text: string): string {
  const lines = text.split('\n');
  let result: string[] = [];
  let inList = false;
  let listType: 'ul' | 'ol' | null = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    if (/^[-*+] (.+)/.test(trimmed)) {
      if (!inList || listType !== 'ul') {
        if (inList) result.push(`</${listType}>`);
        result.push('<ul>');
        listType = 'ul';
        inList = true;
      }
      const content = trimmed.replace(/^[-*+] /, '');
      result.push(`<li>${content}</li>`);
    }
    else if (/^\d+\. (.+)/.test(trimmed)) {
      if (!inList || listType !== 'ol') {
        if (inList) result.push(`</${listType}>`);
        result.push('<ol>');
        listType = 'ol';
        inList = true;
      }
      const content = trimmed.replace(/^\d+\. /, '');
      result.push(`<li>${content}</li>`);
    }
    else {
      if (inList) {
        result.push(`</${listType}>`);
        inList = false;
        listType = null;
      }
      result.push(line);
    }
  }
  
  if (inList) {
    result.push(`</${listType}>`);
  }
  
  return result.join('\n');
}

function parseBold(text: string): string {
  return text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
}

function parseItalic(text: string): string {
  return text.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');
}

function parseInlineCode(text: string): string {
  return text.replace(/`([^`]+)`/g, (match, code) => {
    return `<code>${escapeHtml(code)}</code>`;
  });
}

function parseLinks(text: string): string {
  return text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
}

function parseParagraphs(text: string): string {
  const lines = text.split('\n');
  let result: string[] = [];
  let inParagraph = false;
  let paragraphLines: string[] = [];
  
  for (let line of lines) {
    const trimmed = line.trim();
    
    if (trimmed.startsWith('<') && trimmed.endsWith('>')) {
      if (inParagraph) {
        result.push(`<p>${paragraphLines.join(' ')}</p>`);
        paragraphLines = [];
        inParagraph = false;
      }
      result.push(line);
      continue;
    }
    
    if (trimmed === '') {
      if (inParagraph) {
        result.push(`<p>${paragraphLines.join(' ')}</p>`);
        paragraphLines = [];
        inParagraph = false;
      }
      continue;
    }
    
    paragraphLines.push(trimmed);
    inParagraph = true;
  }
  
  if (inParagraph && paragraphLines.length > 0) {
    result.push(`<p>${paragraphLines.join(' ')}</p>`);
  }
  
  return result.join('\n');
}

export function parseMarkdown(markdown: string): string {
  let html = markdown;
  
  html = parseCodeBlocks(html);
  html = parseTables(html);
  html = parseBlockquotes(html);
  html = parseHorizontalRules(html);
  html = parseHeaders(html);
  html = parseLists(html);
  html = parseBold(html);
  html = parseItalic(html);
  html = parseInlineCode(html);
  html = parseLinks(html);
  html = parseParagraphs(html);
  
  return html;
}

// =============================================================================
// HOOKS
// =============================================================================
