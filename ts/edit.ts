class SimpleEditor {
    private editor: HTMLElement | null;
    private background: HTMLElement | null;
    private history: string[];
    private historyIndex: number;
    private maxHistory: number;

    constructor() {
        this.editor = document.getElementById('editor');
        this.background = document.getElementById('background');
        this.history = [''];
        this.historyIndex = 0;
        this.maxHistory = 50;
        this.init();
    }

    init(): void {
        this.bindToolbarEvents();
        this.bindEditorEvents();
        this.loadContent();
        this.updateWordCount();
        this.updateCursorPosition();
        this.saveInitialState();
        this.toggleBackground();
    }

    bindToolbarEvents(): void {
        const boldBtn = document.getElementById('bold');
        const italicBtn = document.getElementById('italic');
        const underlineBtn = document.getElementById('underline');
        const strikeBtn = document.getElementById('strike');
        const undoBtn = document.getElementById('undo');
        const redoBtn = document.getElementById('redo');
        const insertLinkBtn = document.getElementById('insertLink');
        const insertImageBtn = document.getElementById('insertImage');
        const saveBtn = document.getElementById('save');
        const saveAsBtn = document.getElementById('saveAs');

        if (boldBtn) boldBtn.addEventListener('click', () => {
            if (!this.editor) return;
            this.editor.focus();
            if (window.getSelection && document.createRange) {
                const selection = window.getSelection();
                if (selection && selection.rangeCount > 0) {
                    const range = selection.getRangeAt(0);
                    if (!range.collapsed) {
                        document.execCommand('bold', false, '');
                        this.saveToHistory();
                    } else {
                        const boldElement = document.createElement('b');
                        boldElement.textContent = '';
                        range.insertNode(boldElement);
                        const newRange = document.createRange();
                        newRange.selectNodeContents(boldElement);
                        newRange.collapse(false);

                        selection.removeAllRanges();
                        selection.addRange(newRange);
                        this.saveToHistory();
                    }
                }
            } else {
                document.execCommand('bold', false, '');
                this.saveToHistory();
            }
        });
        if (italicBtn) italicBtn.addEventListener('click', () => this.formatText('italic'));
        if (underlineBtn) underlineBtn.addEventListener('click', () => this.formatText('underline'));
        if (strikeBtn) strikeBtn.addEventListener('click', () => this.formatText('strikeThrough'));
        if (undoBtn) undoBtn.addEventListener('click', () => this.undo());
        if (redoBtn) redoBtn.addEventListener('click', () => this.redo());
        if (insertLinkBtn) insertLinkBtn.addEventListener('click', () => this.insertLink());
        if (insertImageBtn) insertImageBtn.addEventListener('click', () => this.insertImage());
        if (saveBtn) saveBtn.addEventListener('click', () => this.saveContent());
        if (saveAsBtn) saveAsBtn.addEventListener('click', () => this.saveAsTextFile());
    }

    bindEditorEvents(): void {
        if (!this.editor) return;

        this.editor.addEventListener('input', () => {
            this.saveToHistory();
            this.updateWordCount();
            this.toggleBackground();
        });

        this.editor.addEventListener('keyup', () => {
            this.updateWordCount();
            this.updateCursorPosition();
            this.toggleBackground();
        });

        this.editor.addEventListener('click', () => {
            this.updateCursorPosition();
            this.toggleBackground();
        });

        this.editor.addEventListener('paste', (e: ClipboardEvent) => {
            e.preventDefault();
            const text = e.clipboardData?.getData('text') || '';
            this.insertTextAtCursor(text);
            setTimeout(() => this.toggleBackground(), 0);
        });
    }

    insertTextAtCursor(text: string): void {
        if (!this.editor) return;

        this.editor.focus();

        if (window.getSelection && document.createRange() && typeof this.editor.ownerDocument.execCommand !== 'undefined') {
            const selection = window.getSelection();
            if (selection && selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                range.deleteContents();
                range.insertNode(document.createTextNode(text));
                range.setStartAfter(range.endContainer);
                range.setEndAfter(range.endContainer);
                selection.removeAllRanges();
                selection.addRange(range);
            }
        } else {
            document.execCommand('insertText', false, text);
        }

        this.saveToHistory();
    }

    toggleBackground(): void {
        if (!this.editor || !this.background) return;

        const content = this.editor.innerText || this.editor.textContent || '';
        if (content.trim() !== '') {
            this.background.style.display = 'none';
        } else {
            this.background.style.display = 'block';
        }
    }

    formatText(command: string): void {
        if (!this.editor) return;
        this.editor.focus();
        if (window.getSelection && document.createRange) {
            const selection = window.getSelection();
            if (selection && selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                const selectedText = range.toString();

                if (selectedText) {
                    let wrapper: HTMLElement;
                    switch (command) {
                        case 'bold':
                            wrapper = document.createElement('b');
                            break;
                        case 'italic':
                            wrapper = document.createElement('i');
                            break;
                        case 'underline':
                            wrapper = document.createElement('u');
                            break;
                        case 'strikeThrough':
                            wrapper = document.createElement('strike');
                            break;
                        default:
                            return;
                    }

                    wrapper.textContent = selectedText;
                    range.deleteContents();
                    range.insertNode(wrapper);

                    const newRange = document.createRange();
                    newRange.selectNodeContents(wrapper);
                    selection.removeAllRanges();
                    selection.addRange(newRange);
                }
            }
        } else {
            document.execCommand(command, false, '');
        }

        this.saveToHistory();
    }

    undo(): void {
        if (this.historyIndex > 0 && this.editor) {
            this.historyIndex--;
            this.editor.innerHTML = this.history[this.historyIndex] || '';
            this.updateWordCount();
            this.updateCursorPosition();
            this.toggleBackground();
        }
    }

    redo(): void {
        if (this.historyIndex < this.history.length - 1 && this.editor) {
            this.historyIndex++;
            this.editor.innerHTML = this.history[this.historyIndex] || '';
            this.updateWordCount();
            this.updateCursorPosition();
            this.toggleBackground();
        }
    }

    insertLink(): void {
        const url = prompt('请输入链接地址:');
        if (url && this.editor) {
            this.editor.focus();

            if (window.getSelection && document.createRange) {
                const selection = window.getSelection();
                if (selection && selection.rangeCount > 0) {
                    const range = selection.getRangeAt(0);
                    const selectedText = range.toString();

                    const link = document.createElement('a');
                    link.href = url;
                    link.textContent = selectedText || url;

                    range.deleteContents();
                    range.insertNode(link);

                    const newRange = document.createRange();
                    newRange.selectNodeContents(link);
                    selection.removeAllRanges();
                    selection.addRange(newRange);
                }
            } else {
                document.execCommand('createLink', false, url);
            }

            this.saveToHistory();
            this.toggleBackground();
        }
        if (this.editor) this.editor.focus();
    }

    insertImage(): void {
        const url = prompt('请输入图片地址:');
        if (url && this.editor) {
            this.editor.focus();

            if (window.getSelection && document.createRange) {
                const selection = window.getSelection();
                if (selection && selection.rangeCount > 0) {
                    const range = selection.getRangeAt(0);

                    const img = document.createElement('img');
                    img.src = url;
                    img.alt = '插入的图片';

                    range.insertNode(img);

                    const newRange = document.createRange();
                    newRange.setStartAfter(img);
                    newRange.setEndAfter(img);
                    selection.removeAllRanges();
                    selection.addRange(newRange);
                }
            } else {
                document.execCommand('insertImage', false, url);
            }

            this.saveToHistory();
            this.toggleBackground();
        }
        if (this.editor) this.editor.focus();
    }

    saveToHistory(): void {
        if (!this.editor) return;

        this.history = this.history.slice(0, this.historyIndex + 1);
        this.history.push(this.editor.innerHTML);
        this.historyIndex++;
        if (this.history.length > this.maxHistory) {
            this.history.shift();
            this.historyIndex--;
        }
    }

    saveInitialState(): void {
        if (!this.editor) return;

        this.history = [this.editor.innerHTML];
        this.historyIndex = 0;
    }

    saveContent(): void {
        if (!this.editor) return;

        const content = this.editor.innerHTML;
        try {
            localStorage.setItem('editorContent', content);
            this.showSaveMessage('保存成功！', 'success');
        } catch (e) {
            console.error('保存失败:', e);
            this.showSaveMessage('保存失败！', 'error');
        }
    }

    saveAsTextFile(): void {
        if (!this.editor) return;
        const textContent = this.editor.innerHTML || this.editor.textContent || '';
        const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `document.txt`;
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        this.showSaveMessage('Document Saved!', 'Success!');
    }

    loadContent(): void {
        if (!this.editor) return;

        const savedContent = localStorage.getItem('editorContent');
        if (savedContent) {
            this.editor.innerHTML = savedContent;
            this.saveInitialState();
            this.updateWordCount();
            this.updateCursorPosition();
            this.toggleBackground();
        }
    }

    showSaveMessage(message: string, type: string): void {
        const messageEl = document.createElement('div');
        messageEl.textContent = message;
        messageEl.style.position = 'fixed';
        messageEl.style.top = '20px';
        messageEl.style.right = '20px';
        messageEl.style.padding = '10px 20px';
        messageEl.style.borderRadius = '4px';
        messageEl.style.zIndex = '1000';
        messageEl.style.fontSize = '14px';
        messageEl.style.fontWeight = 'bold';

        if (type === 'success') {
            messageEl.style.backgroundColor = '#4CAF50';
            messageEl.style.color = 'white';
        } else {
            messageEl.style.backgroundColor = '#f44336';
            messageEl.style.color = 'white';
        }

        document.body.appendChild(messageEl);
        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.parentNode.removeChild(messageEl);
            }
        }, 3000);
    }


    updateWordCount(): void {
        if (!this.editor) return;

        const text = this.editor.innerText || '';
        const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
        const wordCountElement = document.getElementById('wordCount');
        if (wordCountElement) {
            wordCountElement.textContent = `字数: ${wordCount}`;
        }
    }

    updateCursorPosition(): void {
        if (!this.editor) return;

        const selection = window.getSelection();
        const cursorPositionElement = document.getElementById('cursorPosition');

        if (selection && selection.rangeCount > 0 && cursorPositionElement) {
            const range = selection.getRangeAt(0);
            const preCaretRange = range.cloneRange();
            preCaretRange.selectNodeContents(this.editor);
            preCaretRange.setEnd(range.endContainer, range.endOffset);
            const caretOffset = preCaretRange.toString().length;
            const text = this.editor.innerText || '';
            const lines = text.substring(0, caretOffset).split('\n');
            const row = lines.length;
            const col = (lines[lines.length - 1]?.length ?? 0) + 1;

            cursorPositionElement.textContent = `位置: ${row}:${col}`;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new SimpleEditor();
});