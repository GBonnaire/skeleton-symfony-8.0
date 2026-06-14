<?php

namespace App\Twig\Components;

use Symfony\Component\Form\FormView;
use Symfony\UX\TwigComponent\Attribute\AsTwigComponent;

/**
 * Composant de mise en page pour les formulaires dans une carte centrée,
 * avec support optionnel d'une sidebar.
 *
 * Usage complet :
 *
 * ```twig
 * <twig:Form
 *     :form="form"
 *     classCard="max-w-md mx-auto mt-8"
 *     submitClass="da-btn da-btn-primary da-btn-lg w-full"
 * >
 *     {# Titre affiché dans le <h2> de la carte #}
 *     <twig:block name="title">
 *         <i class="fa-solid fa-pen mr-2 text-azur-600"></i>
 *         Mon formulaire
 *     </twig:block>
 *
 *     {# Sous-titre affiché sous le titre (inclure la balise <p> si besoin) #}
 *     <twig:block name="subtitle">
 *         <p class="text-ink-500 mt-2">Description courte du formulaire.</p>
 *     </twig:block>
 *
 *     {# Contenu affiché avant les champs (alertes, messages d'info…) #}
 *     <twig:block name="header">
 *         <div class="bg-ink-50 border border-ink-100 p-4 mb-6">
 *             <p class="text-sm text-ink-700">Message d'introduction.</p>
 *         </div>
 *     </twig:block>
 *
 *     {# Champs du formulaire — form_start/form_end sont gérés par le composant #}
 *     <twig:block name="fields">
 *         <div class="form-group">
 *             {{ form_label(form.email, null, {'label_attr': {'class': 'da-label'}}) }}
 *             {{ form_widget(form.email, {'attr': {'class': 'da-input'}}) }}
 *             {{ form_errors(form.email) }}
 *         </div>
 *     </twig:block>
 *
 *     {# Libellé du bouton submit (peut contenir du HTML) #}
 *     <twig:block name="label">
 *         <i class="fa-solid fa-paper-plane mr-2"></i>
 *         Envoyer
 *     </twig:block>
 *
 *     {# Remplace entièrement la zone de boutons (label ignoré si défini) #}
 *     <twig:block name="controls">
 *         <a href="{{ path('app_home') }}" class="da-btn da-btn-ghost da-btn-lg">Annuler</a>
 *         <button type="submit" class="da-btn da-btn-primary da-btn-lg">Valider</button>
 *     </twig:block>
 *
 *     {# Contenu affiché après le formulaire (liens, notes de bas de page…) #}
 *     <twig:block name="footer">
 *         <div class="mt-6 text-center text-sm text-ink-500">
 *             <a href="{{ path('app_login') }}" class="text-azur-600 hover:underline">Retour</a>
 *         </div>
 *     </twig:block>
 *
 *     {# Colonne latérale optionnelle (visible uniquement si non vide) #}
 *     <twig:block name="sidebar">
 *         <div class="card w-full p-4">
 *             <h3 class="font-bold mb-2">Récapitulatif</h3>
 *             <p class="text-sm text-ink-500">Contenu de la sidebar.</p>
 *         </div>
 *     </twig:block>
 * </twig:Form>
 * ```
 */
#[AsTwigComponent('Form', template: 'components/form.html.twig')]
class FormComponent
{
    public ?FormView $form = null;
    public string $submitClass = 'da-btn da-btn-primary da-btn-lg w-full';
    public string $classCard = '';
}
