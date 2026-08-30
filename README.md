# PointageSN 🇸🇳

> **La Vie Scolaire Digitale & Instantanée pour les Établissements Sénégalais**

PointageSN est une application web moderne (Next.js 14 App Router, TypeScript, Tailwind CSS, Lucide Icons) conçue pour la gestion en temps réel des présences, absences et retards, avec notification automatique des parents d'élèves par **WhatsApp** et transmission des rapports de séance à la Direction.

---

## ✨ Fonctionnalités Principales

- 🇸🇳 **Données Sénégalaises & Format Local** : Prise en charge des numéros sénégalais (`+221...`) et données réalistes d'élèves et de tuteurs légaux.
- 🔴 **Alertes WhatsApp Directes** : Dès qu'un élève est marqué *Absent* ou *Retard*, un bouton permet d'envoyer instantanément un message personnalisé et pré-formaté au parent via `wa.me`.
- 📊 **Tableau de Bord & Assiduité en Temps Réel** : Compteurs d'effectif, présences, absences et retards avec jauge de présence dynamique.
- 📋 **Clôture de Séance & Rapport Direction** : Génération d'un rapport textuel complet avec emojis, prêt à être copié ou envoyé à la Direction.
- 💾 **Persistance LocalStorage** : Sauvegarde automatique de l'état du pointage sans perte de données au rechargement.
- 🌙 **Design Dark Élégant & Mobile-First** : Palette Slate-950, accents Vert Émeraude Sénégal, Rose Alerte et Ambre Retard.

---

## 🛠️ Stack Technique

- **Framework** : [Next.js 14](https://nextjs.org/) (App Router)
- **Langage** : [TypeScript](https://www.typescriptlang.org/)
- **Style** : [Tailwind CSS](https://tailwindcss.com/)
- **Icônes** : [Lucide React](https://lucide.dev/)

---

## 🚀 Installation et Lancement Local

1. **Cloner le dépôt :**
   ```bash
   git clone https://github.com/modyDiam/PointageSN.git
   cd PointageSN
   ```

2. **Installer les dépendances :**
   ```bash
   npm install
   ```

3. **Lancer le serveur de développement :**
   ```bash
   npm run dev
   ```

4. Ouvrir [http://localhost:3000](http://localhost:3000) dans votre navigateur.

---

## 📄 Licence

MIT © PointageSN
