---
name: feedback-skeleton-tools
description: "Utiliser les outils du skeleton existant dans les développements, doc dans _docs_system"
metadata: 
  node_type: memory
  type: feedback
---

Toujours privilégier les composants et services déjà présents dans le skeleton du projet plutôt que d'en créer de nouveaux.

**Why:** Le projet dispose d'un skeleton avec des outils prêts à l'emploi (composants, services, helpers). Réinventer ces outils crée de la duplication et de l'incohérence.

**How to apply:** Avant tout développement, consulter la documentation du skeleton dans `_docs_system/` pour identifier les composants/services disponibles (formulaires, modales, tables, toasts, datepicker, selectize, etc.) et les réutiliser en priorité.
