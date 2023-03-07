/**
 * 
 * @param {Object} request
 * @param {string} request.url
 * @param {string} request.method
 * @param {function} request.callback
 * @param {mixed} request.data
 * @param {boolean} request.json
 */
const ajax = (request) => {

    let url = request.url;
    let method = typeof request.method === 'undefined' ? 'GET' : request.method;
    let callback = typeof request.callback !== 'function' ? null : request.callback;
    let data = typeof request.data === 'undefined' ? null : request.data;
    let json = typeof request.json !== 'boolean' ? false : request.json;

    if (!url)
        throw ('URl required');

    if (data && typeof (data) === 'object') {
        if (json === true)
            data = JSON.stringify(data);
        else {
            let tempdata = '', e = encodeURIComponent;
            for (k in data) {
                tempdata += '&' + e(k) + '=' + e(data[k]);
            }
            data = tempdata.slice(1);
        }
    }

    try {
        let xhr = new (this.XMLHttpRequest || ActiveXObject)('MSXML2.XMLHTTP.3.0');
        xhr.open(method, url, 1);

        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        xhr.setRequestHeader('Content-type', (json !== true ? 'application/x-www-form-urlencoded' : 'application/json'));

        xhr.onreadystatechange = () => {
            if (xhr.readyState > 3 && callback) {
                callback((json === true ? JSON.parse(xhr.responseText) : xhr.responseText), xhr);
            }
        };
        xhr.send(data)
    } catch (e) {
        console.log(e);
    }
};



class TreeActions {

    getElementByData(data, id) {
        return document.querySelector('[' + data + '="' + id + '"]');
    }


    rename(renameId) {
        console.log(renameId);

    }
    remove(removeId) {
        console.log(removeId);
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

        call.addEventListener('click', () => {
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


        groupTitle.appendChild(this.createElement('i', { 'class': 'icon icon-default' }));
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

    createSubStruct(item, data) {

        item = item.create(true);

        if (!Array.isArray(this.struct.data))
            return item;

        let ul = this.createElement('ul', { 'class': 'sub-group' });

        data.forEach(el => {
            let it = new StructItems({
                id: el.id,
                title: el.title,
                descr: el.descr,
                actionButtons: this.actionButtons
            });

            ul.appendChild(typeof el.data === 'undefined' ? it.create() : this.createSubStruct(it, el.data));
        });

        item.appendChild(ul);

        return item;
    }




    createTree() {
        let newStruct = this.createElement('ul', { 'class': 'group-tree-container' });;

        let item = new StructItems({
            id: this.struct.id,
            title: this.struct.title,
            descr: this.struct.descr,
            actionButtons: this.actionButtons
        });


        newStruct.appendChild(typeof this.struct.data === 'undefined' ? item.create() : this.createSubStruct(item, this.struct.data));

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


class ObjectTree {
    constructor() {
        this.objectRender = null;
    }

    onLoadObjects(respone) {
        if (!Array.isArray(respone))
            respone = [respone];

        this.objectRender = new TreeRender({
            struct: respone,
            actionButtons: typeof adminView === 'boolean' ? adminView : false
        });

        this.objectRender.render();
    }

    load() {
        if (typeof ajax === 'function')
            ajax({
                'url': defaultRoutes.testObjectsTree,
                'json': true,
                'callback': (respone) => {
                    this.onLoadObjects(respone);
                }
            });
    }

}


const adminView = true;

const defaultAssetPath = '/assets';
const defaultRoutes = {
    'testObjectsTree': defaultAssetPath + '/var/objectsTree-example.json'
}
const objectTree = new ObjectTree;

document.addEventListener('DOMContentLoaded', () => {
    objectTree.load();
});