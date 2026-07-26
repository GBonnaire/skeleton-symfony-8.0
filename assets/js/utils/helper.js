/**
 * Helpers
 * Collection de fonctions utilitaires sans dépendance, utilisées par l'ensemble des modules.
 *
 * Fonctions disponibles :
 *   isChildren(parent, child)      — true si child est parent lui-même ou l'un de ses descendants
 *   isDomLoaded()                  — true si le document est totalement chargé (readyState "complete")
 *   isOnMobile()                   — true si la largeur d'écran est inférieure à 576px
 *   getWindowWidth()               — largeur de l'écran (ou de la fenêtre en repli)
 *   getWindowHeight()              — hauteur de la fenêtre
 *   trim(text, search, type)       — supprime les caractères d'une classe regex en début et/ou fin de chaîne
 *   guid(format)                   — génère un identifiant unique de type UUID v4
 *   password(length, ...)          — génère un mot de passe aléatoire respectant des minimums par type
 *   downloadImage(uri, filename)   — déclenche le téléchargement d'une URI (data: ou URL) sous un nom donné
 *   stripHtml(html)                — retourne le texte brut d'une chaîne HTML
 *
 * Usage :
 *   import { isDomLoaded, guid, stripHtml } from '../../utils/helper';
 *
 *   // Initialiser un module dès que le DOM est prêt
 *   if (isDomLoaded()) {
 *     init();
 *   } else {
 *     document.addEventListener('DOMContentLoaded', () => init());
 *   }
 *
 *   // Identifiant unique pour lier un label à un champ généré
 *   const id = guid();                                  // "3f2a1b9c-..."
 *
 *   // Nettoyer du HTML avant export CSV
 *   stripHtml('<b>Jean</b> Dupont');                    // "Jean Dupont"
 *
 *   // Adapter le comportement au mobile
 *   const position = isOnMobile() ? 'bottom' : 'right';
 *
 *   // Retirer les slashs autour d'un segment d'URL
 *   trim('/admin/users/', '/');                         // "admin/users"
 *
 *   // Mot de passe de 12 caractères : 2 minuscules, 2 majuscules, 2 chiffres, 2 spéciaux minimum
 *   password(12, 2, 2, 2, 2);
 *
 *   // Télécharger un canvas en PNG
 *   downloadImage(canvas.toDataURL('image/png'), 'export.png');
 */

/**
 * Détermine si `child` est `parent` lui-même ou l'un de ses descendants.
 * Remonte l'arbre DOM jusqu'à document.body.
 *
 * @param {Node} parent Élément de référence
 * @param {Node} child Élément à tester
 * @returns {boolean}
 *
 * @example
 * document.addEventListener('click', (e) => {
 *     if (!isChildren(menuElement, e.target)) {
 *         menuElement.classList.remove('open');   // clic en dehors du menu
 *     }
 * });
 */
export function isChildren(parent, child) {
    if(child == parent) {
        return true;
    }
    if(child == document.body) {
        return false;
    }
    if(child.parentNode) {
        return isChildren(parent, child.parentNode);
    } else {
        return false;
    }
}

/**
 * Indique si le document est totalement chargé (readyState === "complete").
 * Permet à un manager de s'initialiser immédiatement ou d'attendre DOMContentLoaded.
 *
 * @returns {boolean}
 *
 * @example
 * if (isDomLoaded()) {
 *     this._init(selector);
 * } else {
 *     document.addEventListener('DOMContentLoaded', () => this._init(selector));
 * }
 */
export function isDomLoaded() {
    if(document.readyState === "complete") {
        return true;
    }
    return false;
}

/**
 * Indique si l'on est sur un affichage mobile (largeur inférieure à 576px).
 *
 * @returns {boolean}
 *
 * @example
 * const modal = new Modal({
 *     canMove: !isOnMobile(),          // pas de déplacement au doigt sur mobile
 * });
 */
export function isOnMobile() {
    if(getWindowWidth() < 576) {
        return true;
    } else {
        return false;
    }
}

/**
 * Retourne la largeur de l'écran, avec repli sur la largeur de la fenêtre puis du document.
 *
 * @returns {number} Largeur en pixels
 *
 * @example
 * const columns = getWindowWidth() < 768 ? 1 : 3;
 */
export function getWindowWidth() {
    if(screen && screen.width) {
        return screen.width;
    }
    const w = window,
        d = document,
        e = d.documentElement,
        g = d.getElementsByTagName('body')[0],
        x = w.innerWidth || e.clientWidth || g.clientWidth;
    return x;
}

/**
 * Retourne la hauteur utile de la fenêtre (viewport).
 *
 * @returns {number} Hauteur en pixels
 *
 * @example
 * // Ouvrir le tooltip vers le haut s'il n'y a pas la place en dessous
 * const openUp = (rect.bottom + tooltipHeight) > getWindowHeight();
 */
export function getWindowHeight() {
    const w = window,
        d = document,
        e = d.documentElement,
        g = d.getElementsByTagName('body')[0],
        y = w.innerHeight || e.clientHeight || g.clientHeight;
    return y;
}

/**
 * Supprime les caractères correspondant à `search` en début et/ou fin de chaîne,
 * puis applique un trim classique sur les espaces.
 *
 * `search` est injecté dans une classe de caractères regex : passer plusieurs
 * caractères revient à tous les retirer (ex: "/-" retire les / et les -).
 *
 * @param {string} text Chaîne à nettoyer
 * @param {string} [search="s"] Caractères à retirer (contenu d'une classe regex)
 * @param {"left"|"right"|"both"} [type="both"] Côté(s) à nettoyer
 * @returns {string}
 *
 * @example
 * trim('/admin/users/', '/');            // "admin/users"
 * trim('...chargement', '.', 'left');    // "chargement"
 * trim('valeur;;;', ';', 'right');       // "valeur"
 */
