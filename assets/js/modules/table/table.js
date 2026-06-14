import DataTables from 'datatables.net-dt';
import './table.css';
import languageFr from 'datatables.net-plugins/i18n/fr-FR.mjs';
import languageEn from 'datatables.net-plugins/i18n/en-GB.mjs';
import 'datatables.net-responsive/js/dataTables.responsive';
import 'datatables.net-buttons';
import 'datatables.net-buttons/js/buttons.print';
import 'datatables.net-buttons/js/buttons.html5';
import {AjaxManager} from "../ajax/ajax-manager";
import {Loading} from "../loading/loading";
import JSZip from "jszip";
import {Clipboard} from "../clipboard/clipboard";
import {Tooltip} from "../tooltip/tooltip";
import Translator from "../../utils/translator";
import {EventsDispatcher} from "../../utils/events-dispatcher";
import {stripHtml} from "../../utils/helper";


export class Table extends EventsDispatcher {

    constructor(element, options) {
        super(false, true);
        this.element = element;
        window.JSZip = JSZip;

        Translator.get()
            .load({
                "Copy": "Copier"
            }, "table", "fr")
            .load({
                "Copy": "Copy"
            }, "table", "en")
        this.options = Object.assign({}, options);
        if(element.getAttribute("data-url")) {
            this.options.url = element.getAttribute("data-url");
        }

        this.init();
    }

    init() {
        if(this.element) {
            this.loading = new Loading(this.element);
            setTimeout(() => {
                this.bindEvents();
                this.build();
            }, 100);
        } else {
            this.bindEvents();
            this.build();
        }
    }

    endLoading() {
        this.show();
        if(this.loading) {
            this.loading.remove();
        }
        this._dispatchEvent("load", this)
    }

    show() {
        this.element.style.display = "table";
    }

    addRow(data) {
        data = this.parseData([data])[0];
        this.tableDt.row.add(data);
        this.tableDt.draw();
    }

    getElement() {
        return this.element;
    }

    getControlContainerElement() {
        return this.element.parentElement?.querySelector(".dt-controls-header");
    }

