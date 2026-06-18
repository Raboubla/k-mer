const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Importer les modules des TP (Lots 1, 2 et 3)
const lot1 = require('./lot1');
const lot2 = require('./lot2');
const lot3 = require('./lot3');

const app = express();
// sans .env
const PORT = 3000;

// Créer le dossier uploads s'il n'existe pas
const dir = './uploads';
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
}

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Configuration de Multer pour stocker les fichiers uploadés
const upload = multer({ dest: 'uploads/' });

// ==========================================
// API Endpoints - À compléter par l'étudiant
// ==========================================

// Lot 1 : Ingestion et de Qualité
app.post('/api/lot1/process', upload.single('fastqFile'), (req, res) => {
    const k = parseInt(req.body.k) || 3;

    try {
        if (!req.file) throw new Error("Aucun fichier fourni.");

        const filePath = req.file.path;

        // Appel aux fonctions du Lot 1
        const sequences = lot1.parseFastq(filePath);
        const frequencies = lot1.getKmersFrequencies(sequences, k);

        // Nettoyage : On pourrait supprimer le fichier après traitement (optionnel)
        // fs.unlinkSync(filePath);

        res.json({
            success: true,
            message: `Fichier analysé. ${sequences.length} séquences extraites.`,
            histogram: frequencies
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Lot 2 : Alignement par Programmation Dynamique
app.post('/api/lot2/align', (req, res) => {
    const { seq1, seq2 } = req.body;

    if (!seq1 || !seq2) {
        return res.status(400).json({ success: false, message: "Les deux séquences sont requises." });
    }

    try {
        // Appel à la fonction du Lot 2
        const result = lot2.calculateLCS(seq1.toUpperCase(), seq2.toUpperCase());

        res.json({
            success: true,
            message: "Alignement LCS effectué.",
            score: result.score,
            alignement: result.visual
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Lot 3 : Assemblage Minia 2
app.post('/api/lot3/assemble', (req, res) => {
    try {
        const frequencies = req.body.frequencies;
        const threshold = parseInt(req.body.threshold) || 2;
        
        if (!frequencies || Object.keys(frequencies).length === 0) {
            return res.status(400).json({ success: false, message: "L'histogramme des fréquences est manquant ou vide." });
        }
        
        // Déduire k de la taille du premier k-mer
        const firstKmer = Object.keys(frequencies)[0];
        const k = firstKmer ? firstKmer.length : 3;
        
        // Appel à la fonction d'assemblage du Lot 3
        const contigs = lot3.assembleMinia(frequencies, k, threshold);
        
        res.json({
            success: true,
            message: "Assemblage Minia 2 terminé.",
            contigs: contigs
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`\n🚀 Serveur démarré sur http://localhost:${PORT}`);
    console.log(`Sokafy ao amin'ny navigateur lesy a !`);
});
