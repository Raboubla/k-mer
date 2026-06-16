/**
 * Structure de données probabiliste "Filtre de Bloom" 
 * Permet de tester l'appartenance d'un élément (k-mer) en mémoire constante.
 */
class BloomFilter {
    /**
     * @param {number} size - Taille du tableau de bits (m).
     * @param {number} numHashes - Nombre de fonctions de hachage à utiliser (k).
     */
    constructor(size, numHashes) {
        this.size = size;
        this.numHashes = numHashes;
        // Le bitset est représenté par un simple tableau de booléens initialisés à faux
        this.bitArray = new Array(size).fill(false);
    }
    
    /**
     * Fonction de hachage interne basée sur l'algorithme djb2.
     * On utilise le "seed" pour simuler différentes fonctions de hachage distinctes.
     */
    _hash(str, seed) {
        let hash = 5381;
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) + hash) + str.charCodeAt(i) + seed;
        }
        return Math.abs(hash) % this.size;
    }

    /**
     * Insère un élément dans le filtre en passant à Vrai les bits correspondants.
     */
    add(element) {
        for (let i = 0; i < this.numHashes; i++) {
            const index = this._hash(element, i);
            this.bitArray[index] = true;
        }
    }

    /**
     * Teste si un élément pourrait être dans le filtre.
     * @returns {boolean} Vrai = Peut-être là (Faux positif possible). Faux = Certainement absent.
     */
    test(element) {
        for (let i = 0; i < this.numHashes; i++) {
            const index = this._hash(element, i);
            // Si un seul des index est faux, l'élément n'a jamais été inséré.
            if (!this.bitArray[index]) return false;
        }
        return true; 
    }
}

/**
 * Moteur d'assemblage "Minia 2" utilisant la traversée de graphe on-the-fly.
 * 
 * @param {Object} frequencies - Dictionnaire des fréquences de l'étape 1.
 * @param {number} k - Taille du k-mer.
 * @param {number} threshold - Fréquence minimale pour qu'un k-mer soit jugé "solide".
 * @returns {string[]} Liste des séquences assemblées (Contigs).
 */
function assembleMinia(frequencies, k, threshold) {
    // 1. Configurer le filtre (10 000 bits pour le TP, 3 fonctions de hash)
    const bloom = new BloomFilter(10000, 3);
    const solidKmers = [];
    
    // 2. Oracle : Ne garder que les k-mers "solides" et les insérer dans le filtre
    for (const [kmer, count] of Object.entries(frequencies)) {
        if (count >= threshold) {
            bloom.add(kmer);
            solidKmers.push(kmer);
        }
    }
    
    // S'il n'y a pas de k-mers solides, on abandonne
    if (solidKmers.length === 0) return ["Aucun k-mer ne dépasse le seuil."];

    // 3. Traversée "On-the-fly" du graphe de de Bruijn implicite
    // On démarre l'assemblage avec un k-mer graine (seed)
    let currentContig = solidKmers[0]; 
    const bases = ['A', 'C', 'G', 'T']; // Extensions possibles
    let canExtend = true;
    
    // On étend vers la droite (3') tant qu'il y a un chemin unique non ambigu
    while (canExtend && currentContig.length < 1000) { 
        canExtend = false;
        
        // Extraire les (k-1) dernières bases du contig
        const suffix = currentContig.substring(currentContig.length - (k - 1));
        
        // Tester les 4 extensions possibles dans le filtre de Bloom
        let validExtensions = [];
        for (const base of bases) {
            const possibleNextKmer = suffix + base;
            if (bloom.test(possibleNextKmer)) {
                validExtensions.push(base); // Test réussi
            }
        }
        
        // Logique de bifurcation :
        // - Exactement 1 : On ajoute la base et on continue
        // - 0 : Impasse, la séquence s'arrête là
        // - > 1 : Bifurcation, ambigüité qu'on ne résout pas dans ce TP (on s'arrête)
        if (validExtensions.length === 1) {
            currentContig += validExtensions[0];
            canExtend = true;
        }
    }
    
    return [currentContig];
}

module.exports = { BloomFilter, assembleMinia };