    build(state) {

        let tableHeader = "";
        let tableFooter = "";

        if(!this.element.hasAttribute("data-header") || this.element.getAttribute("data-header") != "0") {
            tableHeader = "Blf";
        }

        if(!this.element.hasAttribute("data-footer") || this.element.getAttribute("data-footer") != "0") {
            tableFooter = "ip";
        }

        const lang = Translator.get().isLang("fr") ? languageFr : languageEn

        if(!lang.paginate) {
            lang.paginate = {};
        }
        lang.paginate.next = "&nbsp;";
        lang.paginate.previous = "&nbsp;";
        lang.paginate.first = "&nbsp;";
        lang.paginate.last = "&nbsp;";

        const tableOptions = {
            deferRender: true,
            responsive: true,
            dom: '<"dt-controls-header"'+tableHeader+'r'+(this.element.getAttribute("data-new-url")?'<"button-create">':'')+'>t<"dt-controls-footer"'+tableFooter+'>',
            pageLength: 25,
            buttons: [
                {
                    extend: 'excel',
                    text: '<i class="fas fa-file-excel"></i><span class="dt-control-label"> XLSX</span>',
                    title: "",
                    exportOptions: {
                        stripHtml: true,
                        modifier: {
                            page: 'all'
                        },
                        format: {
                            body: (data, indexRow, indexCol, element) => {
                                const column = tableOptions.columns[indexCol];
                                let dataProcessed;
                                if (column && column.type == "numeric") {
                                    const value = tableOptions['data'][indexRow][column['data']['sort']];
                                    if (element) {
                                        dataProcessed = value ?? element.innerText ?? stripHtml(data);
                                    } else {
                                        dataProcessed = value ?? stripHtml(data);
                                    }
                                } else {
                                    if (element) {
                                        dataProcessed = element.innerText ?? stripHtml(data);
                                    } else {
                                        dataProcessed = stripHtml(data);
                                    }
                                }
                                return dataProcessed;
                            }
                        }
                    }
                },
                {
                    extend: 'copyHtml5',
                    text: '<i class="fas fa-copy"></i><span class="dt-control-label"> '+Translator.get().trans("Copy", "table")+'</span>',
                    title: this.element.getAttribute("data-title") ?? "",
                    init: function(dt, node, config) {
                        dt.buttons.info = function(title, message, time) {
                            Clipboard.showModal(message);
                        }
                    },
                    exportOptions: {
                        stripHtml: true,
                        modifier: {
                            page: 'all'
                        },
                        format: {
                            body: (data, indexRow, indexCol, element) => {
                                const column = tableOptions.columns ? tableOptions.columns[indexCol] : null;
                                let dataProcessed;
                                if( column && column.type == "numeric" ) {
                                    const value = tableOptions['data'][indexRow][column['data']['sort']];
                                    if(element) {
                                        dataProcessed = value ?? element.innerText ?? stripHtml(data);
                                    } else {
                                        dataProcessed = value ?? stripHtml(data);
                                    }
                                } else {
                                    if (element) {
                                        dataProcessed = element.innerText ?? stripHtml(data);
                                    } else {
                                        dataProcessed = stripHtml(data);
                                    }
                                }
                                return dataProcessed;
                            }
                        }
                    }
                }
            ],
            language: lang,
            autoWidth: false,
            ordering: true,
            orderCellsTop: true,
            fixedHeader: false,
            aaSorting: [],
            fnRowCallback: (trElement, aData) => {
                if(trElement.children[0].classList.contains("dtr-control")) {
                    trElement.children[0].addEventListener("click", (e) => {
                        setTimeout(() => {
                            const trChildElements = this.tableDt.row(trElement);
                            if(trChildElements.child()) {
                                const trChildElement = trChildElements.child()[0];
                                if (trChildElement) {
                                    const colsHidden = trChildElements.node().querySelectorAll(".dtr-hidden");
                                    colsHidden.forEach((el) => {
                                        el.innerText = "";
                                    })

                                    const dataElements = trChildElement.querySelectorAll(".dtr-data");
                                    dataElements.forEach((element) => {
                                        const regex = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,10}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/i
                                        const content = element.innerText.toLowerCase().trim();
                                        if (content.match(regex)) {
                                            const aElement = document.createElement("A");
                                            aElement.setAttribute("href", content);
                                            aElement.setAttribute("target", "_blank")
                                            aElement.innerText = content.replace(/^https?:\/\//g, "");
                                            element.innerText = "";
                                            element.append(aElement);
                                        }
                                    })
                                }
                            }
                        }, 100);
                    })

                }
                if(aData["__href"]) {
                    trElement.addEventListener("click", (e) => {
                        const elementClick = e.target;
                        if(!(elementClick?.classList.contains("dtr-control") && elementClick?.innerText == "")) {
                            window.location.href = aData["__href"];
                        }
                    });
                    this.element.classList.add("table-row-clickable");
                }
            },
            drawCallback: (settings) => {
                if(this.element.classList.contains("collapsed")) {
                    const table = settings.api;
                    table.columns().each( function ( index ) {
                        const column = table.column( index );
                        if(column.header().classList.contains("col-responsive") && !column.visible()) {
                            column.visible(true);
                            table.draw(false);
                        }
                    } );
                }
            },
            initComplete: (settings) => {
                if(this.element.getAttribute("data-new-url")) {
                    const buttonCreateContainerElement = settings.nTableWrapper.querySelector(".button-create");
                    const title = this.element.getAttribute("data-new-title") ?? "Ajouter";
                    const buttonCreateElement = document.createElement("button");
                    buttonCreateElement.classList.add("dt-button", "primary");
                    buttonCreateElement.innerHTML = `<i class="fas fa-plus-circle"></i> ` + title;
                    buttonCreateElement.addEventListener("click", () => {
                        window.location.href = this.element.getAttribute("data-new-url") ?? window.location.href;
                    });
                    buttonCreateContainerElement.append(buttonCreateElement);
                }

                this.endLoading();
            },
            createdRow: function(row, data, dataIndex){

                if(dataIndex == 0) {
                    for(let colConfig of this.api().settings()[0]['aoColumns']) {
                        const column = this.api().table().column(colConfig.idx);
                        const columnElement = column.header();

                        if(colConfig['tooltip']) {
                            if(columnElement) {
                                const tooltipElement = document.createElement("i");
                                tooltipElement.classList.add("far", "fa-circle-question", "tooltip");
                                tooltipElement.setAttribute("title", colConfig['tooltip']);
                                const titleElement = columnElement.querySelector(".dt-column-title");
                                titleElement.after(tooltipElement);
                            }

                        }

                        const tooltipElements = columnElement.querySelectorAll(".tooltip");
                        for(const tooltipElement of tooltipElements) {
                            new Tooltip(tooltipElement);
                        }
                    }
                }
                const tdElements = row.children;
                let tdClassIndex = 0;
                for(let tdIndex = 0; tdIndex < tdElements.length; tdIndex++) {
                    const regex = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,10}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/i
                    const tdElement = tdElements[tdIndex];
                    const content = tdElement.innerText.toLowerCase().trim();
                    if (content.match(regex)) {
                        const aElement = document.createElement("A");
                        aElement.setAttribute("href", content);
                        aElement.setAttribute("target", "_blank")
                        aElement.innerText = content.replace(/^https?:\/\//g, "");
                        tdElement.innerText = "";
                        tdElement.append(aElement);
                    }
                    let field = null;
                    for (let tdVisible = tdClassIndex; tdVisible < this.api().settings()[0]['aoColumns'].length; tdVisible++) {
                        if (this.api().settings()[0]['aoColumns'][tdClassIndex].visible !== false) {
                            if(this.api().settings()[0]['aoColumns'][tdClassIndex].data) {
                                field = this.api().settings()[0]['aoColumns'][tdClassIndex].data['_'];
                            }
                            break;
                        } else {
                            tdClassIndex++;
                        }
                    }

                    if (field) {
                        if (this.api().settings()[0]['aoColumns'][tdClassIndex].visible !== false && data["__" + field + "_CLASS"]) {
                            tdElement.classList.add(data["__" + field + "_CLASS"].split(" "));
                        }
                    }

                    tdClassIndex++;
                }
            }
        };

        const colgroupElement = this.element.querySelector("colgroup");
        if(colgroupElement) {
            tableOptions.order = [];
            const columnDefHidden = {
                targets: [],
                visible: false,
                searchable: true
            };
            let indexColumn = 0;
            const children = Object.values(colgroupElement.children);
            children.forEach((colElement) => {
                if(colElement.getAttribute("data-sort")) {
                    const orderItem = [indexColumn, colElement.getAttribute("data-sort")];
                    if(colElement.getAttribute("data-sort-order")) {
                        const index = parseInt(colElement.getAttribute("data-sort-order") ?? "0");
                        tableOptions.order[index - 1] = orderItem;
                    } else {
                        tableOptions.order.push(orderItem);
                    }
                }
                if(colElement.getAttribute("data-visible") === "false") {
                    columnDefHidden.targets.push(indexColumn);
                }
                indexColumn++;
            });
            if(columnDefHidden.targets.length > 0) {
                if(!tableOptions.columnDefs) {
                    tableOptions.columnDefs = [];
                }
                tableOptions.columnDefs.push(columnDefHidden);
            }
        }

        for(const optionName in this.options) {
            if(optionName != "url") {
                tableOptions[optionName] = this.options[optionName];
            }
        }

        if(state) {
            tableOptions.order = state.order;
            tableOptions.search = state.search;
            tableOptions.columns = state.columns;
        }

        if(this.options.url) {
            const ajax = new AjaxManager();
            ajax.get(this.options.url, {}, {
                onSuccess: (response) => {
                    if(response.data) {
                        for(const property in response) {
                            if(property == "data") {
                                tableOptions[property] = this.parseData(response[property]);
                            } else {
                                tableOptions[property] = response[property];
                            }
                        }
                    } else {
                        tableOptions['data'] = response.data;
                    }

                    if(!response.columns) {
                        const columns = {};

                        for(const colName in response.data[0]) {
                            if(colName == "__href") {
                                continue;
                            }
                            if(colName == "__ACTIONS") {
                                columns[colName] = {data: colName, title: colName, width: "30px", type: "html"};
                            } else {
                                columns[colName] = {data: colName, title: colName};
                            }
                        }

                        tableOptions['columns'] = Object.values(columns);
                    } else {
                        tableOptions['columns'] = response.columns;
                    }

                    this.tableDt = new DataTables(this.element, tableOptions);
                    this.tableDt.columns.adjust().draw();

                    if(this.element.classList.contains("collapsed")) {
                        for(const colIndex in tableOptions['columns']) {
                            if(tableOptions['columns'][colIndex]['class'] == "col-responsive" && tableOptions['columns'][colIndex]['visible'] == false) {
                                this.tableDt.column(0).visible(true);
                            }
                        }
                    }
                }
            });
        } else {
            this.tableDt = new DataTables(this.element, tableOptions);
            this.tableDt.columns.adjust().draw();
        }
    }

