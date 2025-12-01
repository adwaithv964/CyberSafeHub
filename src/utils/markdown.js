export const simpleMarkdownToHtml = (text = "") => {
    let html = text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>');

    const lines = html.split('\n');
    let inList = false;
    html = lines.map(line => {
        const isListItem = line.match(/^\s*-\s/) || line.match(/^\s*\d\.\s/);
        let output = '';
        if (isListItem && !inList) {
            output += '<ul>';
            inList = true;
        } else if (!isListItem && inList) {
            output += '</ul>';
            inList = false;
        }
        if (isListItem) {
            const content = line.substring(line.search(/\S/)).replace(/^-\s*|^\d\.\s*/, '');
            output += `<li>${content.trim()}</li>`;
        } else {
            output += line;
        }
        return output;
    }).join('');
    if (inList) html += '</ul>';
    return html.replace(/\n/g, '<br />');
};
