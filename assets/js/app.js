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

    try {
        let xhr = new (this.XMLHttpRequest || ActiveXObject)('MSXML2.XMLHTTP.3.0');
        xhr.open(method, url, 1);

        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        xhr.setRequestHeader('Content-type', (json !== true ? 'application/x-www-form-urlencoded' : 'application/json'));

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
    } catch (e) {
        if (onerror)
            onerror(e);
        console.log(e);
    }
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

        ajax({
            url: defaultRoutes.renameGroupSave + '/' + id,
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

        // IGNORE_AJAX
        this.saveSuccess(id, {
            "id": 8,
            // "parent": 1,
            "title": this.getDescrElement(id).querySelector('input').value,
            "descr": this.getDescrElement(id).querySelector('textarea').value,
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
        this.setProcess('item - ' + id + ' - save failed');
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

        ajax({
            url: defaultRoutes.removeGroupSave + '/' + id,
            json: true,
            method: 'DELETE',
            callback: (responce) => {
                this.removeSuccess(id);
            },
            onerror: (responce) => {
                this.removeError(id, responce);
            }
        });

        this.removeSuccess(id);
    }

    removeSuccess(id) {
        this.setProcess('item - ' + id + ' - removed successful');

        let item = this.getElementByData('data-group-id', id);

        item.parentElement.removeChild(item);

        new ItemDescr().removeDescr(id);
    }

    removeError(id, responce) {
        this.setProcess('item - ' + id + ' - remove failed');
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

        // IGNORE_AJAX
        this.saveItemSuccess({
            "id": 8,
            "parent": this.getItemParent(),
            "title": this.getDescrElement(-1).querySelector('input').value,
            "descr": this.getDescrElement(-1).querySelector('textarea').value,
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
        let item = this.instalItem(data, actionButtons).create();


        parent.insertBefore(item, this.getElementByData('data-parent-id', data.parent));
    }


    saveItemSuccess(responce) {
        this.setProcess('new item was created');

        if (typeof responce.parent === 'undefined')
            responce.parent = -1;

        let admin = typeof adminView === 'boolean' ? adminView : false;

        if (responce.parent === -1) {
            this.itemInsert(document.querySelector('.group-tree-container'), responce, admin);

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

                !tinsertTo.classList.contains('active') ? tinsertTo.classList.add('active') : null;
            } else {
                let treestruct = new TreeStruct(responce, admin);

                parentElement.appendChild(treestruct.createSubStruct(this.instalItem(responce, admin), null));
            }

            this.cancel();
        }

    }

    saveItemError(responce) {
        this.setProcess('item was not saved');
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
        item.parentElement.removeChild(item);
    }
}


class StructItemAdd extends HtmlWorker {

    create(parentId) {
        let element = this.createElement('li', {
            'class': 'group-item-add',
            'data-parent-id': parentId
        });

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
    }

    createAddSubgroup(id) {
        let ul = this.createElement('ul', { 'class': 'sub-group' });
        ul.appendChild(new StructItemAdd().create(id));
        return ul;
    }

    createSubStruct(data = null) {

        if (!Array.isArray(this.struct.data))
            return;

        let parent = -1;
        let ul = this.createElement('ul', { 'class': 'sub-group' });

        if (data !== null)
            data.forEach(el => {
                let dropDown = typeof el.data !== 'undefined';

                let it = new StructItems({
                    id: el.id,
                    title: el.title,
                    descr: el.descr,
                    actionButtons: this.actionButtons
                }).create(dropDown || this.actionButtons);

                if (dropDown)
                    it.appendChild(this.createSubStruct(el.data));


                if (typeof el.parent !== 'undefined')
                    parent = el.parent


                if (this.actionButtons === true) {
                    it.appendChild(this.createAddSubgroup(el.id));
                }



                ul.appendChild(it);
            });

        ul.appendChild(new StructItemAdd().create(parent));

        return ul;
    }


    createTree() {
        let newStruct = this.createElement('ul', { 'class': 'group-tree-container' });

        let dropDown = typeof this.struct.data !== 'undefined';

        let item = new StructItems({
            id: this.struct.id,
            title: this.struct.title,
            descr: this.struct.descr,
            actionButtons: this.actionButtons
        }).create(dropDown);


        // newStruct.appendChild(typeof this.struct.data === 'undefined' ? item.create() : this.createSubStruct(item, this.struct.data));

        if (dropDown)
            item.appendChild(this.createSubStruct(this.struct.data, this.actionButtons));

        newStruct.appendChild(item);
        if (this.actionButtons === true)
            newStruct.appendChild(new StructItemAdd().create(typeof this.struct.parent !== 'undefined' ? this.struct.parent : -1));


        return newStruct;
    }
}


class TreeRender {
    constructor(params) {
        this.struct = params.struct;
        this.actionButtons = typeof params.actionButtons === 'boolean' ? params.actionButtons : false;

        this.container = document.querySelector('.object-tree');
    }

    extractStruct(struct) {
        let newStruct = new TreeStruct(struct, this.actionButtons);
        return newStruct.createTree();
    }

    render() {
        if (Array.isArray(this.struct))
            this.struct.forEach(struct => {
                this.container.appendChild(this.extractStruct(struct));
            });
    }
}


const adminView = true;

const defaultAssetPath = '/assets';
const defaultRoutes = {
    'testObjectsTree': defaultAssetPath + '/var/objectsTree-example.json',
    'renameGroupSave': '/struct',
    'removeGroupSave': '/struct',
    'addGroup': '/struct'
}



document.addEventListener('DOMContentLoaded', () => {
    ajax({
        'url': defaultRoutes.testObjectsTree,
        'json': true,
        'callback': (respone) => {

            if (!Array.isArray(respone))
                respone = [respone];

            let objectRender = new TreeRender({
                struct: respone,
                actionButtons: typeof adminView === 'boolean' ? adminView : false
            });

            objectRender.render();
        }
    });
});