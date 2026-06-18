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
    
    let state = 0; // 0: ID, 1: Séquence, 2: Séparateur (+), 3: Qualité

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Ignorer les lignes vides accidentelles
        if (line === '') continue; 
        
        if (state === 0 && line.startsWith('@')) {
            state = 1; // On a trouvé l'identifiant, on attend la séquence
        } else if (state === 1) {
            sequences.push(line); // On sauvegarde la séquence
            state = 2; // On attend le '+'
        } else if (state === 2 && line.startsWith('+')) {
            state = 3; // On a trouvé le '+', on attend la ligne de qualité
        } else if (state === 3) {
            state = 0; // On a lu la qualité, on repart à zéro pour le read suivant
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
