/**
 * EventsDispatcher
 * Classe de base fournissant un système d'événements interne aux modules.
 * La plupart des composants du projet en héritent (Modal, Table, Tooltip, FileField,
 * Rating, MaskField, ConditionalField, Clipboard, Selectize...) afin d'exposer
 * leurs événements via addEventListener().
 *
 * Particularités :
 *   - un même callback peut être abonné à plusieurs événements en passant un tableau
 *   - l'événement spécial "all" reçoit tous les événements, avec le nom en premier argument
 *   - les noms d'événements sont comparés sans tenir compte de la casse
 *   - avec le rejeu activé, un abonnement tardif reçoit immédiatement les événements déjà émis
 *
 * Options du constructeur (à passer via super() dans la classe fille) :
 *   debug             — trace chaque émission et chaque rejeu dans la console
 *   activeStackReplay — mémorise les événements émis pour les rejouer aux abonnés tardifs
 *
 * Usage — côté module :
 *   import { EventsDispatcher } from '../../utils/events-dispatcher';
 *
 *   export class Rating extends EventsDispatcher {
 *       constructor(element) {
 *           super(true);                        // debug activé
 *           ...
 *       }
 *
 *       setValue(value) {
 *           this.#score = value;
 *           this._dispatchEvent('change', this, value);
 *       }
 *   }
 *
 * Usage — côté appelant :
 *   const rating = new Rating(element);
 *
 *   rating.addEventListener('change', (instance, value) => {
 *       console.log('Nouvelle note :', value);
 *   });
 *
 *   // Un même callback sur plusieurs événements
 *   modal.addEventListener(['open', 'close'], () => refreshLayout());
 *
 *   // Écouter tout ce que le composant émet (nom de l'événement en premier argument)
 *   table.addEventListener('all', (eventName, ...args) => {
 *       console.log('Événement table :', eventName, args);
 *   });
 *
 *   // Chaînage des abonnements
 *   modal.addEventListener('open', onOpen)
 *        .addEventListener('close', onClose);
 */
export class EventsDispatcher {

    /**
     * @param {boolean} [debug=false] Trace les émissions d'événements dans la console
     * @param {boolean} [activeStackReplay=false] Mémorise les événements pour les rejouer aux abonnés tardifs
     */
    constructor(debug = false, activeStackReplay = false) {
        this._eventCallBack = [];
        this._eventDebug = debug;
        this._eventStackActive = activeStackReplay;
        this._eventStack = [];
    }

    /**
     * Abonne un callback à un ou plusieurs événements.
     * Si le rejeu est actif, les événements déjà émis sont immédiatement rejoués au callback.
     *
     * @param {string|Array<string>} event Nom de l'événement, tableau de noms, ou "all"
     * @param {Function} callback Appelé avec les arguments de l'émission (`this` = l'instance)
     * @returns {this} Pour chaînage
     *
     * @example
     * table.addEventListener('loaded', (rows) => console.log(rows.length));
     * table.addEventListener(['loaded', 'error'], () => loader.remove());
     */
    addEventListener(event, callback) {
        if (Array.isArray(event)) {
            for (const e of event) {
                this.addEventListener(e, callback);
            }
        } else {
            this._eventCallBack.push({
                event: event,
                callback: callback
            });

            for(const e of this._eventStack) {
                if(event.toLowerCase() === e.event.toLowerCase() && typeof callback === "function") {
                    if(this._eventDebug) {
                        console.log("EventsDispatcher *DEBUG*", e.event, e.args);
                    }
                    callback.apply(this, e.args);
                } else if(event.toLowerCase() === "all" && typeof callback === "function") {
                    if(this._eventDebug) {
                        console.log("EventsDispatcher *DEBUG*", e.event, e.args);
                    }
                    callback.apply(this, [e.event.toLowerCase(), ...e.args]);
                }
            }
        }
        return this;
    }

    /**
     * Émet un événement vers les callbacks abonnés (usage interne au composant).
     * Les abonnés à "all" sont également notifiés, avec le nom de l'événement en premier argument.
     *
     * @param {string} event Nom de l'événement
     * @param {...*} args Arguments transmis aux callbacks
     * @returns {*} La dernière valeur non-undefined retournée par un callback,
     *              ce qui permet à un abonné de répondre au composant (ex: annuler une action)
     *
     * @example
     * // Dans une classe fille
     * this._dispatchEvent('change', this, value);
     *
     * // Récupérer une réponse de l'abonné pour conditionner la fermeture
     * if (this._dispatchEvent('beforeClose') === false) {
     *     return;
     * }
     */
    _dispatchEvent(event, ...args) {
        if(this._eventDebug) {
            console.trace("EventsDispatcher *DEBUG*", event, args);
        }
        if(this._eventStackActive) {
            this._eventStack.push({event: event, args: args});
        }
        let res;
        for(const cb of this._eventCallBack) {
            if(cb.event.toLowerCase() === event.toLowerCase() && typeof cb.callback === "function") {
                const tmp = cb.callback.apply(this, args);
                if(tmp !== undefined) {
                    res = tmp;
                }
            } else if(cb.event.toLowerCase() === "all" && typeof cb.callback === "function") {
                cb.callback.apply(this, [event.toLowerCase(), ...args]);
            }
        }
        return res;
    }
}
