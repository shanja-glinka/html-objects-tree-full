/**
 * 
 * @param {Object} request
 * @param {string} request.url
 * @param {string} request.method
 * @param {function} request.callback
 * @param {function} request.onerror
 * @param {mixed} request.data
 * @param {boolean} request.json
 */
const ajax = (request) => {

    let url = request.url;
    let method = typeof request.method === 'undefined' ? 'GET' : request.method;
    let callback = typeof request.callback !== 'function' ? null : request.callback;
    let onerror = typeof request.onerror !== 'function' ? null : request.onerror;
    let data = typeof request.data === 'undefined' ? null : request.data;
    let json = typeof request.json !== 'boolean' ? false : request.json;

    if (!url)
        throw ('URl required');

    if (data && typeof (data) === 'object') {
        let tempdata = '', e = encodeURIComponent;
        for (k in data) {
            tempdata += '&' + e(k) + '=' + e(data[k]);
        }
        data = tempdata.slice(1);
    }

    let xhr = new (this.XMLHttpRequest || ActiveXObject)('MSXML2.XMLHTTP.3.0');
    xhr.open(method, url, 1);

    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

    xhr.onreadystatechange = () => {
        try {
            if (xhr.readyState > 3 && callback) {
                callback((json === true ? JSON.parse(xhr.responseText) : xhr.responseText), xhr);
            }
        } catch (e) {
            if (onerror)
                onerror(e, xhr.responseText);
            console.log(e);
        }
    };
    xhr.send(data)
};







class ItemAction {

    setProcess(text) {
        document.querySelector('.object-tree-process p').innerText = text;
    }

    getElementByData(data, id = null) {
        return document.querySelector(id === null ? '[' + data + ']' : '[' + data + '="' + id + '"]');
    }

    getDescrElement(id) {
        return this.getElementByData('data-descr-id', id);
    }

}


class RenameItem extends ItemAction {
    createRenameActions(id) {
        let htmlWorker = new HtmlWorker();

        let actions = htmlWorker.createElement('div', { 'class': 'group-title group-actions' });

        let save = htmlWorker.createElement('i', { 'class': 'icon icon-check' });
        let cancel = htmlWorker.createElement('i', { 'class': 'icon icon-close' });

        save.addEventListener('click', () => {
            this.save(id);
        });

        cancel.addEventListener('click', () => {
            this.cancel(id);
        });


        actions.appendChild(save);
        actions.appendChild(cancel);

        return actions;
    }

    rename(id) {
        new TreeActions().descrToggle(id);

        let descr = this.getDescrElement(id);

        if (descr.querySelector('input'))
            return;


        let htmlWorker = new HtmlWorker();

        let titleElement = descr.querySelector('h2');
        let descrElement = descr.querySelector('p');

        let tileText = titleElement.innerText;
        let descrText = descrElement.innerText;


        descr.classList.add('input-view')


        let input = htmlWorker.createElement('input', {
            'type': 'text',
            'value': tileText
        });
        let tarea = htmlWorker.createElement('textarea', {
            'type': 'text',
            'value': descrText,
            'innerText': descrText
        });

        titleElement.appendChild(input);
        descrElement.appendChild(tarea);

        descr.appendChild(this.createRenameActions(id));
    }

    save(id) {
        this.setProcess('processed...');

        if (ignoreServer) {
            this.saveSuccess(id, {
                'id': id,
                'title': this.getDescrElement(id).querySelector('input').value,
                'descr': this.getDescrElement(id).querySelector('textarea').value
            });
        } else
            ajax({
                url: defaultRoutes.renameGroup + '/' + id,
                data: {
                    'title': this.getDescrElement(id).querySelector('input').value,
                    'descr': this.getDescrElement(id).querySelector('textarea').value,
                },
                json: true,
                method: 'PUT',
                callback: (responce) => {
                    this.saveSuccess(id, responce);
                },
                onerror: (responce) => {
                    this.saveError(id, responce);
                }
            });
    }

