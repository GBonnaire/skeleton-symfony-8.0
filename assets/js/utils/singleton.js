/**
 * Singleton
 * Classe de base garantissant une instance unique par classe fille, partagée
 * pour toute la page via l'objet global (self.__s__).
 * Utilisée par les managers globaux du projet : Translator, ModalManager, ToastManager.
 *
 * Fonctionnement :
 *   - récupérer l'instance se fait toujours via la méthode statique get()
 *   - la première invocation de get() instancie la classe, les suivantes réutilisent l'instance
 *   - une instanciation directe par `new` après un get() lève une erreur
 *   - la clé de stockage est `singletonName` si définie, sinon le nom de la classe
 *
 * Important : redéfinir `singletonName` dans chaque classe fille. Le nom de classe
 * étant modifié par la minification en production, une clé explicite et courte
 * garantit la stabilité du singleton entre les environnements.
 *
 * Usage — déclarer un singleton :
 *   import { Singleton } from '../../utils/singleton';
 *
 *   export class ToastManager extends Singleton {
 *       static _singletonName = "ttm";
 *
 *       static get singletonName() {
 *           return this._singletonName;
 *       }
 *
 *       constructor() {
 *           super();
 *           this.container = null;
 *       }
 *   }
 *
 * Usage — consommer un singleton :
 *   ToastManager.get().flash('success', 'Enregistrement effectué');
 *   ModalManager.get().closeAll();
 *   Translator.get().trans('Copy', 'clipboard');
 *
 *   ToastManager.get() === ToastManager.get();   // true — même instance
 */
export class Singleton {
    static __singleton = {};

    /**
     * Empêche une seconde instanciation directe d'une classe déjà enregistrée.
     * Utiliser get() plutôt que `new`.
     *
     * @throws {Error} Si une instance de cette classe existe déjà
     */
    constructor() {
        const name = this.constructor.singletonName ?? this.constructor.name;
        if (self['__s__'] && self['__s__'][name]) {
            throw new Error('You cannot initialize this class twice');
        }
    }

    /**
     * Clé d'enregistrement du singleton. À redéfinir dans chaque classe fille pour
     * rester stable après minification ; sinon le nom de la classe est utilisé.
     *
     * @returns {string|undefined}
     *
     * @example
     * static _singletonName = "mm";
     * static get singletonName() {
     *     return this._singletonName;
     * }
     */
    static get singletonName() {
        return undefined;
    }

    /**
     * Retourne l'instance unique de la classe, en la créant à la première invocation.
     * C'est le point d'entrée à utiliser partout dans l'application.
     *
     * @returns {Singleton} L'instance partagée de la classe appelante
     *
     * @example
     * const toasts = ToastManager.get();
     * toasts.flash('warning', 'Session bientôt expirée');
     */
    static get() {
        const name = this.singletonName ?? this.name;
        if(!self['__s__']) {
            self['__s__'] = {};
        }
        if (!self['__s__'][name]) {
            self['__s__'][name] = new this();
        }
        return self['__s__'][name];
    }
}
