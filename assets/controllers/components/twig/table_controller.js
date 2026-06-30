import { Controller } from '@hotwired/stimulus';
import { Table } from '../../../js/modules/table/table';

/*
 * data-controller="components--twig--table"
 *
 * Initialise un DataTable sur la balise <table> cible via le module Table.
 * La balise est générée par le composant Twig #[AsTwigComponent('Table')] —
 * utiliser <twig:Table /> plutôt que de poser les attributs à la main.
 *
 * Valeurs Stimulus (préfixe : data-components--twig--table-*-value) :
 *   url-value          — URL AJAX pour charger les données JSON (table vide côté HTML)
 *   title-value        — titre affiché dans le bouton "Copier" de DataTables
 *   header-value       — afficher/masquer les contrôles en-tête DataTables (toujours émis, défaut : true)
 *   footer-value       — false pour masquer les contrôles pied DataTables   (défaut : true)
 *   new-url-value      — URL du bouton "Ajouter" injecté dans la barre DataTables
 *   new-title-value    — libellé du bouton "Ajouter"
 *   responsive-value   — false pour activer le scroll horizontal au lieu du responsive (défaut : true)
 *
 * Événements émis :
 *   components--twig--table:load  — déclenché après le chargement initial des données (detail.table = instance Table)
 *
 * Actions exposées :
 *   data-action="components--twig--table#refresh"  — recharge les données AJAX
 *
 * Exemple via composant Twig (recommandé) :
 *   <twig:Table url="{{ path('app_data') }}" newUrl="{{ path('app_new') }}" newTitle="Ajouter" />
 *   <twig:Table :data="tableView" />
 *   <twig:Table url="{{ path('app_data') }}" :header="false" />
 */
export default class extends Controller {

    static values = {
        url:        String,
        title:      String,
        header:     { type: Boolean, default: true },
        footer:     { type: Boolean, default: true },
        newUrl:     String,
        newTitle:   String,
        responsive: { type: Boolean, default: true },
    }

    connect() {
        this.tableElement = this.element.querySelector('table');
        this._syncDataAttributes();
        this.table = new Table(this.tableElement);

        this.table.addEventListener('load', () => {
            this.dispatch('load', { detail: { table: this.table } });
        });
    }

    disconnect() {
        this.table?.tableDt?.destroy(false);
        this.table = null;
    }

    // Action : data-action="components--table#refresh"
    refresh() {
        this.table?.refresh();
    }

    // Copie les Stimulus values dans les data-* attendus par le module Table
    _syncDataAttributes() {
        if (this.hasUrlValue)      this.tableElement.dataset.url      = this.urlValue;
        if (this.hasTitleValue)    this.tableElement.dataset.title    = this.titleValue;
        if (this.hasNewUrlValue)   this.tableElement.dataset.newUrl   = this.newUrlValue;
        if (this.hasNewTitleValue) this.tableElement.dataset.newTitle = this.newTitleValue;

        // Le module Table lit "0" pour désactiver ; on ne pose l'attribut que si c'est false
        if (this.hasHeaderValue    && !this.headerValue)    this.tableElement.dataset.header    = '0';
        if (this.hasFooterValue    && !this.footerValue)    this.tableElement.dataset.footer    = '0';
        if (this.hasResponsiveValue && !this.responsiveValue) this.tableElement.dataset.responsive = '0';
    }
}