    saveSuccess(id, responce) {
        this.setProcess('item - ' + id + ' - saved successful');
        let descr = this.getDescrElement(id);

        descr.querySelector('h2').innerHTML = responce.title;
        descr.querySelector('p').innerHTML = responce.descr;

        document.querySelector('[data-group-id="' + id + '"] span').innerText = responce.title;

        this.cancel(id);
    }

    saveError(id, responce) {
        this.setProcess('item - ' + id + ' - save failed. ' + responce);
    }


    cancel(id) {
        let descr = this.getDescrElement(id);

        if (descr.querySelector('.group-actions'))
            descr.removeChild(descr.querySelector('.group-actions'));

        descr.classList.remove('input-view');

        new TreeActions().descrToggle(id);
    }
}


class RemoveItem extends ItemAction {

    remove(id) {

        if (!window.confirm('Do you really want to delete the structure?'))
            return;


        this.setProcess('processed...');
        if (ignoreServer) {
            this.removeSuccess(id, {
                'id': id
            });
        } else
            ajax({
                url: defaultRoutes.removeGroup + '/' + id,
                json: true,
                method: 'DELETE',
                callback: (responce) => {
                    this.removeSuccess(id);
                },
                onerror: (responce) => {
                    this.removeError(id, responce);
                }
            });

    }

    removeSuccess(id) {
        this.setProcess('item - ' + id + ' - removed successful');

        let item = this.getElementByData('data-group-id', id);

        if (!item)
            return;

        let rootElement = item.closest('.group-tree-container');
        item.parentElement.removeChild(item);

        if (!rootElement.querySelector('.group-item'))
            rootElement.parentElement.removeChild(rootElement);

        new ItemDescr().removeDescr(id);

    }

    removeError(id, responce) {
        this.setProcess('item - ' + id + ' - remove failed. ' + responce);
    }
}


class AddItem extends ItemAction {

    createActions() {
        let htmlWorker = new HtmlWorker();

        let actions = htmlWorker.createElement('div', { 'class': 'group-title group-actions' });

        let save = htmlWorker.createElement('i', { 'class': 'icon icon-check' });
        let cancel = htmlWorker.createElement('i', { 'class': 'icon icon-close' });

        save.addEventListener('click', () => {
            this.saveItem();
        });

        cancel.addEventListener('click', () => {
            this.cancel();
        });


        actions.appendChild(save);
        actions.appendChild(cancel);

        return actions;
    }

    getItemParent() {
        return this.getElementByData('data-parent-add').getAttribute('data-parent-add');
    }

    createDescr() {
        new ItemDescr().innerDescr(-1, 'Title', 'Description');

        let htmlWorker = new HtmlWorker();

        let descr = this.getDescrElement(-1);

        let titleElement = descr.querySelector('h2');
        let descrElement = descr.querySelector('p');


        descr.classList.add('input-view');


        let input = htmlWorker.createElement('input', {
            'type': 'text',
            'value': titleElement.innerText
        });
        let tarea = htmlWorker.createElement('textarea', {
            'type': 'text',
            'value': descrElement.innerText,
            'innerText': descrElement.innerText
        });

        titleElement.appendChild(input);
        descrElement.appendChild(tarea);

        descr.appendChild(this.createActions());

        return descr;
    }


    add(parentId) {

        let descr = this.getDescrElement(-1);

        if (!descr)
            descr = this.createDescr();

        descr.setAttribute('data-parent-add', parentId);

        new TreeActions().descrToggle(-1);
    }



    saveItem() {
        this.setProcess('process...');

        if (ignoreServer) {
            this.saveItemSuccess({
                'id': new Date().getTime(),
                'parent': this.getItemParent(),
                'title': this.getDescrElement(-1).querySelector('input').value,
                'descr': this.getDescrElement(-1).querySelector('textarea').value
            });
        } else
            ajax({
                url: defaultRoutes.addGroup,
                json: true,
                data: {
                    'parent': this.getItemParent(),
                    'title': this.getDescrElement(-1).querySelector('input').value,
                    'descr': this.getDescrElement(-1).querySelector('textarea').value
                },
                method: 'POST',
                callback: (responce) => {
                    this.saveItemSuccess(responce);
                },
                onerror: (responce) => {
                    this.saveItemError(responce);
                }
            });
    }