export function trim(text, search, type) {
    if(!search) {
        search = "s";
    }
    if(!type) {
        type = "both";
    }
    if(type === "left" || type === "both") {
        text = text.replace(new RegExp("^[" + search + "]+"), "");
    }
    if(type === "right" || type === "both") {
        text = text.replace(new RegExp("[" + search + "]+$"), "");
    }
    return text.trim();
}

/**
 * Génère un identifiant unique au format UUID v4 par défaut.
 * Dans le format, chaque `x` est remplacé par un chiffre hexadécimal aléatoire
 * et chaque `y` par un chiffre de variante (8, 9, a ou b). Les autres caractères
 * sont conservés tels quels.
 *
 * Note : basé sur Math.random(), à réserver aux identifiants DOM — pas à un usage cryptographique.
 *
 * @param {string} [format='xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'] Gabarit de génération
 * @returns {string}
 *
 * @example
 * // Identifiant unique pour un élément généré dynamiquement
 * const id = guid();                     // "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d"
 * button.setAttribute('data-clipboard-target', '#' + id);
 *
 * // Format personnalisé (suffixe court)
 * guid('tooltip-xxxxxx');                // "tooltip-a3f9c1"
 */
export function guid(format = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx') {
    return format.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

/**
 * Génère un mot de passe aléatoire respectant un minimum de caractères par catégorie.
 * Si `length` est inférieur à la somme des minimums, il est automatiquement relevé.
 * Le résultat est mélangé pour ne pas laisser les catégories groupées.
 *
 * Note : basé sur Math.random(), à réserver aux suggestions côté interface —
 * pour un secret sensible, générer côté serveur.
 *
 * @param {number} length Longueur souhaitée
 * @param {number} minLowercase Nombre minimum de minuscules
 * @param {number} minUppercase Nombre minimum de majuscules
 * @param {number} minNumbers Nombre minimum de chiffres
 * @param {number} minSpecialChars Nombre minimum de caractères spéciaux
 * @param {string} [specialChars="!@#$%^&*()_+[]{}|;:,.<>?"] Jeu de caractères spéciaux
 * @returns {string}
 *
 * @example
 * // Bouton "Générer un mot de passe" dans un formulaire
 * generateButton.addEventListener('click', () => {
 *     input.value = password(16, 2, 2, 2, 2);
 * });
 *
 * // Sans caractères spéciaux exotiques
 * password(12, 3, 3, 3, 1, '!@#$');
 */
export function password(length, minLowercase, minUppercase, minNumbers, minSpecialChars, specialChars = "!@#$%^&*()_+[]{}|;:,.<>?") {
    const lowercaseChars = "abcdefghijklmnopqrstuvwxyz";
    const uppercaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";

    const chars = lowercaseChars + uppercaseChars + numbers + specialChars;
    length = Math.max(length, minLowercase + minUppercase + minNumbers + minSpecialChars);

    let pwd = "";

    function getRandomCharacters(charSet, count) {
        let result = "";
        for (let i = 0; i < count; i++) {
            const randomIndex = Math.floor(Math.random() * charSet.length);
            result += charSet[randomIndex];
        }
        return result;
    }

    pwd += getRandomCharacters(lowercaseChars, minLowercase);
    pwd += getRandomCharacters(uppercaseChars, minUppercase);
    pwd += getRandomCharacters(numbers, minNumbers);
    pwd += getRandomCharacters(specialChars, minSpecialChars);

    const remainingLength = length - pwd.length;

    if (remainingLength > 0) {
        pwd += getRandomCharacters(chars, remainingLength);
    }

    pwd = pwd.split('').sort(() => Math.random() - 0.5).join('');

    return pwd;
}

/**
 * Déclenche le téléchargement d'une URI sous un nom de fichier donné.
 * Crée un lien temporaire, le clique puis le retire du DOM.
 * Fonctionne avec une data URI, une blob URL ou une URL de même origine.
 *
 * @param {string} uri Source du fichier (data:, blob: ou URL)
 * @param {string} filename Nom du fichier proposé au téléchargement
 * @returns {void}
 *
 * @example
 * // Export d'un graphique en PNG
 * downloadImage(canvas.toDataURL('image/png'), 'statistiques.png');
 *
 * // Export d'un blob généré côté client
 * downloadImage(URL.createObjectURL(blob), 'export.csv');
 */
export function downloadImage(uri, filename) {
    const link = document.createElement('a');
    link.download = filename;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * Retourne le contenu textuel d'une chaîne HTML, balises retirées.
 * Utilisé notamment par Table pour la recherche et l'export de cellules formatées.
 *
 * Note : le HTML est injecté dans un élément détaché — les balises ne sont pas rendues,
 * mais ne pas utiliser cette fonction comme mécanisme d'assainissement de contenu non fiable.
 *
 * @param {string} html Chaîne HTML
 * @returns {string} Texte brut
 *
 * @example
 * stripHtml('<b>Jean</b> Dupont');                          // "Jean Dupont"
 * stripHtml('<span class="badge">Actif</span>');            // "Actif"
 *
 * // Comparer le contenu d'une cellule formatée
 * const value = stripHtml(cell.innerHTML).trim();
 */
export function stripHtml(html) {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
}
