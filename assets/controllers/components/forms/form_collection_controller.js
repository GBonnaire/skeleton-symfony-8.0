import { Controller } from '@hotwired/stimulus';

/**
 * Form Collection Controller
 *
 * Gère les formulaires imbriqués (collections) dans Symfony Forms.
 * Permet d'ajouter et de supprimer dynamiquement des éléments de collection.
 *
 * Usage:
 * Le contrôleur est automatiquement attaché via le form_theme.html.twig
 * sur les champs de type CollectionType avec allow_add et/ou allow_delete.
 *
 * @example
 * $builder->add('yourfieldsname', CollectionType::class, [
 *     'entry_type' => YourFieldType::class,
 *     'allow_add' => true,
 *     'allow_delete' => true,
 *     'by_reference' => false,
 *     'prototype' => true,
 * ]);
 */
export default class extends Controller {
    static targets = ['item'];
    static values = {
        prototype: String,
        index: Number
    };

    /**
     * Initialisation du contrôleur
     */
    connect() {
    }

    /**
     * Ajoute un nouvel élément à la collection
     *
     * @param {Event} event - L'événement de clic
     */
    add(event) {
        event.preventDefault();

        if (!this.hasPrototypeValue) {
            console.error('No prototype found for collection');
            return;
        }

        try {
            // Décode le prototype HTML (encodé en HTML entities par Twig)
            const prototype = this.decodeHtml(this.prototypeValue);

            // Remplace __name__ par l'index actuel
            const newItemHtml = prototype.replace(/__name__/g, this.indexValue);

            // Crée un wrapper temporaire pour parser le HTML
            const wrapper = document.createElement('div');
            wrapper.innerHTML = newItemHtml.trim();

            // Récupère l'élément créé (le premier enfant du wrapper)
            const newItem = wrapper.firstElementChild;

            if (!newItem) {
                console.error('Failed to create new item from prototype');
                return;
            }

            // Insère le nouvel élément juste avant le bouton d'ajout
            this.element.insertBefore(newItem, event.target);

            // Incrémente l'index pour le prochain élément
            this.indexValue++;

            // Dispatche un événement personnalisé
            this.dispatch('added', {
                detail: {
                    index: this.indexValue - 1,
                    element: newItem
                }
            });

            // Re-initialise Basecoat si nécessaire pour les nouveaux éléments
            if (window.basecoat && window.basecoat.initAll) {
                window.basecoat.initAll();
            }
        } catch (error) {
            console.error('Error adding collection item:', error);
        }
    }

    /**
     * Supprime un élément de la collection
     *
     * @param {Event} event - L'événement de clic
     */
    remove(event) {
        event.preventDefault();

        // Trouve l'élément parent (collection-item)
        const item = event.target.closest('[data-form-collection-target="item"]');

        if (!item) {
            console.error('Collection item not found');
            return;
        }

        // Dispatche un événement avant suppression
        this.dispatch('removing', { detail: { item } });

        // Animation de suppression (fade out)
        item.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
        item.style.opacity = '0';
        item.style.transform = 'translateX(-20px)';

        // Supprime l'élément après l'animation
        setTimeout(() => {
            item.remove();
            this.dispatch('removed');
        }, 300);
    }

    /**
     * Décode les HTML entities
     *
     * Cette méthode est nécessaire car Twig encode le prototype
     * avec e('html_attr') pour le passer en attribut data.
     *
     * @param {string} html - HTML encodé en entities
     * @returns {string} - HTML décodé
     */
    decodeHtml(html) {
        const textarea = document.createElement('textarea');
        textarea.innerHTML = html;
        return textarea.value;
    }

    /**
     * Compte le nombre d'éléments dans la collection
     *
     * @returns {number} Le nombre d'éléments
     */
    get itemCount() {
        return this.itemTargets.length;
    }

    /**
     * Vérifie si la collection est vide
     *
     * @returns {boolean} True si la collection est vide
     */
    get isEmpty() {
        return this.itemCount === 0;
    }
}
