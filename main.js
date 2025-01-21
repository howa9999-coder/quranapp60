
//==========================================================================Get suwar function
function getSurah() {
    axios.get(`https://mp3quran.net/api/v3/suwar`)
        .then(function (response) {
            const main = document.querySelector('main');
            main.innerHTML = '';
            const suwar = response.data.suwar;

            // Get the last 28 surahs
            const surah = suwar.slice(-28).reverse();

            surah.forEach((surah) => {

                main.innerHTML += `
                    <div class="content">
                        <h3 onclick="speakText(this)" >  ${surah.name}</h3>
                        <div class="icons">
                            <button class="icon quran" data="${surah.id}"><i class="fa-solid fa-volume-high"></i></button>
                            <button class="icon tafssir" data="${surah.id}"><i class="fa-regular fa-lightbulb"></i></button>
                        </div>
                    </div>
                `;
            });
            const quranBtns = document.querySelectorAll('.quran')
            const tafssirBtns = document.querySelectorAll('.tafssir')
            eventQuran( quranBtns, tafssirBtns, 'active-quran', 'active-tafssir'  )
            eventTafssir(tafssirBtns, quranBtns, 'active-tafssir', 'active-quran' )
        })
        .catch(function (error) {
            console.error('Error fetching surah data:', error);
        });
}
//==========================================================================Quran audio
function eventQuran(firstObject, secondeObject, firstClass, secondeClass){
    firstObject.forEach(element=>{
        element.addEventListener('click', function(){
            secondeObject.forEach(element => element.classList.remove(secondeClass) )
            firstObject.forEach(element => element.classList.remove(firstClass));
            const surahId = this.getAttribute('data')
            this.classList.add(firstClass);
            getQuran(surahId)
            surahName(surahId)
            
        })
    })
}
//Tafssir audio
function eventTafssir(firstObject, secondeObject, firstClass, secondeClass ){
    firstObject.forEach(element=>{
        element.addEventListener('click', function(){
            secondeObject.forEach(element => element.classList.remove(secondeClass) )
            firstObject.forEach(element => element.classList.remove(firstClass));
            const surahId = this.getAttribute('data')
            this.classList.add(firstClass);
            getTafssir(surahId)
            surahName(surahId)
            
        })
    })
}

getSurah() 

//==========================================================================Refresh page
document.querySelector('h2').addEventListener('click', function(){
    getSurah()
})

//==========================================================================Get tafssir
function getTafssir(id) {
    axios.get(`https://www.mp3quran.net/api/v3/tafsir?sura=${id}`)
        .then(function (response) {
            // Access the data properly based on the API structure
            const tafsirUrl = response.data.tafasir.soar[id][0].url; // Ensure `tafasir` exists
            audioPlayer(tafsirUrl, "#audio-player")
        })
        .catch(function (error) {
            console.error("Error fetching tafsir:", error);
        });
}
//==========================================================================Get Quran
function getQuran(surahId){
    axios.get(`https://mp3quran.net/api/v3/reciters?reciter=118&rewaya=2`)
    .then(function (response) {
        const data = response.data.reciters[0].moshaf[0]
        const surahServer = data.server
        const padSurah = surahId.padStart(3, '0')
        const link = surahServer+padSurah+'.mp3'
        audioPlayer(link, "#audio-player")
})
.catch(function (error) {
    console.error('Error fetching surah link:', error);
});
}
//==========================================================================Get surah name
function surahName(id){
    axios.get(`https://www.mp3quran.net/api/v3/tafsir?sura=${id}`)
    .then(function (response) {
        const surahName = response.data.tafasir.soar[id][0].name; 
        const title = document.querySelector('h2')
        title.innerHTML = surahName
    })
    .catch(function (error) {
        console.error("Error fetching surah name:", error);
    });
}
//==========================================================================Audio player function
function audioPlayer(link, id){
    const audioPlayer = document.querySelector(`${id}`)
    audioPlayer.src = link
    audioPlayer.play()
}



//==========================================================================Audio search


    let surah;