    instalItem(data, actionButtons) {
        return new StructItems({
            id: data.id,
            title: data.title,
            descr: data.descr,
            actionButtons: actionButtons
        });
    }

    itemInsert(parent, data, actionButtons) {
        let item = this.instalItem(data, actionButtons).create(actionButtons);

        parent.insertBefore(item, this.getElementByData('data-parent-id', data.parent));

        if (actionButtons) {
            let treestruct = new TreeStruct(data, actionButtons);
            item.appendChild(treestruct.createAddSubgroup(data.id));
        }
        return item;
    }


    saveItemSuccess(responce) {
        this.setProcess('new item was created');

        if (typeof responce.parent === 'undefined')
            responce.parent = -1;

        let admin = typeof adminView === 'boolean' ? adminView : false;

        if (responce.parent == -1) {
            // this.itemInsert(document.querySelector('.group-tree-container [data-root-create="-1"]'), responce, admin);
            let failedParent = document.querySelector('.group-tree-container [data-root-create="-1"]').closest('.group-tree-container');
            failedParent.parentElement.removeChild(failedParent);

            let objectRender = new TreeRender({
                struct: [responce],
                actionButtons: admin
            });
            objectRender.render();
        } else {
            let parentElement = this.getElementByData('data-group-id', responce.parent);
            let tinsertTo = null;

            parentElement.childNodes.forEach(el => {
                if (el.tagName.toLowerCase() === 'ul' && el.classList.contains('sub-group')) {
                    tinsertTo = el;
                    return;
                }
            });

            if (tinsertTo !== null) {
                this.itemInsert(tinsertTo, responce, admin);

            } else {
                this.createNewStruct(parentElement, responce, admin);
            }
        }

        let creator = document.querySelector('[data-parent-id="-1"]');
        if (creator) {
            creator.parentElement.removeChild(creator);
        }

        this.cancel();

    }

    createNewStruct(parentElement, responce, admin) {
        responce.data = responce;
        let treestruct = new TreeStruct(responce, admin);
        let substruct = treestruct.createSubStruct([responce]);

        parentElement.appendChild(substruct);

        if (!parentElement.firstChild.querySelector('.icon-drop-down')) {
            let htmlWorker = new HtmlWorker();
            let element = htmlWorker.createElement('i', { 'class': 'icon icon-drop-down' });

            element.addEventListener('click', () => {
                new TreeActions().dropDownToggle(responce.parent);
            });

            let insertBefore = parentElement.firstChild.querySelector('.group-actions');

            if (insertBefore)
                parentElement.firstChild.insertBefore(element, insertBefore);
            else
                parentElement.firstChild.appendChild(element);
        }
    }

    saveItemError(responce) {
        this.setProcess(responce);
    }

    cancel() {
        let descr = this.getDescrElement(-1);

        descr.removeAttribute('data-parent-add');

        new TreeActions().descrToggle(-1);
    }
}









class TreeActions {

    getElementByData(data, id) {
        return document.querySelector('[' + data + '="' + id + '"]');
    }


    rename(renameId) {
        new RenameItem().rename(renameId);
    }

    remove(removeId) {
        new RemoveItem().remove(removeId);
    }

    addStruct(parentId) {
        new AddItem().add(parentId);
    }

    descrToggle(descrId) {
        let item = this.getElementByData('data-descr-id', descrId);

        if (!item)
            return;

        document.querySelectorAll('[data-descr-id]').forEach(el => {
            if (el != item)
                el.classList.remove('active');
        });

        item.classList.toggle('active');
    }

