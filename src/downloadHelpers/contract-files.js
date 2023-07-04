/**
 * Author: Gecko Web
 * Date: 03/07/2023
 * Time: 16:56
 */
//<editor-fold desc="CONTRACTS & FILES METHODS">
/*
|--------------------------------------------------------------------------
| CONTRACTS & FILES METHODS
|--------------------------------------------------------------------------
|
|
|
*/
function _initialize() {
    let contractsListDom = document.getElementById('listDocMemCtr_itemsListItemsContainer').getElementsByClassName('itemsListItem')
    _createContractsObjects(contractsListDom)
    _contracts.forEach(function (contract) {
        _createContractFiles(contract)
    })
}

function _createContractsObjects(contractsListDom) {
    Object.entries(contractsListDom).forEach(function (contactDomEl, index) {
        //The contract panel Dom element
        let contractDomPanelEl = contactDomEl[1]
        let contractRef = contractDomPanelEl.querySelector('table.itemsListItemColumn td:last-child span').textContent

        _contracts[index] = {
            id: index,
            reference: contractRef,
            dom: {
                panel: contractDomPanelEl,
            },
            countFileError: function () {
                return this.files.getError().length
            },
            haveFileError: function () {
                return this.countFileError() > 0
            },
            countFileNotFound: function () {
                return this.files.getNotFound().length
            },
            haveFileNotFound: function () {
                return this.countFileNotFound() > 0
            },
            countFileSelected: function () {
                return this.files.getSelected().length
            },
            haveFileSelected: function () {
                return this.countFileSelected() > 0
            },
            files: {
                _collection: [],
                set: function (filesCollection) {
                    this._collection = filesCollection
                },
                getAll: function () {
                    return this._collection
                },
                getSelected: function () {
                    return this._collection.filter(function (file) {
                        return file.isSelected()
                    })
                },
                getDownloaded: function () {
                    return this._collection.filter(function (file) {
                        return file.isDownloaded()
                    })
                },
                getNotDownloaded: function () {
                    return this._collection.filter(function (file) {
                        return !file.isDownloaded()
                    })
                },
                getError: function () {
                    return this._collection.filter(function (file) {
                        return file.isError()
                    })
                },
                getNotFound: function () {
                    return this._collection.filter(function (file) {
                        return file.isNotFound()
                    })
                },
                isPartiallyDownloaded: function () {
                    return this.getDownloaded().length > 0
                },
                isAllDownloaded: function () {
                    if (this._collection.length === 0) {
                        return false
                    }
                    let notDownloaded = this._collection.filter(function (file) {
                        return !file.isDownloaded()
                    })
                    return notDownloaded.length === 0
                },
            },
        }
    })
}

