const sampleText = `The ability to type quickly and accurately is an essential skill in today's digital world. As technology continues to evolve, keyboards remain our primary interface with computers and devices. Learning to type efficiently can save countless hours and reduce the strain on your hands and wrists. Professional typists often develop a rhythm and flow that makes typing feel as natural as speaking. The best way to improve is through regular practice and proper technique. Focus on accuracy first, and speed will naturally follow as you become more comfortable with the keyboard layout. Many people find that their typing speed plateaus after reaching a certain level. Breaking through this plateau requires conscious effort to identify and eliminate bad habits. Pay attention to your posture and hand position while typing. Keep your wrists elevated and your fingers curved naturally over the home row keys. Your hands should move as little as possible, with each finger responsible for specific keys. Common typing mistakes include looking at the keyboard too often and using improper finger placement. Advanced typists can often achieve speeds of over hundred words per minute while maintaining high accuracy. The key to reaching such speeds is developing muscle memory through consistent practice. Typing tests are an excellent way to measure your progress and identify areas for improvement. They provide immediate feedback on both speed and accuracy. Remember that typing is not just about raw speed, but also about maintaining consistency and preventing errors. The most efficient typists are those who can maintain a steady pace while making very few mistakes. This requires a delicate balance of speed and control.`;

    let timeLeft = 30;
    let timerInterval = null;
    let startTime = null;
    let isFinished = false;
    let wpmHistory = [];
    let chart = null;

    const textDisplay = document.querySelector('.text-display');
    const hiddenInput = document.querySelector('.hidden-input');
    const timerDisplay = document.querySelector('.timer');
    const analyticsDiv = document.querySelector('.analytics');
    const resetButton = document.querySelector('.reset-button');

    // Modified createChart function with fixed dimensions
    function createChart() {
      const ctx = document.getElementById('wpmChart').getContext('2d');
      return new Chart(ctx, {
        type: 'line',
        data: {
          labels: wpmHistory.map(point => point.time),
          datasets: [{
            label: 'WPM',
            data: wpmHistory.map(point => point.wpm),
            borderColor: '#ffd700',
            tension: 0.4,
            borderWidth: 2,
            pointRadius: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: '#333'
              },
              ticks: {
                color: '#666'
              }
            },
            x: {
              grid: {
                color: '#333'
              },
              ticks: {
                color: '#666',
                maxTicksLimit: 10
              }
            }
          },
          plugins: {
            legend: {
              display: false
            }
          },
          animation: {
            duration: 0
          }
        }
      });
    }

    // Rest of the JavaScript remains the same
    function initializeText() {
      textDisplay.innerHTML = '';
      sampleText.split('').forEach((char, index) => {
        const span = document.createElement('span');
        span.textContent = char;
        span.className = 'character' + (index === 0 ? ' current' : '');
        textDisplay.appendChild(span);
      });
    }

    function startTimer() {
      if (!startTime) {
        startTime = Date.now();
        timerInterval = setInterval(() => {
          timeLeft--;
          timerDisplay.textContent = timeLeft + 's';
          
          const elapsedMinutes = (30 - timeLeft) / 60;
          const wordsTyped = hiddenInput.value.length / 5;
          const currentWpm = Math.round(wordsTyped / elapsedMinutes);
          wpmHistory.push({time: 30 - timeLeft, wpm: currentWpm});

          if (timeLeft <= 0) {
            endTest();
          }
        }, 1000);
      }
    }

    function calculateStats() {
      const elapsedMinutes = 0.5;
      const wordsTyped = hiddenInput.value.length / 5;
      const finalWpm = Math.round(wordsTyped / elapsedMinutes);
      
      const correctChars = [...hiddenInput.value].filter((char, i) => char === sampleText[i]).length;
      const accuracy = Math.round((correctChars / hiddenInput.value.length) * 100);

      const wpmValues = wpmHistory.map(point => point.wpm);
      const avgWpm = wpmValues.reduce((a, b) => a + b, 0) / wpmValues.length;
      const variance = wpmValues.reduce((acc, val) => acc + Math.pow(val - avgWpm, 2), 0) / wpmValues.length;
      const consistency = Math.max(0, 100 - (Math.sqrt(variance) / avgWpm) * 100);

      return {
        wpm: finalWpm,
        accuracy,
        raw: finalWpm,
        consistency: Math.round(consistency)
      };
    }

    function endTest() {
      clearInterval(timerInterval);
      isFinished = true;
      hiddenInput.disabled = true;

      const stats = calculateStats();
      
      document.getElementById('wpm-value').textContent = stats.wpm;
      document.getElementById('accuracy-value').textContent = stats.accuracy + '%';
      document.getElementById('raw-value').textContent = stats.raw;
      document.getElementById('consistency-value').textContent = stats.consistency + '%';

      textDisplay.style.display = 'none';
      analyticsDiv.classList.add('show');
      resetButton.style.display = 'block';
      
      if (chart) {
        chart.destroy();
      }
      chart = createChart();
    }

    function resetTest() {
      timeLeft = 30;
      startTime = null;
      isFinished = false;
      wpmHistory = [];
      
      timerDisplay.textContent = '30s';
      hiddenInput.value = '';
      hiddenInput.disabled = false;
      
      textDisplay.style.display = 'block';
      analyticsDiv.classList.remove('show');
      resetButton.style.display = 'none';
      
      initializeText();
      hiddenInput.focus();
    }

    hiddenInput.addEventListener('input', e => {
      if (!startTime && !isFinished) {
        startTimer();
      }

      const value = e.target.value;
      const characters = textDisplay.getElementsByClassName('character');

      const currentChar = textDisplay.querySelector('.character.current');
      if (currentChar) {
        currentChar.classList.remove('current');
      }

      for (let i = 0; i < sampleText.length; i++) {
        if (i < value.length) {
          characters[i].className = 'character ' + 
            (value[i] === sampleText[i] ? 'correct' : 'incorrect');
        } else if (i === value.length) {
          characters[i].className = 'character current';
        } else {
          characters[i].className = 'character';
        }
      }
    });

    document.addEventListener('click', () => {
      if (!isFinished) {
        hiddenInput.focus();
      }
    });

    initializeText();
