/**
 * E-book Creator App Logic
 */

class EbookApp {
    constructor() {
        this.state = {
            title: '',
            author: '',
            chapters: [
                { id: Date.now(), title: 'Capítulo 1', content: '<h1>Capítulo 1</h1><p>Comece a escrever aqui...</p>' }
            ],
            currentChapterId: null
        };

        this.state.currentChapterId = this.state.chapters[0].id;

        this.quill = null;
        this.init();
    }

    init() {
        this.initQuill();
        this.loadFromLocalStorage();
        this.renderChapterList();
        this.setupEventListeners();
        this.updateMetadataUI();
        this.loadChapterIntoEditor(this.state.currentChapterId);
    }

    initQuill() {
        this.quill = new Quill('#editor', {
            theme: 'snow',
            modules: {
                toolbar: [
                    [{ 'header': [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline', 'strike'],
                    ['blockquote', 'code-block'],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    ['clean']
                ]
            }
        });

        // Listen for text changes to update the current chapter content
        this.quill.on('text-change', () => {
            const currentChapter = this.state.chapters.find(c => c.id === this.state.currentChapterId);
            if (currentChapter) {
                currentChapter.content = this.quill.root.innerHTML;
                this.saveToLocalStorage();
            }
        });
    }

    setupEventListeners() {
        // Metadata inputs
        document.getElementById('book-title').addEventListener('input', (e) => {
            this.state.title = e.target.value;
            this.saveToLocalStorage();
        });

        document.getElementById('book-author').addEventListener('input', (e) => {
            this.state.author = e.target.value;
            this.saveToLocalStorage();
        });

        // Add chapter button
        document.getElementById('add-chapter-btn').addEventListener('click', () => {
            this.addChapter();
        });

        // Export button
        document.getElementById('export-btn').addEventListener('click', () => {
            this.exportEpub();
        });
    }

    updateMetadataUI() {
        document.getElementById('book-title').value = this.state.title || '';
        document.getElementById('book-author').value = this.state.author || '';
    }

    renderChapterList() {
        const list = document.getElementById('chapter-list');
        list.innerHTML = '';

        this.state.chapters.forEach((chapter, index) => {
            const li = document.createElement('li');
            li.className = `chapter-item ${chapter.id === this.state.currentChapterId ? 'active' : ''}`;
            li.dataset.id = chapter.id;

            li.innerHTML = `
                <div class="flex items-center gap-2 flex-1 overflow-hidden">
                    <i data-feather="file-text" class="w-4 h-4 shrink-0"></i>
                    <input type="text" class="chapter-title-input text-sm" value="${this.escapeXml(chapter.title)}"
                           onclick="event.stopPropagation()"
                           onchange="app.updateChapterTitle(${chapter.id}, this.value)">
                </div>
                <button class="delete-chapter-btn p-1 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        onclick="event.stopPropagation(); app.deleteChapter(${chapter.id})">
                    <i data-feather="trash-2" class="w-4 h-4"></i>
                </button>
            `;

            li.addEventListener('click', () => this.selectChapter(chapter.id));
            list.appendChild(li);
        });

        feather.replace();
    }

    addChapter() {
        // Find the next chapter number based on titles
        let nextNum = this.state.chapters.length + 1;
        const chapterTitles = this.state.chapters.map(c => c.title);
        while (chapterTitles.includes(`Capítulo ${nextNum}`)) {
            nextNum++;
        }

        const newChapter = {
            id: Date.now(),
            title: `Capítulo ${nextNum}`,
            content: `<h1>Capítulo ${nextNum}</h1><p>Escreva seu conteúdo aqui...</p>`
        };
        this.state.chapters.push(newChapter);
        this.renderChapterList();
        this.selectChapter(newChapter.id);
        this.saveToLocalStorage();
    }

    selectChapter(id) {
        this.state.currentChapterId = id;
        this.loadChapterIntoEditor(id);
        this.renderChapterList();
    }

    loadChapterIntoEditor(id) {
        const chapter = this.state.chapters.find(c => c.id === id);
        if (chapter) {
            this.quill.root.innerHTML = chapter.content;
        }
    }

    updateChapterTitle(id, newTitle) {
        const chapter = this.state.chapters.find(c => c.id === id);
        if (chapter) {
            chapter.title = newTitle;
            this.saveToLocalStorage();
            this.renderChapterList();
        }
    }

    deleteChapter(id) {
        if (this.state.chapters.length <= 1) {
            alert('O livro deve ter pelo menos um capítulo.');
            return;
        }

        if (confirm('Tem certeza que deseja excluir este capítulo?')) {
            this.state.chapters = this.state.chapters.filter(c => c.id !== id);
            if (this.state.currentChapterId === id) {
                this.state.currentChapterId = this.state.chapters[0].id;
                this.loadChapterIntoEditor(this.state.currentChapterId);
            }
            this.renderChapterList();
            this.saveToLocalStorage();
        }
    }

    saveToLocalStorage() {
        localStorage.setItem('ebook_creator_data', JSON.stringify(this.state));
        document.getElementById('save-status').textContent = 'Alterações salvas';
    }

    loadFromLocalStorage() {
        const saved = localStorage.getItem('ebook_creator_data');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                this.state = parsed;
                // Ensure currentChapterId is valid
                if (!this.state.chapters.find(c => c.id === this.state.currentChapterId)) {
                    this.state.currentChapterId = this.state.chapters[0]?.id || null;
                }
            } catch (e) {
                console.error('Erro ao carregar dados do LocalStorage', e);
            }
        }
    }

    async exportEpub() {
        const exportBtn = document.getElementById('export-btn');
        const originalText = exportBtn.innerHTML;
        exportBtn.disabled = true;
        exportBtn.innerHTML = '<i data-feather="loader" class="animate-spin"></i> Exportando...';
        feather.replace();

        try {
            const zip = new JSZip();
            const title = this.state.title || 'Livro sem Título';
            const author = this.state.author || 'Autor Desconhecido';
            const uuid = (typeof crypto.randomUUID === 'function') ? crypto.randomUUID() : Date.now().toString();

            // 1. mimetype (must be first and uncompressed)
            zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' });

            // 2. META-INF/container.xml
            zip.file('META-INF/container.xml', `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
    <rootfiles>
        <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
    </rootfiles>
</container>`);

            // 3. OEBPS/content.opf
            let manifest = '';
            let spine = '';
            this.state.chapters.forEach((chapter, index) => {
                manifest += `<item id="chapter${index + 1}" href="text/chapter${index + 1}.xhtml" media-type="application/xhtml+xml"/>\n        `;
                spine += `<itemref idref="chapter${index + 1}"/>\n        `;
            });

            const opf = `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="BookId" version="3.0">
    <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
        <dc:title>${this.escapeXml(title)}</dc:title>
        <dc:creator>${this.escapeXml(author)}</dc:creator>
        <dc:language>pt-BR</dc:language>
        <dc:identifier id="BookId">urn:uuid:${uuid}</dc:identifier>
        <meta property="dcterms:modified">${new Date().toISOString().split('.')[0] + 'Z'}</meta>
    </metadata>
    <manifest>
        <item id="toc" href="toc.xhtml" media-type="application/xhtml+xml" properties="nav"/>
        <item id="style" href="styles/style.css" media-type="text/css"/>
        ${manifest}
    </manifest>
    <spine>
        ${spine}
    </spine>
</package>`;
            zip.file('OEBPS/content.opf', opf);

            // 4. OEBPS/toc.xhtml
            let tocList = '';
            this.state.chapters.forEach((chapter, index) => {
                tocList += `<li><a href="text/chapter${index + 1}.xhtml">${this.escapeXml(chapter.title)}</a></li>\n                `;
            });

            const toc = `<?xml version="1.0" encoding="UTF-8"?>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="pt-BR">
<head>
    <title>${this.escapeXml(title)}</title>
</head>
<body>
    <nav epub:type="toc" id="toc">
        <h1>Sumário</h1>
        <ol>
            ${tocList}
        </ol>
    </nav>
</body>
</html>`;
            zip.file('OEBPS/toc.xhtml', toc);

            // 5. OEBPS/text/chapterN.xhtml
            this.state.chapters.forEach((chapter, index) => {
                const content = `<?xml version="1.0" encoding="UTF-8"?>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="pt-BR">
<head>
    <title>${this.escapeXml(chapter.title)}</title>
    <link rel="stylesheet" type="text/css" href="../styles/style.css"/>
</head>
<body>
    <section epub:type="chapter">
        ${chapter.content}
    </section>
</body>
</html>`;
                zip.file(`OEBPS/text/chapter${index + 1}.xhtml`, content);
            });

            // 6. OEBPS/styles/style.css
            zip.file('OEBPS/styles/style.css', `
body { font-family: serif; line-height: 1.5; margin: 5%; }
h1 { text-align: center; }
p { margin-bottom: 1em; }
`);

            // Generate and download
            const blob = await zip.generateAsync({ type: 'blob' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const fileName = title.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'ebook';
            a.download = `${fileName}.epub`;
            a.click();
            URL.revokeObjectURL(url);

            console.log('EPUB exportado com sucesso!');
        } catch (error) {
            console.error('Erro ao exportar EPUB:', error);
            alert('Ocorreu um erro ao exportar o EPUB. Verifique o console.');
        } finally {
            exportBtn.disabled = false;
            exportBtn.innerHTML = originalText;
            feather.replace();
        }
    }

    escapeXml(unsafe) {
        if (!unsafe) return '';
        return unsafe.replace(/[<>&"']/g, function (c) {
            switch (c) {
                case '<': return '&lt;';
                case '>': return '&gt;';
                case '&': return '&amp;';
                case '"': return '&quot;';
                case "'": return '&apos;';
            }
        });
    }
}

// Global instance
const app = new EbookApp();