function _createContractFiles(contract) {
    let actionsLinks = contract.dom.panel.getElementsByClassName('actionHyperLink')

    // The contract files
    let contractFiles = []
    Object.entries(actionsLinks).forEach(function (actionLink) {
        let jsAction = actionLink[1].getAttribute('href')
        let result = [...jsAction.matchAll(/javascript:__doPostBack\('([A-Za-z]+)', '([A-Za-z]+):([0-9]+)&([A-Za-z0-9\-_.]+)'\)/g)]
        let eventTarget = result[0][1]
        let eventArgKey = result[0][3]
        let eventArgDocument = result[0][4]

        let fileType = _fileTypes.find(function (ft) {
            return ft.eventArg.toString() === eventArgKey.toString()
        })
        if (fileType === undefined) {
            fileType = _fileTypes[0]
        }
        let contractFile = {
            id: `${contract.reference}-${fileType.id}`,
            type: fileType.name,
            contractRef: contract.reference,
            filename: null,
            downloadProps: {
                target: eventTarget,
                argument: {
                    key: eventArgKey,
                    document: eventArgDocument,
                    string: `setAction:${eventArgKey}&${eventArgDocument}`,
                }
            },
            dom: {
                checkbox: null,
                chkLabelStatus: null,
                _build: function (file) {
                    //The all files checkbox element
                    let _fileChkId = `${_domId}-chk-file-${file.id}`
                    if (document.getElementById(_fileChkId)) {
                        document.getElementById(_fileChkId).remove()
                    }
                    let _fileChkLabel = document.createElement('label')
                    _fileChkLabel.id = _fileChkId
                    Object.assign(_fileChkLabel.style, {
                        display: 'block'
                    });
                    _fileChkLabel.innerHTML = `<span style="margin-right: 5px">${file.type}</span>`

                    file.dom.checkbox = document.createElement('input')
                    file.dom.checkbox.type = 'checkbox'
                    file.dom.checkbox.checked = file.isSelected()
                    Object.assign(file.dom.checkbox.style, {
                        margin: '5px 5px 0 0',
                    });
                    file.dom.checkbox.addEventListener('change', (event) => {
                        let _chk = event.currentTarget
                        file.setSelected(_chk.checked)
                        _dom.allFilesChk.updateState()
                        _dom.allMissingFilesChk.updateState()
                    })
                    _fileChkLabel.prepend(file.dom.checkbox)

                    let _chkLabelStatus = document.createElement('em')
                    _fileChkLabel.appendChild(_chkLabelStatus)

                    file.dom.chkLabelStatus = _chkLabelStatus
                    contract.dom.panel.appendChild(_fileChkLabel)
                    this._update(file)
                },
                _update: function (file) {
                    if (file.isDownloaded()) {
                        file.dom.chkLabelStatus.textContent = `[${file.filename}] Téléchargé le ${file.getDownloadDate().toLocaleDateString()}`
                        Object.assign(file.dom.chkLabelStatus.style, {
                            color: 'rgb(33,186,69)'
                        });
                    } else if (file.isDownloading()) {
                        file.dom.chkLabelStatus.textContent = `Téléchargement...`
                        Object.assign(file.dom.chkLabelStatus.style, {
                            color: 'rgb(33,133,208)'
                        });
                    } else if (file.isError()) {
                        file.dom.chkLabelStatus.textContent = file.isNotFound() ? '[ERREUR] Téléchargement impossible' : 'Téléchargement stoppé'
                        Object.assign(file.dom.chkLabelStatus.style, {
                            color: file.isNotFound() ? 'rgb(219,40,40)' : 'rgb(242,113,28)'
                        });
                    }
                    _updateDomPanel()
                }
            },
            _initialize: function () {
                this.dom._build(this)
                this._fillFromStorage()
            },
            _fillFromStorage: function () {
                let json = localStorage.getItem(contractFile.id)
                if (json !== null) {
                    let storedObject = JSON.parse(json)
                    Object.assign(contractFile, storedObject)

                    this.setNotFound(storedObject._notFound)
                    this.setError(storedObject._error)
                    this.setSelected(storedObject._selected)
                }
            },
            _error: false,
            isError: function () {
                return this._error && !this.isDownloaded()
            },
            setError: function (error) {
                this._error = error
                this.dom._update(this)
            },
            _notFound: false,
            isNotFound: function () {
                return this._error && this._notFound && !this.isDownloaded()
            },
            setNotFound: function (NotFound) {
                this._notFound = NotFound
                if (this._notFound) {
                    this.setError(true)
                    this.setSelected(false)
                }
                this.dom.checkbox.disabled = this._notFound
                this.dom._update(this)
            },
            _selected: false,
            isSelected: function () {
                return this._selected
            },
            setSelected: function (selected) {
                if (this.isNotFound()) {
                    selected = false
                }
                this._selected = selected
                this.dom.checkbox.checked = selected
                this.dom._update(this)
            },
            _downloadDate: null,
            getDownloadDate: function () {
                if (this._downloadDate !== null) {
                    return new Date(this._downloadDate)
                }
                return null
            },
            isDownloaded: function () {
                return this._downloadDate !== null
            },
            _downloading: false,
            isDownloading: function () {
                return this._downloading
            },
            setDownloading: function (downloading) {
                this._downloading = downloading
                this.dom._update(this)
            },
            setDownloaded: function (downloaded) {
                this._downloadDate = null
                if (downloaded) {
                    this.setSelected(false)
                    this._downloadDate = new Date()
                }
                this.dom._update(this)
            },
            setToStorage: function () {
                localStorage.setItem(this.id, JSON.stringify({
                    filename: this.filename,
                    _downloadDate: this._downloadDate,
                    _selected: this.isSelected(),
                    _error: this.isError(),
                    _notFound: this.isNotFound(),
                }))
            },
            removeFromStorage: function () {
                localStorage.removeItem(this.id)
            },
        }
        //initialize the file object & DOM
        contractFile._initialize()
        contractFiles.push(contractFile)
    })
    contract.files.set(contractFiles)
}

