# Petro-Optimiser : Documentation Complète de l'Application

Ce document détaille le fonctionnement, l'architecture et les algorithmes de l'application **Petro-Optimiser**, une plateforme spécialisée dans l'optimisation logistique du transport pétrolier.

## 1. Objectif Global
L'application permet de transformer une liste de commandes (provenant d'un fichier Excel) en un plan de chargement optimal pour une flotte de camions citernes, en minimisant les trajets inutiles et en maximisant le taux de remplissage des compartiments.

---

## 2. Fonctionnement de A à Z

### A. Phase d'Importation
- **Parseur Excel** : L'utilisateur importe un fichier `.xlsx`. L'application normalise les noms de stations, identifie les zones géographiques et mappe les produits pétroliers (Gazole, Essence, etc.) vers des types standardisés.
- **Dédoublonnage** : Le système empêche l'importation de doublons en utilisant une contrainte d'unicité sur le numéro de commande, la station et le produit.
- **Persistance** : Toutes les commandes sont sauvegardées dans une base de données PostgreSQL pour garantir qu'aucune donnée ne soit perdue lors de la navigation.

### B. Phase d'Optimisation (L'Algorithme)
L'algorithme de chargement a été amélioré pour utiliser une stratégie hybride de **"Bin Packing Glouton"** (Remplissage de boîtes) :

1.  **Regroupement & Priorisation** : Les commandes sont d'abord filtrées (Statut `PAID`), groupées par zone géographique, puis triées par volume décroissant. Les plus grosses commandes sont traitées en priorité.
2.  **Stratégie de Remplissage (Bin Packing)** :
    *   L'algorithme itère sur chaque compartiment de chaque camion disponible (`IDLE`).
    *   Pour un compartiment donné, il cherche la combinaison optimale de commandes (du même produit et de la même zone) pour atteindre **100% de remplissage**.
    *   Contrairement à une approche simple, il peut désormais **combiner plusieurs petites commandes** pour combler un compartiment (ex: 8000L + 4000L pour un compartiment de 12000L).
3.  **Fragmentation Intelligente** :
    *   Si une commande est plus grande que le compartiment (ex: 40000L vs 10000L), elle est automatiquement **fragmentée**. Une partie est chargée, le reste est remis dans la file d'attente pour le prochain compartiment.
4.  **Optimisation de la Flotte** : Le camion entier est verrouillé sur une zone géographique unique dès que la première commande est affectée, afin de rationaliser le trajet de livraison.

### C. Phase de Validation
- **Validation Unitaire** : L'utilisateur peut valider chaque camion individuellement après avoir vérifié le plan visuellement.
- **Mise à jour des Statuts** :
    - Le camion passe en statut **"En Transit"**.
    - Les commandes sont marquées comme `isLoaded: 1` et ne sont plus proposées pour de futures optimisations.
    - Un enregistrement historique est créé dans la table `validations`.

### D. Phase de Reporting et Export
- **Menu Commandes** : Un historique centralisé avec des KPIs dynamiques (Total, Réglées, Non Réglées, Chargées).
- **Mes Validations** : Un journal de bord de tous les chargements effectués.
- **Exports Professionnels** : Génération de fichiers **Excel** et **PDF** incluant tous les détails logistiques (immatriculations, zones, numéros de commandes, volumes, taux de remplissage).

---

## 3. Spécificités Techniques

### Architecture Logicielle
- **Backend** : Node.js avec **Express.js**.
- **Base de Données** : PostgreSQL gérée via **Drizzle ORM** pour des performances optimales.
- **Frontend** : **React** avec **Vite**, utilisant **Tailwind CSS** pour une interface "Premium" et moderne.
- **Gestion d'État** : **TanStack Query** (React Query) pour la synchronisation en temps réel avec le serveur.

### Algorithmes Clés
- **Normalisation Fuzzy** : Le parseur Excel utilise une logique de normalisation de chaînes (accents, majuscules, préfixes "STATION", abréviations "STE" vs "SAINTE") pour garantir un matching robuste avec la base de données des stations.
- **Logique de Partitionnement** : L'algorithme de remplissage respecte strictement l'étanchéité des compartiments des camions citernes.

### Sécurité et Fiabilité
- **Gestion des Ports** : Système robuste de gestion du port 5000 pour le serveur de développement.
- **Nettoyage** : Possibilité de vider l'historique complet pour réinitialiser le système proprement.

---
*Petro-Optimiser v1.0 - Conçu pour l'efficacité logistique.*