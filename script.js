document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('complexionQuizForm');
    const resultContainer = document.getElementById('resultContainer');
    const finalResultDiv = document.getElementById('finalResult');
    const resultDescriptionDiv = document.getElementById('resultDescription');
    const resultWhyDiv = document.getElementById('resultWhy');
    const resultProductsDiv = document.getElementById('resultProducts');
    const resultTipsDiv = document.getElementById('resultTips');

    // --- 1. Definisi Poin (Mapping Logic) ---
    // Struktur: {Q_ID: {Jawaban: [Poin A (Matte), Poin B (Satin), Poin C (Glowing)]}}
    const scoringMap = {
        'A1': {
            'Berminyak': [3, 0, 0],
            'Kering': [0, 0, 3],
            'Kombinasi': [1, 1, 0],
            'Normal': [0, 2, 0]
        },
        'A2': {
            'Halus': [0, 1, 0],
            'Sedikit bertekstur': [1, 0, 0],
            'Pori-pori besar': [2, 0, 0],
            'Mudah kusam': [0, 0, 2]
        },
        'B3': {
            'Fresh & glowing': [0, 0, 2],
            'Natural': [0, 2, 0],
            'Tahan lama & bebas minyak': [2, 0, 0]
        },
        'B4': {
            'Matte': [2, 0, 0],
            'Satin': [0, 2, 0],
            'Dewy': [0, 0, 2]
        },
        'C5': {
            'Luar ruangan': [2, 1, 0],
            'Dalam ruangan': [0, 1, 2],
            'Campuran keduanya': [0, 2, 0]
        },
        'C6': {
            'Jarang': [0, 1, 2],
            'Kadang': [1, 2, 0],
            'Sering': [2, 0, 0]
        },
        'D7': {
            'Cerah & radiant': [0, 0, 2],
            'Natural': [0, 2, 0],
            'Sangat halus & tahan lama': [2, 0, 0]
        },
        'D8': {
            'Sangat penting': [3, 0, 0],
            'Biasa saja': [0, 2, 0],
            'Tidak terlalu penting': [0, 0, 3]
        }
    };

    // --- Definisi Konten Hasil ---
    const resultsContent = {
        'Matte (A)': {
            title: '⭐ A. Matte Finish – Smooth, Shine-Free Perfection',
            description: 'Matte finish memberikan tampilan bebas kilap, halus, dan tahan lama. Cocok untuk kulit berminyak atau pengguna yang banyak beraktivitas di luar ruangan. Makeup tetap stabil sepanjang hari dan tidak mudah luntur.',
            why: '<ul>' +
                 '<li>Kulit berminyak atau kombinasi cenderung oily</li>' +
                 '<li>Aktivitas padat di luar ruangan</li>' +
                 '<li>Tidak suka tampilan wajah berkilau</li>' +
                 '<li>Ingin makeup yang tetap rapi lama</li>' +
                 '</ul>',
            products: '<ul>' +
                      '<li>Oil-control primer</li>' +
                      '<li>Foundation matte</li>' +
                      '<li>Loose setting powder</li>' +
                      '<li>Matte setting spray</li>' +
                      '</ul>',
            tips: '<ul>' +
                  '<li>Gunakan skincare ringan</li>' +
                  '<li>Fokuskan bedak di T-zone</li>' +
                  '<li>Hindari produk oily</li>' +
                  '<li>Bawa blotting paper untuk touch-up</li>' +
                  '</ul>'
        },
        'Satin (B)': {
            title: '⭐ B. Satin Finish – Balanced, Natural, and Soft',
            description: 'Satin adalah finish paling natural dan seimbang. Tidak terlalu matte, tidak terlalu glowing. Kulit terlihat lembut, natural, seperti kulit asli tapi lebih halus. Ideal untuk pemakaian sehari-hari.',
            why: '<ul>' +
                 '<li>Kulit normal atau kombinasi ringan</li>' +
                 '<li>Suka tampilan natural dan lembut</li>' +
                 '<li>Aktivitas campuran indoor–outdoor</li>' +
                 '<li>Tidak suka terlalu matte atau terlalu glowing</li>' +
                 '</ul>',
            products: '<ul>' +
                      '<li>Semi-matte foundation</li>' +
                      '<li>Hydrating primer</li>' +
                      '<li>Bedak tipis</li>' +
                      '<li>Natural-finish setting spray</li>' +
                      '</ul>',
            tips: '<ul>' +
                  '<li>Jaga hidrasi kulit</li>' +
                  '<li>Gunakan bedak dengan lembut</li>' +
                  '<li>Ratakan foundation pakai spons basah</li>' +
                  '<li>Pilih highlighter soft glow</li>' +
                  '</ul>'
        },
        'Glowing (C)': {
            title: '⭐ C. Glowing/Dewy Finish – Radiant, Fresh, Healthy Skin',
            description: 'Glowing finish memberi tampilan bercahaya, segar, dan youthful. Cocok untuk kulit kering, kusam, atau yang ingin efek juicy & radiant ala makeup Korea. Memberikan kesan kulit sehat dan terhidrasi.',
            why: '<ul>' +
                 '<li>Kulit cenderung kering</li>' +
                 '<li>Sering merasa wajah kusam</li>' +
                 '<li>Suka tampilan fresh dan radiant</li>' +
                 '<li>Aktivitas lebih banyak indoor</li>' +
                 '</ul>',
            products: '<ul>' +
                      '<li>Hydrating/moisturizing primer</li>' +
                      '<li>Dewy foundation atau tinted moisturizer</li>' +
                      '<li>Cream blush & liquid highlighter</li>' +
                      '<li>Hydrating setting spray</li>' +
                      '</ul>',
            tips: '<ul>' +
                  '<li>Pastikan hidrasi kulit optimal</li>' +
                  '<li>Gunakan highlighter cair di area tertentu</li>' +
                  '<li>Hindari terlalu banyak bedak</li>' +
                  '<li>Pilih skincare berbahan hyaluronic acid</li>' +
                  '</ul>'
        }
    };

    form.addEventListener('submit', (event) => {
        event.preventDefault(); // Mencegah halaman reload

        const answers = {};
        const formData = new FormData(form);

        // Ambil semua jawaban dari form
        for (let [name, value] of formData.entries()) {
            answers[name] = value;
        }

        // --- Validasi (Opsional, tapi disarankan) ---
        // Pastikan semua pertanyaan telah dijawab
        const questionIds = ['A1', 'A2', 'B3', 'B4', 'C5', 'C6', 'D7', 'D8'];
        let allAnswered = true;
        for (const qId of questionIds) {
            if (!answers[qId]) {
                allAnswered = false;
                alert('Mohon jawab semua pertanyaan sebelum melihat hasil!');
                break;
            }
        }

        if (!allAnswered) {
            return; // Hentikan proses jika ada pertanyaan yang belum dijawab
        }


        // --- 2. Penghitungan Total Poin ---
        let totalA = 0; // Matte
        let totalB = 0; // Satin
        let totalC = 0; // Glowing/Dewy

        for (const qId in answers) {
            const answer = answers[qId];
            if (scoringMap[qId] && scoringMap[qId][answer]) {
                const points = scoringMap[qId][answer];
                totalA += points[0];
                totalB += points[1];
                totalC += points[2];
            }
        }

        const totals = {
            'Matte (A)': totalA,
            'Satin (B)': totalB,
            'Glowing (C)': totalC
        };

        const maxScore = Math.max(totalA, totalB, totalC);
        const maxCategories = Object.keys(totals).filter(key => totals[key] === maxScore);

        // --- 3. Penentuan Hasil Akhir (Logika Tie Breaker) ---
        let finalResultKey = maxCategories[0]; // Ambil hasil sementara

        if (maxCategories.length > 1) {
            const isATied = maxCategories.includes('Matte (A)');
            const isBTied = maxCategories.includes('Satin (B)');
            const isCTied = maxCategories.includes('Glowing (C)');

            // Priority 1: Matte (Fokus pada kontrol minyak)
            if (isATied) {
                if (answers['A1'] === 'Berminyak' || answers['D8'] === 'Sangat penting') {
                    finalResultKey = 'Matte (A)';
                }
            }
            
            // Priority 3: Glowing (Fokus pada hidrasi/kulit kering)
            // Cek jika hasil belum dialihkan ke Matte oleh prioritas 1
            if (finalResultKey === maxCategories[0] && isCTied) {
                if (answers['A1'] === 'Kering' || answers['D8'] === 'Tidak terlalu penting') {
                    finalResultKey = 'Glowing (C)';
                }
            }

            // Priority 2: Satin (Jika tie breaker ekstrem gagal, atau Satin terlibat)
            // Jika hasil masih di salah satu kategori yang seri, dan Satin terlibat
            if (maxCategories.includes(finalResultKey)) { // Cek jika hasil belum dipindahkan oleh prioritas di atas
                if (isBTied) {
                    finalResultKey = 'Satin (B)';
                } else if (isATied && isCTied) {
                    // Jika A dan C seri tanpa penentu kuat (A1/D8), default ke penengah (Satin)
                    finalResultKey = 'Satin (B)';
                }
            }
        }

        // --- Tampilkan Hasil ---
        const resultData = resultsContent[finalResultKey];
        if (resultData) {
            finalResultDiv.textContent = resultData.title;
            resultDescriptionDiv.innerHTML = `<h3>Deskripsi:</h3><p>${resultData.description}</p>`;
            resultWhyDiv.innerHTML = `<h3>Kenapa cocok:</h3>${resultData.why}`;
            resultProductsDiv.innerHTML = `<h3>Rekomendasi produk:</h3>${resultData.products}`;
            resultTipsDiv.innerHTML = `<h3>Tips:</h3>${resultData.tips}`;

            resultContainer.style.display = 'block'; // Tampilkan container hasil
            resultContainer.scrollIntoView({ behavior: 'smooth' }); // Gulir ke hasil
        } else {
            console.error('Hasil tidak ditemukan untuk kunci:', finalResultKey);
            alert('Terjadi kesalahan dalam menentukan hasil. Silakan coba lagi.');
        }
    });
});