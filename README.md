# 00:11 — BEYOND INFINITY

Prototype de la première scène : compteur 00:10:57 → 00:11, pièce nocturne en vue subjective, téléphone interactif, porte vers le chapitre 2022.

## Lancer en local

    npm install
    npm run dev

Ouvrir l'adresse affichée (le réseau local est exposé, donc testable depuis le téléphone).
Forcer un niveau graphique : `?q=low`, `?q=medium` ou `?q=high`.

## Déployer sur GitHub Pages (automatique)

Le dossier `.github/workflows/deploy.yml` construit et publie le site à chaque `git push` sur `main`. Étape unique à faire une fois :

1. Sur GitHub, dans le repo : Settings > Pages > Build and deployment > Source > **GitHub Actions**.
2. `git push`. Onglet Actions : suivre le déploiement. Le site est en ligne une fois le workflow vert.

Important : ne jamais mettre en ligne le dossier `src/` tel quel (ex : en le poussant directement comme contenu du site). Le navigateur ne peut pas exécuter ce code sans l'étape de build — le site apparaît alors sans aucun style. Seul le contenu du dossier `dist/`, généré par `npm run build`, doit être servi.

## Déployer sur Cloudflare Pages (alternative)

Depuis GitHub : Workers & Pages > Create > Pages > Connect to Git.

- Build command : `npm run build`
- Build output directory : `dist`
- Variable : `NODE_VERSION` = `20`

En ligne de commande : `npm run deploy`.

## Ajouter du contenu

- Vidéo du début : déposer le fichier dans `src/assets/video/`, puis renseigner son chemin dans `src/data/assets.js` (`video.beginning`).
- Piste audio : même principe avec `audio.track.src`. Rien ne se lance sans action du joueur.
- Nouvel objet interactif : ajouter un modèle dans `src/scenes/props.js` (`builders`), puis une entrée dans `src/data/interactions.js`.
- Nouvel objet de collection : `src/data/items.js`.
- Actions disponibles dans `steps` : `say`, `sfx`, `wait`, `phone`, `collect`, `flag`, `event`.
- Une entrée avec `requires: 'nomDuFlag'` n'est utilisable qu'après ce flag.
- Reprendre à zéro : menu pause > Recommencer.