    bindEvents() {
        const trElements = this.element.querySelectorAll("tbody tr");

        trElements.forEach((trElement) => {
            trElement.addEventListener("click", (e) => {
                if(e.target) {
                    const target = e.target;
                    if(target === trElement || target.parentNode === trElement) {
                        this._dispatchEvent("click-row", this, trElement);
                        if(target.classList.contains("dtr-control")) {
                            const href = trElement.getAttribute("data-href");
                            if(href) {
                                window.location.href = href;
                            }
                        }
                    }
                }
            });
        });
    }

    refresh() {
        const state = this.tableDt.state();
        this.tableDt.destroy();
        this.build(state);
        this._dispatchEvent("refresh", this)
    }

    parseData(data) {
        if(Array.isArray(data) && data.length > 0) {
            for (const indexRow in data) {
                const row = data[indexRow];
                if (row['__ACTIONS'] && Array.isArray(row['__ACTIONS'])) {
                    const actions = [];

                    for (const actionRaw of row['__ACTIONS']) {
                        let action = document.createElement("A")
                        if(actionRaw['url']) {
                            action.setAttribute("href", actionRaw['url']);
                        }
                        if(actionRaw['icon']) {
                            let icon = document.createElement("i");
                            icon.className = actionRaw['icon'];
                            action.append(icon);
                        }

                        if(actionRaw['label']) {
                            let label = document.createElement("span");
                            label.innerText = actionRaw['label'];
                            action.append(label);
                        }

                        if(actionRaw['confirm']) {
                            action.setAttribute("title", actionRaw['confirm']);
                            action.classList.add("confirm-action");
                        } else if(actionRaw['confirm-remove']) {
                            action.setAttribute("title", actionRaw['confirm-remove']);
                            action.classList.add("confirm-remove");
                        }

                        actions.push(action.outerHTML);
                    }

                    data[indexRow]['__ACTIONS'] = `<div>`+actions.join("")+`</div>`;

                } else if(!row['__ACTIONS']) {
                    row['__ACTIONS'] = "";
                }
            }
        }

        return data;
    }
}