    dropDownToggle(descrId) {
        let item = this.getElementByData('data-group-id', descrId);

        if (!item)
            return;

        item.querySelector('.icon-drop-down').classList.toggle('toggled');
        item.querySelector('.sub-group').classList.toggle('active');

    }
}


class HtmlWorker {
    createElement(element, param = null) {
        let el = document.createElement(element);

        for (let it in param) {
            if (it == 'innerText')
                el.innerText = param[it];
            else if (it == 'innerHTML')
                el.innerHTML = param[it];
            else if (it == 'style' && typeof param[it] === 'object') {
                for (let itstyle in param[it])
                    el.style[itstyle] = param[it][itstyle];
            } else if (it == 'cssText')
                el.style += param[it];
            else
                el.setAttribute(it, param[it]);
        }

        return el;

    }
}


class ItemDescr extends HtmlWorker {
    getDescrContainer() {
        return document.querySelector('.tree-drescr');
    }

    innerDescr(id, title, descr) {

        if (!descr)
            return;

        let item = this.createElement('div', {
            'class': 'item-descr',
            'data-descr-id': id
        })

        item.appendChild(this.createElement('h2', { 'innerText': title }));
        item.appendChild(this.createElement('p', { 'innerText': descr }));


        this.getDescrContainer().appendChild(item);
    }

    removeDescr(id) {
        let item = this.getDescrContainer().querySelector('[data-descr-id="' + id + '"]');

        if (!item)
            return;

        item.parentElement.removeChild(item);
    }
}


class StructItemAdd extends HtmlWorker {

    create(parentId) {
        let element = this.createElement('li', {
            'class': 'group-item-add'
        });

        if (parentId == -1)
            element.setAttribute('data-root-create', parentId);
        else
            element.setAttribute('data-parent-id', parentId);

        let groupTitle = this.createElement('div', { 'class': 'group-title' });

        groupTitle.appendChild(this.createElement('i', { 'class': 'icon icon-plus' }));
        groupTitle.appendChild(this.createElement('span', { 'innerText': 'Add new item' }));

        groupTitle.addEventListener('click', () => {
            new TreeActions().addStruct(parentId);
        });

        element.appendChild(groupTitle);

        return element;
    }
}


class StructItems extends HtmlWorker {
    constructor(params) {
        super();

        this.id = params.id;
        this.title = params.title;
        this.descr = params.descr;
        this.actionButtons = params.actionButtons;
        this.data = typeof params.data === 'object' ? params.data : null;
    }


    innerDescr(call) {
        new ItemDescr().innerDescr(this.id, this.title, this.descr);

        call.addEventListener('click', (e) => {
            new TreeActions().descrToggle(this.id);
        });
    }

    createDropDown() {
        let element = this.createElement('i', { 'class': 'icon icon-drop-down' });

        element.addEventListener('click', () => {
            new TreeActions().dropDownToggle(this.id);
        });

        return element;
    }

    createRenameAction() {
        let element = this.createElement('i', { 'class': 'icon icon-edit' });

        element.addEventListener('click', () => {
            new TreeActions().rename(this.id);
        });

        return element;
    }

    createRemoveAction() {
        let element = this.createElement('i', { 'class': 'icon icon-remove' });

        element.addEventListener('click', () => {
            new TreeActions().remove(this.id);
        });

        return element;
    }

    createActionButtons() {
        let actions = this.createElement('div', { 'class': 'group-actions' });

        actions.appendChild(this.createRenameAction());
        actions.appendChild(this.createRemoveAction());

        return actions;
    }




    create(dropDown = false) {

        let element = this.createElement('li', {
            'class': 'group-item',
            'data-group-id': this.id
        });

        let groupTitle = this.createElement('div', { 'class': 'group-title' });

        groupTitle.appendChild(this.createElement('span', { 'innerText': this.title }));


        if (dropDown === true)
            groupTitle.appendChild(this.createDropDown());


        if (this.actionButtons === true)
            groupTitle.appendChild(this.createActionButtons());


        this.innerDescr(groupTitle.querySelector('span'));


        element.appendChild(groupTitle);
        return element;
    }
}


