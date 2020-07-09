const fs = require("fs")
const glob = require("glob")
const mergeImg = require("merge-img")

let files = glob.sync("download/*_files")

const search = (idx) => {

    if (idx == files.length) return 0
    let file = files[idx]

    folderName = file.split('/'); folderName = folderName[folderName.length - 1]

    let numCols = 9

    let pages = glob.sync(`${ file }/*@(x100_00)*.jpeg`)
    let partsPerPage = glob.sync(`${ file }/**@(100x100_)@(??|???).jpeg`)        
    
    let numRows = partsPerPage.length / numCols

    let filesTemp = []
    for (let i = 0; i < pages.length; i++) {
        let counter = 0
        for (let j = 0; j < numRows; j++) {
            let pageParts = { data: [], i, j }
            for (let k = 0; k < numCols; k++) {
                let counterDisplay = counter < 10 ? `0${ counter }` : counter
                let pageDisplay = i ? `(${ i })` : ''
                pageParts.data.push(`${ file }/img_100x100_${ counterDisplay }${ pageDisplay }.jpeg`)

                counter++
            }
            filesTemp.push(pageParts)
        }
    }

    const clean = () => {
        fs.rmdirSync('temp', { recursive: true })
        return search(++idx)
    }

    let pageRows = []
    const build = (idx) => {
        if (idx == pageRows.length) return clean()
        if (!fs.existsSync('dist')) fs.mkdirSync('dist')
        if (!fs.existsSync(`dist/${ folderName }`)) fs.mkdirSync(`dist/${ folderName }`)
        let aux = idx + 1
        aux = aux < 10 ? `0${aux}` : aux
        mergeImg(pageRows[idx], { direction: true }).then(img => {
            img.write(`dist/${ folderName }/${ aux }.jpg`, () => { build(++idx) })
        })
    }

    const generateTemp = (idx) => {
        if (idx == filesTemp.length) {
            for (let i = 0; i < pages.length; i++) {
                let temp = []
                for (let j = 0; j < numRows; j++) {
                    temp.push(`temp/out_${ i }_${ j }.jpg`)
                }
                pageRows.push(temp)
            }
            return build(0)
        }
        if (!fs.existsSync('temp')) fs.mkdirSync('temp')
        mergeImg(filesTemp[idx].data).then(img => {
            img.write(`temp/out_${ filesTemp[idx].i }_${ filesTemp[idx].j }.jpg`, () => {
                generateTemp(++idx)
            })
        })
        
    }; generateTemp(0)

}
search(0)