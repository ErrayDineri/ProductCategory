# ProductCategory

Application full-stack simple pour gerer des categories et des produits.

## Fonctionnalites
- Gestion des produits, categories et fournisseurs.
- Panier client (ajout/suppression de produits).
- Authentification avec roles et dashboards separes.

## Authentification et roles
- **SUPERADMIN** : gere les roles utilisateurs (dashboard dedie).
- **ADMIN** : gere produits, categories, fournisseurs (dashboard dedie).
- **CLIENT** : consulte et ajoute des produits dans son panier personnel (dashboard dedie).

Un seul superadmin est cree automatiquement au premier lancement du backend :
- username: `superadmin`
- password: `superadmin123`

Seul le superadmin peut promouvoir un utilisateur en ADMIN.
Les comptes CLIENT peuvent etre crees depuis la page signup frontend.

## Pages d'authentification
- Login: `/#/login`
- Signup (client): `/#/signup`

Exemple local:
- `http://localhost:5173/#/login`
- `http://localhost:5173/#/signup`

Si le port 5173 est occupe, Vite peut demarrer sur 5174.

## Architecture (bref)
- `back/` : API REST Spring Boot (Java 21, JPA).
- `front/product-category-frontend/` : interface React + Vite + TypeScript.
- Base de donnees : PostgreSQL (configuree dans `back/src/main/resources/application.properties`).

Flux global : Frontend (`http://localhost:5173`) -> API Backend (`http://localhost:8080/api`) -> PostgreSQL.

## Prerequis
- Java 21
- Node.js 20+ et npm
- PostgreSQL (base `product_category`)

## Setup rapide
1. Creer la base PostgreSQL :
```sql
CREATE DATABASE product_category;
```
2. Verifier les identifiants DB dans `back/src/main/resources/application.properties` :
- `spring.datasource.username=postgres`
- `spring.datasource.password=admin123` (dans mon cas)

## Lancer le projet
1. Backend (dans `back/`) :
```powershell
.\mvnw.cmd spring-boot:run
```
2. Frontend (dans `front/product-category-frontend/`) :
```powershell
npm install
npm run dev
```
3. Ouvrir l'URL Vite affichee dans le terminal (souvent `http://localhost:5173`).

## Parcours recommande
1. Se connecter en superadmin via `/#/login`.
2. Creer un ou plusieurs comptes ADMIN depuis le dashboard superadmin.
3. Creer un compte CLIENT via `/#/signup`.
4. Se connecter avec chaque role pour tester son dashboard dedie.

## Captures d'ecran
- Capture 1 : vue avec filtre sur une categorie
  ![Capture 1](screen2.jpg)
- Capture 2 : vue generale (toutes categories)
  ![Capture 2](screen1.jpg)