function _getAllFiles() {
    let files = []
    _contracts.forEach(function (contract) {
        files = files.concat(contract.files.getAll())
    })
    return files
}

function _getAllSelectedFiles() {
    let selectedFiles = []
    this._getAllFiles().forEach(function (file) {
        if (file.isSelected()) {
            selectedFiles = selectedFiles.concat(file)
        }
    })
    return selectedFiles
}

function _getAllMissingFiles(){
    let missingFiles = []
    _contracts.forEach(function (contract) {
        missingFiles = missingFiles.concat((contract.files.getNotDownloaded()))
    })
    return missingFiles
}

//</editor-fold>
//<editor-fold desc="DOWNLOADS METHODS">
/*
|--------------------------------------------------------------------------
| DOWNLOADS METHODS
|--------------------------------------------------------------------------
|
|
|
*/
function _downloadContractFiles(contracts) {
    _isRunning = true
    if (!Array.isArray(contracts)) {
        contracts = [contracts]
    }
    console.log(`%cStart downloading %c${_getAllSelectedFiles().length} %cdocument(s) for %c${contracts.length} %ccontract(s)...`, 'color:#00B5AD', 'color:#FFF', 'color:#00B5AD', 'color:#FFF', 'color:#00B5AD')
    let filesPromises = []
    contracts.forEach(contract => {
        let documentsPromises = []
        contract.files.getSelected().forEach(function (file) {
            let downloadFilePromise = _downloadFileFct(file)
            documentsPromises.push(downloadFilePromise)
            filesPromises.push(downloadFilePromise)
        })
        Promise.all(documentsPromises).then(function (downloadedFiles) {
            let successFiles = downloadedFiles.filter(function (file) {
                return file.isDownloaded()
            })
            console.log(`%c> %c${successFiles.length} %cdocument(s) downloaded for Reference %c${contract.reference}`, 'color:#FFF', 'color:#21BA45', 'color:#00B5AD', 'color:#FFF')
            _updateDomPanel()
        })
    })
    Promise.all(filesPromises).then(function () {
        _isRunning = false
        _hasBeenRun = true
        _updateDomPanel()
    })
}

function _downloadFileFct(file) {
    if (!file.downloadProps.target) {
        throw new Error('file.downloadProps.target target is undefined')
    }
    if (file.downloadProps.argument.string === undefined) {
        throw new Error('file.downloadProps.argument.string is undefined')
    }
    let _form = Sys.WebForms.PageRequestManager.getInstance()._form
    _form.__EVENTTARGET.value = file.downloadProps.target
    _form.__EVENTARGUMENT.value = file.downloadProps.argument.string

    file.setDownloading(true)
    return fetch(_form.action, {
        method: _form.method,
        body: new FormData(_form)
    })
        .then(function (response) {
            let header = response.headers.get('Content-Disposition')
            if (header) {
                let parts = header.split(';')
                file.filename = parts[1].split('=')[1]
                return response.blob()
            }
        })
        .then(function (blob) {
            if (blob) {
                let blobUrl = URL.createObjectURL(blob);
                let linkEl = document.createElement('a');
                linkEl.href = blobUrl;
                linkEl.setAttribute('download', file.filename);
                document.body.appendChild(linkEl);
                _dom.downloaderContainer.appendChild(linkEl);
                linkEl.click();
                linkEl.parentNode.removeChild(linkEl);
                setTimeout(() => URL.revokeObjectURL(linkEl.href), _fileLinkTimeout);
                return true
            }
            return false
        }).then(function (isFileDownloaded) {
            if (isFileDownloaded) {
                file.setError(false)
                file.setDownloaded(true)
            } else {
                file.setError(true)
                file.setDownloaded(false)
                // Workaround to detect the first not found file when all downloads complete. I couldn't find better because the Smart interface is coded with ass :(
                if (_firstFileNotFound === false) {
                    _firstFileNotFound = true
                    file.setNotFound(true)
                }
            }
            if (file.isDownloaded()) {
                console.log(`%c[OK] %c${file.type} %c${file.filename} %cdownloaded`, 'color:#21BA45', 'color:#00B5AD', 'color:#FFF', 'color:#00B5AD')
            } else {
                if (file.isNotFound()) {
                    console.log(`%c[ERROR] ${file.type} not found for %c${file.contractRef}`, 'color:#FE4558', 'color:#FFF')
                } else {
                    console.log(`%c[ERROR] %c${file.type} downloads stopped for %c${file.contractRef}`, 'color:#FE4558', 'color:#00B5AD', 'color:#FFF')
                }
            }
            return file
        }).finally(function () {
            file.setDownloading(false)
            _updateDomPanel()
        })
}