document.querySelector('#click-to-search').addEventListener('click', function () {
    var speech = true;
    const button = document.querySelector('#click-to-search'); // Target the button element
    window.SpeechRecognition = window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.interimResults = true;

    // Add a class when recognition starts
    recognition.addEventListener('start', () => {
        button.classList.add('is-recording'); // Add the 'recording' class
    });

    // Remove the class when recognition stops
    recognition.addEventListener('end', () => {
        button.classList.remove('is-recording'); // Remove the 'recording' class
    });

    recognition.addEventListener('result', e => {
        const transcript = Array.from(e.results)
            .map(result => result[0])
            .map(result => result.transcript)
            .join('');
        surah = transcript.trim();
        searchResult(surah);
    });

    if (speech === true) {
        recognition.start();
    }
});

            function searchResult(word) {
                const main = document.querySelector('main');
                const loader = document.querySelector('.loader'); // Add a loader element in your HTML
                loader.style.display = 'block'; // Show the loader before making the API call
                main.innerHTML = '';
                
                axios.get(`https://mp3quran.net/api/v3/suwar`)
                    .then(function (response) {
                        loader.style.display = 'none'; // Hide the loader once the data is fetched
                        
                        const suwar = response.data.suwar;
                        const surahs = suwar.slice(-28); // Get the last 28 surahs
                        
                        let hasExactMatch = false;
                        let hasSimilarMatch = false;
            
                        // Check for exact match first
                        surahs.forEach((surah) => {
                            if (surah.name === word) {
                                main.innerHTML = `
                            <div class="content">
                                <h3 onclick="speakText(this)" >  ${surah.name}</h3>
                                <div class="icons">
                                    <button class="icon quran" data="${surah.id}"><i class="fa-solid fa-volume-high"></i></button>
                                    <button class="icon tafssir" data="${surah.id}"><i class="fa-regular fa-lightbulb"></i></button>
                                </div>
                            </div>
                                `;
                                hasExactMatch = true;
                            }
                        });
            
                        // If no exact match, check for similar results
                        if (!hasExactMatch) {
                            surahs.forEach((surah) => {
                                const similarity = calculateSimilarity(surah.name, word);
                                if (similarity > 0.7) {
                                    main.innerHTML = `
                                <div class="content">
                                    <h3 onclick="speakText(this)" >  ${surah.name}</h3>
                                    <div class="icons">
                                        <button class="icon quran" data="${surah.id}"><i class="fa-solid fa-volume-high"></i></button>
                                        <button class="icon tafssir" data="${surah.id}"><i class="fa-regular fa-lightbulb"></i></button>
                                    </div>
                                </div>
                                    `;
                                    hasSimilarMatch = true;
                                }
                            });
                        }
            
                        // If no results at all
                        if (!hasExactMatch && !hasSimilarMatch) {
                            main.innerHTML = `<p style="text-align: center; font-size: 1.2em; color: red;">لا توجد نتائج، يرجى المحاولة مرة أخرى</p>`;
                        }
            
                        // Attach event listeners
                        const quranBtns = document.querySelectorAll('.quran');
                        const tafssirBtns = document.querySelectorAll('.tafssir');
                        eventQuran(quranBtns, tafssirBtns, 'active-quran', 'active-tafssir');
                        eventTafssir(tafssirBtns, quranBtns, 'active-tafssir', 'active-quran');
                    })
                    .catch(function (error) {
                        loader.style.display = 'none'; // Hide the loader in case of an error
                        console.error('Error fetching surah data:', error);
                        main.innerHTML = `<p style="text-align: center; font-size: 1.2em; color: red;">حدث خطأ أثناء تحميل البيانات، يرجى المحاولة لاحقًا</p>`;
                    });
            }
            
    
    // Calculate similarity using Levenshtein Distance
    function calculateSimilarity(str1, str2) {
        const len1 = str1.length;
        const len2 = str2.length;
    
        const dp = Array.from({ length: len1 + 1 }, () => Array(len2 + 1).fill(0));
    
        for (let i = 0; i <= len1; i++) dp[i][0] = i;
        for (let j = 0; j <= len2; j++) dp[0][j] = j;
    
        for (let i = 1; i <= len1; i++) {
            for (let j = 1; j <= len2; j++) {
                if (str1[i - 1] === str2[j - 1]) {
                    dp[i][j] = dp[i - 1][j - 1];
                } else {
                    dp[i][j] = Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]) + 1;
                }
            }
        }
    
        const distance = dp[len1][len2];
        return 1 - distance / Math.max(len1, len2); // Similarity score between 0 and 1
    }


//Switch text to voice
function speakText(element) {
    // Get the text content of the clicked element
    const text = element.textContent;

    // Create a new speech synthesis utterance
    const utterance = new SpeechSynthesisUtterance(text);

    // Set the language to Arabic
    utterance.lang = 'ar-SA'; // Standard Arabic (Saudi Arabia)

    // Ensure voices are loaded (some browsers need this step)
    speechSynthesis.onvoiceschanged = () => {
      const voices = speechSynthesis.getVoices();
      const arabicVoice = voices.find(voice => voice.lang.startsWith('ar')) || voices[0];
      utterance.voice = arabicVoice;
      window.speechSynthesis.speak(utterance);
    };

    // Speak the text
    window.speechSynthesis.speak(utterance);
  }

  // Ensure the first interaction with the page allows speech synthesis
  document.addEventListener('touchstart', () => {
    if (!speechSynthesis.speaking) {
      const testUtterance = new SpeechSynthesisUtterance('');
      window.speechSynthesis.speak(testUtterance);
    }
  }, { once: true });



