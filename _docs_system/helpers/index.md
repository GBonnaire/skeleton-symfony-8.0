# Helpers — Vue d'ensemble

Classes utilitaires statiques situées dans `src/Util/Helpers/`.  
Toutes les méthodes sont `static` ; aucune instanciation n'est nécessaire.

| Classe | Fichier                           | Rôle |
|--------|-----------------------------------|------|
| [Address](#address) | `Address.php`                     | Formatage de codes postaux |
| [ApiResponse](#apiresponse) | `ApiResponse.php`                 | Réponses JSON standardisées pour l'API |
| [Converter](#converter) | `Converter.php`                   | Conversion de types et génération de listes textuelles |
| [Date](#date) | `Date.php`                        | Parsing, manipulation et calculs de dates |
| [DateDistribution](#datedistribution) | `DateDistribution.php`            | Répartition d'éléments sur des créneaux temporels |
| [Number](#number) | `Number.php`                      | Formatage et extraction de valeurs numériques |
| [Password](#password) | `Password.php`                    | Génération de tokens et mots de passe sécurisés |
| [PhoneNumber](#phonenumber) | `PhoneNumber.php`                 | Normalisation de numéros de téléphone (FR, BE) |
| [Table](#table) | `Table.php`                       | Manipulation de tableaux et collections Doctrine |
| [Text](#text) | `Text.php`                        | Normalisation et conversion de chaînes de caractères |
| [Web](#web) | `Web.php`                         | Manipulation d'URLs et de domaines |
| [WebScrapper](#webscrapper) | `WebScrapper.php`                 | Scraping HTTP, extraction de métadonnées et liens |
| [DataTypeEnum](#datatypeenum) | `Converter/Enum/DataTypeEnum.php` | Enum des types de données cibles pour `Converter` |

---

## Address

[→ Documentation complète](address.md)

Normalise les codes postaux : supprime les caractères non numériques, padde ou tronque à la longueur cible.

---

## ApiResponse

[→ Documentation complète](api-response.md)

Produit des `JsonResponse` Symfony avec une structure uniforme `{status, message, data}`.

---

## Converter

[→ Documentation complète](converter.md)

Convertit une valeur vers un type `DataTypeEnum` cible. Génère également des listes textuelles à partir de tableaux.

---

## Date

[→ Documentation complète](date.md)

Crée, modifie et parse des dates. Gère les jours fériés français, les modificateurs relatifs et la détection automatique de formats.

---

## DateDistribution

[→ Documentation complète](date-distribution.md)

Distribue aléatoirement (ou de façon équilibrée) un tableau d'éléments sur des créneaux générés par un intervalle entre deux dates.

---

## Number

[→ Documentation complète](number.md)

Formate les grands nombres avec suffixe (K, M, B, T) et extrait la valeur min/max depuis une chaîne composite.

---

## Password

[→ Documentation complète](password.md)

Génère des tokens hexadécimaux ou des mots de passe respectant des catégories de caractères définies.

---

## PhoneNumber

[→ Documentation complète](phone-number.md)

Normalise les numéros de téléphone au format France (10 chiffres) ou Belgique (9-10 chiffres).

---

## Table

[→ Documentation complète](table.md)

Accès par chemin pointé, suppression de valeur, fusion de collections Doctrine, vérification de clé définie.

---

## Text

[→ Documentation complète](text.md)

Conversions de casse (snake, camel, pascal, kebab…), normalisation, suppression d'accents/emojis, décodage UTF-8.

---

## Web

[→ Documentation complète](web.md)

Extraction de domaine, construction d'URL absolues, comparaison de domaines, ajout de paramètres en query string.

---

## WebScrapper

[→ Documentation complète](web-scrapper.md)

Vérification d'accessibilité d'URL, extraction de liens sociaux, d'images représentatives, de métadonnées et du corps HTML via cURL/DOMDocument.

---

## DataTypeEnum

[→ Documentation complète](data-type-enum.md)

Enum backed `string` listant les types supportés par `Converter::convertTo()`.