class TreeStruct extends HtmlWorker {
    constructor(struct, actionButtons = false) {
        super();

        this.struct = struct;
        this.actionButtons = actionButtons;

        if (typeof this.struct.id === 'undefined')
            this.struct.id = -1;

    }

    createAddSubgroup(id) {
        let ul = this.createElement('ul', { 'class': 'sub-group' });
        ul.appendChild(new StructItemAdd().create(id));
        return ul;
    }

    createSubStruct(data = null, lastid = -1) {

        let parent = lastid;
        let ul = this.createElement('ul', { 'class': 'sub-group' });

        if (data !== null && Array.isArray(data))
            data.forEach(el => {
                let dropDown = typeof el.data !== 'undefined' && el.data !== null;

                let it = new StructItems({
                    id: el.id,
                    title: el.title,
                    descr: el.descr,
                    actionButtons: this.actionButtons
                }).create(dropDown || this.actionButtons);

                if (dropDown || this.actionButtons) {
                    it.appendChild(this.createSubStruct(el.data, el.id));
                }


                if (typeof el.parent !== 'undefined')
                    parent = el.parent


                ul.appendChild(it);
            });

        if (this.actionButtons === true)
            ul.appendChild(new StructItemAdd().create(parent));

        return ul;
    }


    createTree() {
        let newStruct = this.createElement('ul', { 'class': 'group-tree-container' });

        if (this.struct.id === -1) {
            if (this.actionButtons === true)
                newStruct.appendChild(new StructItemAdd().create(typeof this.struct.parent !== 'undefined' ? this.struct.parent : -1));
            return newStruct;
        }

        let dropDown = typeof this.struct.data !== 'undefined' && this.struct.data !== null;

        let item = new StructItems({
            id: this.struct.id,
            title: this.struct.title,
            descr: this.struct.descr,
            actionButtons: this.actionButtons
        }).create(dropDown);


        if (dropDown)
            item.appendChild(this.createSubStruct(this.struct.data, this.actionButtons));

        newStruct.appendChild(item);
        if (this.actionButtons === true)
            newStruct.appendChild(new StructItemAdd().create(typeof this.struct.parent !== 'undefined' && this.struct.parent != -1 ? this.struct.parent : this.struct.id));


        return newStruct;
    }
}


class TreeRender {
    constructor(params) {
        this.struct = params.struct;
        this.actionButtons = typeof params.actionButtons === 'boolean' ? params.actionButtons : false;

        this.container = document.querySelector('.object-tree .tree-roots');
    }

    extractStruct(struct) {
        let newStruct = new TreeStruct(struct, this.actionButtons);
        return newStruct.createTree();
    }

    render() {
        if (!this.container)
            return console.log('Selector .object-tree .tree-roots is not found');

        if (Array.isArray(this.struct)) {
            if (this.struct.length == 0)
                this.struct = [{}];

            this.struct.forEach(struct => {
                this.container.appendChild(this.extractStruct(struct));
            });

            if (this.actionButtons === true)
                this.container.appendChild(this.extractStruct({}));
        }
    }
}


console.log(window.ignoreServer);
if (typeof ignoreServer === 'undefined')
    window.ignoreServer = false;

const defaultAssetPath = '/assets';
const defaultRoutes = {
    'testObjectsTree': defaultAssetPath + '/var/objectsTree-example.json',
    'getGroup': '/struct',
    'renameGroup': '/struct',
    'removeGroup': '/struct',
    'addGroup': '/struct'
}


const defaultLoader = () => {
    ajax({
        'url': ignoreServer === true ? defaultRoutes.testObjectsTree : defaultRoutes.getGroup,
        'json': true,
        'callback': (responce) => {

            if (!Array.isArray(responce))
                respone = [responce];

            let objectRender = new TreeRender({
                struct: responce,
                actionButtons: typeof adminView === 'boolean' ? adminView : false
            });

            objectRender.render();
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    defaultLoader();
});