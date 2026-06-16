# Projet ASG-2026 : Pipeline d'Assemblage "De Novo" - TODO List

Ce guide décompose le cahier des charges en petites tâches simples à coder "à main nue", étape par étape.

## Lot 1 : Module d'Ingestion et de Qualité (Traitement des données brutes)

### Étape 1.1 : Parser un fichier FASTQ vers FASTA
- [ ] Créer une fonction `lire_fastq(chemin_fichier)` qui ouvre un fichier FASTQ et lit le contenu ligne par ligne.
- [ ] Extraire uniquement les identifiants de séquence (lignes commençant par `@`) et les séquences d'ADN associées. (Ignorer les lignes `+` et les lignes de qualité).
- [ ] Créer une fonction `sauvegarder_fasta(sequences, chemin_fichier)` pour formater et écrire les séquences avec le format FASTA (ligne `>identifiant` suivie de la ligne de séquence).
- [ ] *Test* : Exécuter sur un mini-fichier de 10 reads pour vérifier visuellement le résultat.

### Étape 1.2 : Découpage en k-mers
- [ ] Créer une fonction `extraire_kmers(sequence, k)` qui prend une séquence et retourne une liste de tous ses k-mers successifs (sous-chaînes de longueur k).
- [ ] *Test* : L'appel `extraire_kmers("ATCGAT", 3)` doit retourner `["ATC", "TCG", "CGA", "GAT"]`.
- [ ] Créer une boucle/fonction pour appliquer ce découpage à toutes les séquences lues à l'étape 1.1.

### Étape 1.3 : Calcul des fréquences et Histogramme
- [ ] Créer une fonction `compter_frequences_kmers(liste_kmers)` qui utilise un dictionnaire (ex: un hash map) pour compter l'occurrence de chaque k-mer : `{ "kmer": frequence }`.
- [ ] Compter combien de k-mers apparaissent 1 fois, 2 fois, 3 fois, etc.
- [ ] Afficher un histogramme simple dans le terminal (ou sur une page web basique).
- [ ] *Objectif analytique* : Déterminer visuellement le seuil de fréquence à partir duquel on considère qu'un k-mer est "solide" (pas une erreur de lecture).

---

## Lot 2 : Module d'Alignement par Programmation Dynamique (Validation locale)

### Étape 2.1 : Algorithme de la Plus Longue Sous-Séquence Commune (LCS)
- [ ] Créer une fonction `initialiser_matrice(taille_seq1, taille_seq2)` qui crée une matrice 2D remplie de zéros.
- [ ] Implémenter le remplissage de la matrice avec les règles de programmation dynamique pour comparer `seq1` et `seq2`.
- [ ] Implémenter le retour sur la matrice (backtracking) pour extraire la sous-séquence exacte et la position du chevauchement.
- [ ] Créer une fonction `calculer_score(seq1, seq2)` qui retourne le score d'alignement final.

### Étape 2.2 : Interface et Visualisation
- [ ] Créer une fonction d'affichage en terminal (ou une petite page Web HTML/JS) : 
  - Entrées : 2 reads (copier-coller ou upload).
  - Sortie : Affichage superposé des deux séquences avec des barres `|` pour marquer les lettres identiques, illustrant le chevauchement.

---

## Lot 3 : Moteur d'Assemblage "Memory-Efficient" (Approche Minia 2)

### Étape 3.1 : Construction du Filtre de Bloom
- [ ] Créer la structure `FiltreBloom(taille_m, nb_hash_k)`.
- [ ] Initialiser un tableau de booléens (ou un bitset) de taille `m` (ex: 1 million de bits), initialisé à faux/0.
- [ ] Implémenter des fonctions de hachage simples. Astuce : on peut simuler `k` fonctions de hachage en utilisant une seule fonction native combinée avec un entier (seed) allant de 1 à `k`.
- [ ] Implémenter la méthode `ajouter(element)` : calculer les `k` index, et mettre les cases correspondantes du tableau à Vrai/1.
- [ ] Implémenter la méthode `tester(element)` : calculer les `k` index. Si *toutes* ces cases valent Vrai, retourner Vrai. Sinon, retourner Faux.

### Étape 3.2 : Insertion de l'Oracle
- [ ] Filtrer le dictionnaire de k-mers de l'étape 1.3 : ne conserver que les k-mers ayant une fréquence supérieure au seuil (les k-mers solides).
- [ ] Insérer tous ces k-mers solides dans le `FiltreBloom`.
- [ ] *Test* : S'assurer que le filtre répond "Vrai" pour les k-mers insérés.

### Étape 3.3 : Traversée "On-the-fly" du graphe (sans construire le graphe en mémoire)
- [ ] Créer une fonction `obtenir_extensions_possibles(kmer)` : prendre le k-mer, enlever la première lettre, et créer 4 nouvelles sous-chaînes en rajoutant 'A', 'C', 'G', et 'T' à la fin.
- [ ] Implémenter la boucle principale `assembler_contig(kmer_seed, filtre)` :
  - Initialiser le `contig` (une liste ou chaîne) avec le `kmer_seed`.
  - Prendre les (k-1) dernières lettres du `contig`.
  - Générer les 4 extensions possibles en 3'.
  - Interroger le `FiltreBloom` pour chacune des 4 extensions.
  - **Cas 1** : Exactement 1 test positif -> ajouter la lettre au contig, et recommencer la boucle.
  - **Cas 2** : 0 test positif (impasse) -> arrêter ce contig.
  - **Cas 3** : > 1 tests positifs (bifurcation) -> marquer un point d'arrêt/embranchement, arrêter ce contig.

---

## Tests de Validation et Livrables

- [ ] **Validation "Toy Dataset"** : Lancer le pipeline complet sur le petit jeu de données fourni pour vérifier que le code fonctionne de bout en bout.
- [ ] **Validation 10 000 Reads (Recette)** : Faire tourner le programme sur les 10 000 reads et vérifier que la séquence obtenue a plus de 98% de similarité avec la cible.
- [ ] **Rapport - Consommation Mémoire** : Calculer et comparer la taille mémoire du Filtre de Bloom (tableau de bits) par rapport au stockage du graphe complet dans un dictionnaire.
- [ ] **Rapport - Faux Positifs** : Expliquer ce qui se passe quand le filtre de Bloom fait une erreur (croit qu'un k-mer existe alors que non) lors de la "Traversée On-the-fly".
- [ ] **Analyse de Complexité** : Écrire un court paragraphe démontrant mathématiquement pourquoi comparer chaque read avec tous les autres ($O(n^2)$) est impossible à grande échelle.
