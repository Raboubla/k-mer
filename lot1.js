const fs = require('fs');

/**
 * Lit un fichier FASTQ et en extrait uniquement les séquences d'ADN.
 * @param {string} filePath - Chemin absolu ou relatif vers le fichier FASTQ.
 * @returns {string[]} Liste contenant toutes les séquences trouvées.
 */
function parseFastq(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split(/\r?\n/);
    const sequences = [];
    
    // Dans un fichier FASTQ standard, les données d'un "read" tiennent sur 4 lignes :
    // Ligne 1 : Identifiant (commence par @)
    // Ligne 2 : Séquence d'ADN
    // Ligne 3 : Séparateur (commence par +)
    // Ligne 4 : Qualité
    // On extrait donc la ligne 2, puis la ligne 6, 10, etc.
    for (let i = 1; i < lines.length; i += 4) {
        const seq = lines[i].trim();
        if (seq) {
            sequences.push(seq);
        }
    }
    
    return sequences;
}

/**
 * Découpe une liste de séquences en "k-mers" (sous-chaînes de longueur k) 
 * et compte combien de fois chaque k-mer apparaît (fréquence).
 * @param {string[]} sequences - Liste des séquences d'ADN brutes.
 * @param {number} k - La taille des k-mers à extraire.
 * @returns {Object} Un dictionnaire liant chaque k-mer à son nombre d'occurrences { "kmer": count }.
 */
function getKmersFrequencies(sequences, k) {
    const frequencies = {};
    
    // On parcourt chaque read (séquence)
    for (const seq of sequences) {
        // On fait glisser une fenêtre de taille k sur la séquence
        for (let i = 0; i <= seq.length - k; i++) {
            const kmer = seq.substring(i, i + k);
            
            // Si le kmer existe déjà dans le dico, on incrémente, sinon on le crée à 1
            if (frequencies[kmer]) {
                frequencies[kmer]++;
            } else {
                frequencies[kmer] = 1;
            }
        }
    }
    
    return frequencies;
}

module.exports = { parseFastq, getKmersFrequencies };