//</editor-fold>
//<editor-fold desc="DOM METHODS">
/*
|--------------------------------------------------------------------------
| DOM METHODS
|--------------------------------------------------------------------------
|
|
|
*/
function _createDomStyle() {
    let _styleId = `${_domId}-styles`
    if (document.getElementById(_styleId)) {
        document.getElementById(_styleId).remove()
    }
    let head = document.getElementsByTagName('head')[0]
    let style = document.createElement('style');
    style.setAttribute('id', _styleId);
    style.setAttribute('type', 'text/css');
    head.appendChild(style);

    style.sheet.insertRule(`#${_domId} button { opacity: 0.9; transition: all ease 0.3s }`)
    style.sheet.insertRule(`#${_domId} button[disabled] { opacity: 0.5; transition: all ease 0.3s }`)
    style.sheet.insertRule(`#${_domId} button:not([disabled]):hover { opacity: 1; }`)
}

function _createDomPanel() {
    if (document.getElementById(_domId)) {
        document.getElementById(_domId).remove()
    }
    _dom.downloaderContainer = document.createElement('div')
    _dom.downloaderContainer.id = _domId
    Object.assign(_dom.downloaderContainer.style, {
        backgroundColor: 'rgb(255,255,255)',
        color: 'rgb(51,51,51)',
        padding: '28px 14px',
        position: 'absolute',
        top: '50px',
        right: '50px',
        zIndex: '999',
        width: '460px',
        maxWidth: '460px'
    });
    //<editor-fold desc="HEADER">
    _dom.header = document.createElement('h4')
    _dom.header.textContent = '❤ Smart Download Helper ❤'
    Object.assign(_dom.header.style, {
        textAlign: 'center',
        fontSize: '20px',
        textTransform: 'uppercase',
        marginBottom: '14px',
        color: 'rgb(254,69,88)',
    });
    _dom.downloaderContainer.appendChild(_dom.header);
    //</editor-fold>
    //<editor-fold desc="TAGLINE">
    _dom.tagline = document.createElement('h4')
    _dom.tagline.textContent = 'Because downloading all this is pain in the ass...'
    Object.assign(_dom.tagline.style, {
        textAlign: 'center',
        fontSize: '16px',
        fontStyle: 'italic',
        textTransform: 'capitalize',
        marginBottom: '14px',
        color: 'rgba(254,69,88,0.7)',
    });
    _dom.downloaderContainer.appendChild(_dom.tagline);
    //</editor-fold>
    //<editor-fold desc="RUN DOWNLOAD BUTTON">
    _dom.buttonRun = document.createElement('button')
    _dom.buttonRun.type = 'button'
    Object.assign(_dom.buttonRun.style, {
        textAlign: 'center',
        color: 'white',
        width: '100%',
        height: '40px',
        border: 'none',
        fontSize: '16px',
        marginTop: '14px',
        marginBottom: '14px',
        padding: '0 14px',
        backgroundColor: 'rgba(33,168,69)'
    });
    _dom.downloaderContainer.appendChild(_dom.buttonRun);
    _dom.buttonRun.addEventListener('click', function () {
        _isRunning = true
        _updateDomPanel()
        let contractsWithSelectedFiles = _contracts.filter(function (contract) {
            return contract.haveFileSelected()
        })
        _downloadContractFiles(contractsWithSelectedFiles)
    })
    //</editor-fold>
    //<editor-fold desc="ERROR RELOAD BUTTON">
    _dom.buttonReload = document.createElement('button')
    _dom.buttonReload.type = 'button'
    _dom.buttonReload.textContent = 'Recharger la page'
    Object.assign(_dom.buttonReload.style, {
        textAlign: 'center',
        color: 'white',
        width: '100%',
        height: '40px',
        border: 'none',
        fontSize: '16px',
        marginTop: '14px',
        marginBottom: '14px',
        padding: '0 14px',
        display: 'none',
        backgroundColor: 'rgb(33,133,208)',
        cursor: 'pointer',
    });
    _dom.buttonReload.addEventListener('click', function () {
        window.location.reload(true)
    })
    _dom.downloaderContainer.appendChild(_dom.buttonReload);
    //</editor-fold>
    //<editor-fold desc="ALL FILES CHECKBOX">
    _dom.allFilesChkLabel = document.createElement('label')
    _dom.allFilesChkLabel.textContent = `Sélectionner tous les fichiers`
    Object.assign(_dom.allFilesChkLabel.style, {
        display: 'block',
    });

    _dom.allFilesChk = document.createElement('input')
    _dom.allFilesChk.type = 'checkbox'
    _dom.allFilesChk.checked = false
    Object.assign(_dom.allFilesChk.style, {
        margin: '5px 5px 0 0',
    });
    _dom.allFilesChk.addEventListener('change', (event) => {
        let selected = event.currentTarget.checked
        _getAllFiles().forEach(function(file){
            file.setSelected(selected)
        })
        _updateDomPanel()
    })
    _dom.allFilesChk.updateState = function () {
        this.checked = _getAllFiles().length === _getAllSelectedFiles().length;
    }
    _dom.allFilesChkLabel.prepend(_dom.allFilesChk)
    _dom.downloaderContainer.appendChild(_dom.allFilesChkLabel);
    //</editor-fold>
    //<editor-fold desc="ALL MISSING FILES CHECKBOX">
    _dom.allMissingFilesChkLabel = document.createElement('label')
    _dom.allMissingFilesChkLabel.textContent = `Sélectionner les fichiers manquants`
    Object.assign(_dom.allMissingFilesChkLabel.style, {
        display: 'block',
    });

    _dom.allMissingFilesChk = document.createElement('input')
    _dom.allMissingFilesChk.type = 'checkbox'
    _dom.allMissingFilesChk.checked = false
    Object.assign(_dom.allMissingFilesChk.style, {
        margin: '5px 5px 0 0',
    });
    _dom.allMissingFilesChk.addEventListener('change', (event) => {
        let selected = event.currentTarget.checked
        _getAllMissingFiles().forEach(function(file){
            file.setSelected(selected)
        })
        _updateDomPanel()
    })
    _dom.allMissingFilesChk.updateState = function () {
        this.checked = _getAllMissingFiles().length === _getAllSelectedFiles().length;
    }
    _dom.allMissingFilesChkLabel.prepend(_dom.allMissingFilesChk)
    _dom.downloaderContainer.appendChild(_dom.allMissingFilesChkLabel);
    //</editor-fold>
    //<editor-fold desc="CONTRACTS COUNTER">
    _dom.contractsCounterContainer = document.createElement('p')
    _dom.downloaderContainer.appendChild(_dom.contractsCounterContainer);
    Object.assign(_dom.contractsCounterContainer.style, {
        textAlign: 'left',
        fontSize: '14px',
        marginTop: '14px',
        color: 'rgb(136,136,136)',
    });
    //</editor-fold>
    //<editor-fold desc="FILES COUNTER">
    _dom.filesCounterContainer = document.createElement('p')
    _dom.downloaderContainer.appendChild(_dom.filesCounterContainer);
    Object.assign(_dom.filesCounterContainer.style, {
        textAlign: 'left',
        fontSize: '14px',
        marginTop: '14px',
        color: 'rgb(136,136,136)',
    });
    //</editor-fold>
    //<editor-fold desc="CLEAR PAGE STORAGE BUTTON">
    _dom.buttonClearPageStorage = document.createElement('button')
    _dom.buttonClearPageStorage.type = 'button'
    Object.assign(_dom.buttonClearPageStorage.style, {
        textAlign: 'center',
        color: 'white',
        height: '30px',
        border: 'none',
        fontSize: '14px',
        marginTop: '14px',
        marginBottom: '14px',
        padding: '0 14px',
        cursor: 'pointer',
        float: 'left',
        display: 'none',
        backgroundColor: 'rgb(254,69,88)',
    });
    _dom.buttonClearPageStorage.textContent = 'Supprimer l\'historique de la page'
    _dom.downloaderContainer.appendChild(_dom.buttonClearPageStorage);
    _dom.buttonClearPageStorage.addEventListener('click', function () {
        if (window.confirm("Vous êtes sur le point de supprimer l'historique des fichiers de la page.\nVouslez-vous continuer ?")) {
            _getAllFiles().forEach(function (file) {
                file.removeFromStorage()
            })
            _run()
        }
    })
    //</editor-fold>
    //<editor-fold desc="CLEAR ALL STORAGE BUTTON">
    _dom.buttonClearAllStorage = document.createElement('button')
    _dom.buttonClearAllStorage.type = 'button'
    Object.assign(_dom.buttonClearAllStorage.style, {
        textAlign: 'center',
        color: 'white',
        height: '30px',
        border: 'none',
        fontSize: '14px',
        marginTop: '14px',
        marginBottom: '14px',
        padding: '0 14px',
        cursor: 'pointer',
        float: 'right',
        display: 'none',
        backgroundColor: 'rgb(219,40,40)',
    });
    _dom.buttonClearAllStorage.textContent = 'Supprimer tout l\'historique'
    _dom.downloaderContainer.appendChild(_dom.buttonClearAllStorage);
    _dom.buttonClearAllStorage.addEventListener('click', function () {
        if (window.confirm("Vous êtes sur le point de supprimer tout l'historique de toutes les pages.\nVouslez-vous continuer ?")) {
            localStorage.clear()
            _run()
        }
    })
    //</editor-fold>
    //<editor-fold desc="ERROR MESSAGE">
    _dom.messageContainer = document.createElement('div')
    Object.assign(_dom.messageContainer.style, {
        textAlign: 'center',
        fontSize: '14px',
        marginTop: '14px',
        marginBottom: '14px',
        display: 'inline-block',
    });
    _dom.messageContainer.innerHTML = ''
    _dom.downloaderContainer.appendChild(_dom.messageContainer);
    //</editor-fold>
    //<editor-fold desc="ERROR LIST">
    _dom.errorsListContainer = document.createElement('div')
    Object.assign(_dom.errorsListContainer.style, {
        textAlign: 'left',
        fontSize: '14px',
        marginTop: '14px',
    });
    _dom.errorsListContainer.innerHTML = ''
    _dom.downloaderContainer.appendChild(_dom.errorsListContainer);
    //</editor-fold>
    document.body.appendChild(_dom.downloaderContainer);
}

