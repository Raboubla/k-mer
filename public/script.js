document.addEventListener('DOMContentLoaded', () => {
    // ---------------------------------------------------------
    // Logique des Onglets (Tabs)
    // ---------------------------------------------------------
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Retirer l'état actif partout
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            // Activer l'onglet cliqué
            btn.classList.add('active');
            const targetId = btn.getAttribute('data-tab');
            document.getElementById(targetId).classList.add('active');
        });
    });

    // ---------------------------------------------------------
    // Lot 1 : Soumission du formulaire d'Ingestion
    // ---------------------------------------------------------
    document.getElementById('form-lot1').addEventListener('submit', async (e) => {
        e.preventDefault();
        const resultBox = document.getElementById('result-lot1');
        resultBox.innerHTML = '<p class="placeholder-text">Analyse en cours (Mock)...</p>';

        const fileInput = document.getElementById('fastq');
        const kSize = document.getElementById('k-size').value;

        if (fileInput.files.length === 0) {
            resultBox.innerHTML = '<p style="color: red;">Veuillez sélectionner un fichier.</p>';
            return;
        }

        const formData = new FormData();
        formData.append('fastqFile', fileInput.files[0]);
        formData.append('k', kSize);

        try {
            const response = await fetch('/api/lot1/process', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            // Affichage formaté JSON
            resultBox.innerHTML = `<strong>Réponse du Serveur :</strong>\n\n${JSON.stringify(data, null, 2)}`;
        } catch (error) {
            resultBox.innerHTML = `<p style="color: red;">Erreur de connexion : ${error.message}</p>`;
        }
    });

    // ---------------------------------------------------------
    // Lot 2 : Soumission du formulaire d'Alignement
    // ---------------------------------------------------------
    document.getElementById('form-lot2').addEventListener('submit', async (e) => {
        e.preventDefault();
        const resultBox = document.getElementById('result-lot2');
        resultBox.innerHTML = '<p class="placeholder-text">Alignement en cours (Mock)...</p>';

        const seq1 = document.getElementById('seq1').value;
        const seq2 = document.getElementById('seq2').value;

        try {
            const response = await fetch('/api/lot2/align', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ seq1, seq2 })
            });
            const data = await response.json();
            resultBox.innerHTML = `<strong>Réponse du Serveur :</strong>\n\n${JSON.stringify(data, null, 2)}`;
        } catch (error) {
            resultBox.innerHTML = `<p style="color: red;">Erreur de connexion : ${error.message}</p>`;
        }
    });

    // ---------------------------------------------------------
    // Lot 3 : Soumission du formulaire d'Assemblage
    // ---------------------------------------------------------
    document.getElementById('form-lot3').addEventListener('submit', async (e) => {
        e.preventDefault();
        const resultBox = document.getElementById('result-lot3');
        resultBox.innerHTML = '<p class="placeholder-text">Assemblage Minia 2 en cours (Mock)...</p>';

        try {
            const response = await fetch('/api/lot3/assemble', {
                method: 'POST'
            });
            const data = await response.json();
            resultBox.innerHTML = `<strong>Réponse du Serveur :</strong>\n\n${JSON.stringify(data, null, 2)}`;
        } catch (error) {
            resultBox.innerHTML = `<p style="color: red;">Erreur de connexion : ${error.message}</p>`;
        }
    });
});
