import { Controller } from '@hotwired/stimulus';

/*
 * data-controller="components--twig--form"
 *
 * Charge les styles du composant <twig:Form> à la demande et pose la classe
 * CSS cible sur l'élément hôte.
 *
 * Aucune valeur Stimulus — le composant est purement déclaratif.
 *
 * Blocs Twig disponibles :
 *   title, subtitle, header, fields, label, controls, footer, sidebar
 *
 * Props Twig :
 *   form        — FormView Symfony (obligatoire)
 *   classCard   — classes CSS additionnelles sur la colonne principale
 *   submitClass — classes du bouton submit (défaut : da-btn da-btn-primary da-btn-lg w-full)
 *
 * Exemple :
 *   <twig:Form :form="form" classCard="max-w-md mx-auto mt-8">
 *       <twig:block name="title">Mon formulaire</twig:block>
 *       <twig:block name="fields">…</twig:block>
 *   </twig:Form>
 */
export default class extends Controller {

    connect() {
        this.element.classList.add('twig-form');
        import('../../../styles/components/twig/form.css');
    }

    disconnect() {
        this.element.classList.remove('twig-form');
    }
}
