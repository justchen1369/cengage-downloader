import PDFMerger from "pdf-merger-js"
import fs from 'fs'

const merge = new PDFMerger();
// arbitrary upper bound
if (fs.existsSync('./download/5001.pdf')) {
    console.warn("more than 5000 files in download directory- extra will not be included in the merged PDF file")
}

for (let i = 0; i < 5000; i++) {
    if (fs.existsSync(`./download/${i}.pdf`)) {
        await merge.add(`./download/${i}.pdf`)
        console.log(`./download/${i}.pdf`)
    }
}

await merge.save('merged.pdf');