function _updateDomPanel() {
    //<editor-fold desc="RUN DOWNLOAD BUTTON">
    _dom.buttonRun.disabled = _getAllSelectedFiles().length === 0;
    if (_isRunning) {
        _dom.buttonRun.textContent = 'Téléchargement en cours...'
    } else {
        let _countSelectedFiles = _getAllSelectedFiles().length
        _dom.buttonRun.textContent = `Télécharger ${_countSelectedFiles} ${_countSelectedFiles > 1 ? 'documents' : 'document'}`
    }
    Object.assign(_dom.buttonRun.style, {
        cursor: _getAllSelectedFiles().length === 0 ? 'initial' : 'pointer',
    });
    //</editor-fold>
    //<editor-fold desc="CONTRACTS COUNTER">
    let contractsWithAllFilesDownloaded = _contracts.filter(function (contract) {
        return contract.files.isAllDownloaded()
    })
    _dom.contractsCounterContainer.textContent = ` ${contractsWithAllFilesDownloaded.length} / ${_contracts.length} contrats traités`
    //</editor-fold>
    //<editor-fold desc="FILES COUNTER">
    let allDownloadedFiles = _getAllFiles().filter(function (file) {
        return file.isDownloaded()
    })
    _dom.filesCounterContainer.textContent = `${allDownloadedFiles.length} / ${_getAllFiles().length} documents téléchargés`
    //</editor-fold>
    //<editor-fold desc="CLEAR STORAGE BUTTONS">
    if (localStorage.length > 0) {
        Object.assign(_dom.buttonClearAllStorage.style, {
            display: 'inline-block',
        });
        _dom.buttonClearAllStorage.disabled = _isRunning
        Object.assign(_dom.buttonClearPageStorage.style, {
            display: 'inline-block',
        });
        _dom.buttonClearPageStorage.disabled = _isRunning
    }
    //</editor-fold>
    //<editor-fold desc="ERROR MESSAGE">
    if (_hasBeenRun) {
        let errorMessageHtml = ''
        let contractsWithErrors = _contracts.filter(function (contract) {
            return contract.haveFileError()
        })
        if (contractsWithErrors.length > 0) {
            _dom.buttonRun.style.display = 'none'
            _dom.buttonReload.style.display = 'block'

            errorMessageHtml = "<h4 style='color: rgb(219,40,40); font-size: 18px;text-align: center'>⚠ Certains fichiers n'ont pas pu être téléchargés ⚠</h4><br>"
            let filesNotFoundCount = 0
            let errorsListHtml = '';
            contractsWithErrors.forEach(function (contract) {
                errorsListHtml += `<p style="margin-bottom: 5px;"><b>${contract.reference}</b> : </p>`
                contract.files.getError().forEach(function (file) {
                    errorsListHtml += '<p>' +
                        ` - ${file.type}`;
                    if (file.isNotFound()) {
                        filesNotFoundCount++
                        errorsListHtml += ' <span style="float:right; color: rgb(219,40,40);">Téléchargement impossible</span>'
                    } else {
                        errorsListHtml += ' <span style="float:right; color: rgb(242,113,28);">Téléchargement stoppé</span>'
                    }
                    errorsListHtml += '</p>'
                })
                errorsListHtml += '<br>'
            })

            if (filesNotFoundCount > 0) {
                errorMessageHtml += `<p>${filesNotFoundCount} ${filesNotFoundCount > 1 ? 'fichiers dont le téléchargement est impossible ont été décochés' : 'fichier dont le téléchargement est impossible a été décoché'}.</p>`
                errorMessageHtml += `<br><p>Rechargez la page et relancez le script pour continuer les téléchargements</p>`
            }
            _dom.messageContainer.innerHTML = errorMessageHtml
            _dom.errorsListContainer.innerHTML = errorsListHtml
        }
    }
    //</editor-fold>
    //<editor-fold desc="CONTRACTS DOM">
    _contracts.forEach(function (contract) {
        let style = {
            borderColor: 'rgb(136,136,136)',
            backgroundColor: 'rgb(238,238,238)',
        }
        if (contract.haveFileError()) {
            style.borderColor = 'rgb(242,113,28)'
            style.backgroundColor = 'rgba(242,113,28, 0.15)'
            if (contract.haveFileNotFound()) {
                style.borderColor = 'rgb(219,40,40)'
                style.backgroundColor = 'rgba(219,40,40, 0.15)'
            }
        } else {
            if (contract.haveFileSelected()) {
                style.borderColor = 'rgba(33,133,208)'
                style.backgroundColor = 'rgba(33,133,208, 0.15)'
            }
            if (contract.files.isAllDownloaded()) {
                style.borderColor = 'rgb(33,186,69)'
                style.backgroundColor = 'rgba(33,186,69, 0.15)'
            } else if (contract.files.isPartiallyDownloaded()) {
                style.borderColor = 'rgb(33,186,69, 0.5)'
                style.backgroundColor = 'rgba(33,186,69, 0.10)'
            }
        }
        Object.assign(contract.dom.panel.style, style);
    })
    //</editor-fold>
    //<editor-fold desc="FILES STORAGE">
    if (_isRunning || _hasBeenRun) {
        _getAllFiles().forEach(function (file) {
            file.setToStorage()
        })
    }
    //</editor-fold>
}

//</editor-fold>
//<editor-fold desc="RUN METHOD">
/*
|--------------------------------------------------------------------------
| RUN METHOD
|--------------------------------------------------------------------------
|
|
|
*/
let _fileTypes = [
    {
        id: 'UNKNOWN',
        name: "Document inconnu",
        eventArg: '',
    },
    {
        id: 'CT',
        name: "Contrat de travail",
        eventArg: 1804,
    },
    {
        id: 'BP',
        name: "Bulletin de paie",
        eventArg: 1805,
    },
    {
        id: 'AER',
        name: "AER",
        eventArg: 1809,
    },
]
let _contracts = []
let _firstFileNotFound = false
let _fileLinkTimeout = 7000;
let _domId = 'smart-contract-files-downloader'
let _dom = {
    contractsCounterContainer: null,
    contractsCounterInfo: null,
    filesCounterContainer: null,
    filesCounterInfo: null,
}
let _isRunning = false
let _hasBeenRun = false
function _run() {
    _createDomStyle()
    _createDomPanel()
    _initialize()
    _dom.allFilesChk.updateState()
    _dom.allMissingFilesChk.updateState()
    _updateDomPanel()
}
_run()
//</editor-fold>