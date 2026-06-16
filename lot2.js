/**
 * Implémente l'algorithme de Plus Longue Sous-Séquence Commune (LCS - Longest Common Subsequence)
 * via la Programmation Dynamique pour trouver les chevauchements entre reads.
 * 
 * @param {string} seq1 - Première séquence d'ADN.
 * @param {string} seq2 - Deuxième séquence d'ADN.
 * @returns {Object} Objet contenant le score (longueur de l'alignement) et une visualisation.
 */
function calculateLCS(seq1, seq2) {
    const m = seq1.length;
    const n = seq2.length;
    
    // 1. Initialisation de la matrice (m+1 x n+1) remplie de zéros
    // On ajoute +1 pour gérer les cas de base (chaînes vides)
    const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
    
    // 2. Remplissage de la matrice selon la formule de récurrence
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            // Si les deux caractères correspondent, on ajoute 1 au résultat diagonal
            if (seq1[i - 1] === seq2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1] + 1;
            } 
            // Sinon on prend le maximum entre la case du haut ou la case de gauche
            else {
                dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
    }
    
    // 3. Backtracking (Chemin de retour) pour retrouver la sous-séquence
    let i = m, j = n;
    let lcsReversed = []; // On reconstruit la chaîne en partant de la fin
    
    while (i > 0 && j > 0) {
        // Si les caractères sont égaux, ils font partie du LCS
        if (seq1[i - 1] === seq2[j - 1]) {
            lcsReversed.push(seq1[i - 1]);
            i--;
            j--;
        } 
        // Sinon, on remonte vers la case qui nous a donné le max
        else if (dp[i - 1][j] > dp[i][j - 1]) {
            i--;
        } else {
            j--;
        }
    }
    
    // Inverser pour l'avoir dans le bon ordre
    const subsequence = lcsReversed.reverse().join('');
    
    // 4. Générer une représentation visuelle textuelle basique
    const visual = `Score d'alignement LCS : ${dp[m][n]}
Séquence 1 (Read 1)   : ${seq1}
Séquence 2 (Read 2)   : ${seq2}
Sous-séquence Commune : ${subsequence}`;

    return {
        score: dp[m][n],
        subsequence: subsequence,
        visual: visual
    };
}

module.exports = { calculateLCS };
