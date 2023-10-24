    // Initialize empty object for user answers
    let userAnswers = {};

    // Sample questions
    const questions = [
      {
        id: 'S1',
        text: 'Do you snore?',
        options: ['No', 'Yes']
      },
      {
        id: 'T1',
        text: 'Do you feel fatigued during the day?',
        options: ['No', 'Yes']
      },
      {
        id: 'T2',
        text: "Do you wake up feeling like you haven't slept?",
        options: ['No', 'Yes']
      },
      {
        id: 'O1',
        text: 'Have you been told you stop breathing at night?',
        options: ['No', 'Yes']
      },
      {
        id: 'O2',
        text: 'Do you gasp for air or choke while sleeping?',
        options: ['No', 'Yes']
      },
      {
        id: 'P1',
        text: 'Do you have high blood pressure or are on BP medication?',
        options: ['No', 'Yes']
      },
      {
        id: 'B1',
        text: 'What is your weight (kg)',
        type: 'input'
      },
      {
        id: 'B2',
        text: 'What is your height (cm)',
        type: 'input'
      },
      {
        id: 'A1',
        text: 'Are you 50 years old or older?',
        options: ['No', 'Yes']
      },
      {
        id: 'N1',
        text: 'Are you a male with neck circumference of 43cm or larger, or a female with neck circumference of 41cm or larger?',
        options: ['No', 'Yes']
      },
      {
        id: 'G1',
        text: 'Are you a male?',
        options: ['No', 'Yes']
      }
    ];

    
    function startQuestionnaire() {

      // Show the progress bar container
      document.getElementById('progressBarContainer').style.display = 'flex';

      // Initialise the progress bar to 0%
      updateProgressBar(0, questions.length);

      // Hide the instructionsDiv
      document.getElementById('instructionsDiv').style.display = 'none';

      // Hide the Start button
      document.getElementById('startButton').style.display = 'none';

      // Show the questionDiv
      document.getElementById('questionDiv').classList.remove('hidden');

        // Reset questionnaire state
      resetQuestionnaire();

      // Begin the questionnaire
      displayQuestion(0);
    }


    function resetQuestionnaire() {
  // Clear user answers and recommendations
  userAnswers = {};
  recommendations.clear();

  // Clear the recommendations display area
  const recommendationsDiv = document.getElementById('recommendationsDiv');
  recommendationsDiv.innerText = '';
  recommendationsDiv.classList.add('hidden');

    // Clear the other resources display area
    const otherResourcesDiv = document.getElementById('otherResourcesDiv');
    otherResourcesDiv.innerText = '';
    otherResourcesDiv.classList.add('hidden');

    //clear print and credits
    document.getElementById('printButton').style.display = 'none';
    document.getElementById('creditsDiv').style.display = 'none';

}

// Modified displayQuestion function to include Back and Skip buttons
function displayQuestion(index) {
  updateProgressBar(index, questions.length);

  const questionDiv = document.getElementById('questionDiv');
  const question = questions[index];
  if (!question) {
    questionDiv.classList.add('hidden');
    generateRecommendations();
    return;
  }

  let html = `<p class="question-text">${question.text}</p><div class="flex-container">`;
  
  // Check if the question has options or is a text input 
  if (question.options) {
    question.options.forEach((option, i) => {
      html += `<label class="boxed-radio"><input type="radio" name="q${index}" value="${option}" style="display:none;" onclick="handleUserInput(${index}, '${option}')">${option}</label>`;
    });
  } else if (question.type === 'input') {
    // Display input field with a "Next" button
    html += `<input type="text" class="boxed-input" id="${question.id}" placeholder="Enter ${question.text}">`;
    html += `<button onclick="handleTextInput(${index})">Next</button>`;
  }

  html += '</div>';

  // Append Back and Skip buttons
  html += `<button onclick="handleBackClick(${index})"${index === 0 ? ' disabled' : ''}>Back</button>`;
  html += `<button onclick="handleSkipClick(${index})">Skip</button>`;

  document.getElementById('questionDiv').innerHTML = html;
}

function handleTextInput(index) {
  // Get the question object
  const question = questions[index];

  // Retrieve the value from the input field
  const inputValue = document.getElementById(question.id).value;

  // Validate the input
  if (isValidInput(inputValue)) {
    // Save the input value in userAnswers
    userAnswers[question.id] = inputValue;

    // Move to the next question
    displayQuestion(index + 1);
  } else {
    // Show an error message or handle the invalid input
    alert("Please enter a valid number greater than zero.");
  }
}

// Function to validate the input
function isValidInput(value) {
  // Implement validation logic (e.g., check if it's a number greater than zero)
  return !isNaN(value) && parseFloat(value) > 0;
}


// Function to handle Back button click
function handleBackClick(index) {
  // Navigate to the previous question by decrementing the index
  displayQuestion(index - 1);
}

// Function to handle Skip button click
function handleSkipClick(index) {
  // Navigate to the next question by incrementing the index
  displayQuestion(index + 1);
}

// Modified handleUserInput function
function handleUserInput(index, answer) {
  const questionID = questions[index].id;
  userAnswers[questionID] = answer;

  // Navigate to the next question by incrementing the index
  displayQuestion(index + 1);
}

// Initialize empty Set for unique recommendations
let recommendations = new Set();

function generateRecommendations() {

  // Clear recommendationsDiv
   const recommendationsDiv = document.getElementById('recommendationsDiv');
  recommendationsDiv.innerHTML = '';

  // Calculate the score and BMI
  const {score, BMI} = calculateScore();

  // Determine the risk level
  let riskLevel = determineRiskLevel(score);

  // Generate and store recommendations based on risk level
  generateAndStoreRecommendations(score);

  // Display recommendations and other resources
  displayRecommendations(score, BMI, riskLevel);
  displayOtherResources();
}

// Calculate STOP BANG score
function calculateScore() {
  let score = 0;
  let BMI = null; // Initialize BMI variable

  for (const [id, answer] of Object.entries(userAnswers)) {
    if (answer === "Yes") {
      score++;
    }
  }

  // Calculate BMI
  if ("B1" in userAnswers && "B2" in userAnswers) {
    let weight = parseFloat(userAnswers["B1"]);
    let height = parseFloat(userAnswers["B2"]) / 100;  // Convert height to meters
    BMI = weight / (height * height);

    // Add one point to the score if BMI > 28
    if (BMI > 28) {
      score++;
    }
  }

  return {score, BMI};  // Return both score and BMI
}

function determineRiskLevel(score) {
  if (score >= 5) {
    return 'High risk of OSA';
  } else if (score >= 3) {
    return 'Intermediate risk of OSA';
  } else {
    return 'Low risk of OSA';
  }
}

function generateAndStoreRecommendations(score) {
  recommendations.clear();
  
  let riskLevel;
  
  if (score >= 5) {
    riskLevel = 'High risk of OSA';
    recommendations.add("See your GP to discuss this.");
  } else if (score >= 3) {
    riskLevel = 'Intermediate risk of OSA';
    recommendations.add("Consider seeing your GP to talk about your sleep.");
  } else {
    riskLevel = 'Low risk of OSA';
    recommendations.add("Maintain a healthy lifestyle and sleep habits.");
  }
  
  recommendationsDiv.classList.remove('hidden');
  return recommendations;
}



function displayScoreAndRisk(score, BMI, riskLevel) {
  const recommendationsDiv = document.getElementById('recommendationsDiv');
  recommendationsDiv.innerHTML += `<h2>Recommendations</h2>`;
  recommendationsDiv.innerHTML += `<p>Score: ${score}</p>`;
  recommendationsDiv.innerHTML += `<p>Risk Level: ${riskLevel}</p>`;
}



function displayListOfRecommendations() {
  const recommendationsDiv = document.getElementById('recommendationsDiv');
  let ul = document.createElement('ul');
  recommendations.forEach(recommendation => {
    let li = document.createElement('li');
    li.innerHTML = recommendation;
    ul.appendChild(li);
  });
  recommendationsDiv.appendChild(ul);
}

function displaySingleRecommendation() {
  const recommendationsDiv = document.getElementById('recommendationsDiv');
  let p = document.createElement('p');
  p.innerHTML = Array.from(recommendations)[0]; // Convert set to array and get the first element
  recommendationsDiv.appendChild(p);
}

function addAccordionForAnswers() {
  let accordion = document.createElement('button');
  accordion.innerHTML = "Show Questionnaire Answers";
  accordion.className = "accordion";
  const recommendationsDiv = document.getElementById('recommendationsDiv');
  let panel = document.createElement('div');
  panel.className = "panel";

  for (const [questionID, answer] of Object.entries(userAnswers)) {
    const question = questions.find(q => q.id === questionID);
    if (question) {
      panel.innerHTML += `<p><strong>${question.text}</strong><br>Answer: ${answer}</p>`;
    }
  }

  recommendationsDiv.appendChild(accordion);
  recommendationsDiv.appendChild(panel);

  accordion.addEventListener("click", function() {
    this.classList.toggle("active");
    let panel = this.nextElementSibling;
    if (panel.style.display === "block") {
      panel.style.display = "none";
    } else {
      panel.style.display = "block";
    }
  });
}

function displayRecommendations(score, BMI, riskLevel) {

  // Clear the question display area
  document.getElementById('questionDiv').innerHTML = '';
  
  // Display score and risk level
  displayScoreAndRisk(score, BMI, riskLevel);

  // Check if there is more than one recommendation
  if (recommendations.size > 1) {
    displayListOfRecommendations();
  } else if (recommendations.size === 1) {
    displaySingleRecommendation();
  }

  // Display the calculated BMI if available
  if (BMI !== null) {
    const recommendationsDiv = document.getElementById("recommendationsDiv");
    recommendationsDiv.innerHTML += "<p>Calculated BMI: " + BMI.toFixed(2) + "</p>";
  }

  // Add accordion for questionnaire answers
  addAccordionForAnswers();

  // Show or modify other UI elements
  document.getElementById('startButton').style.display = 'block';
  document.getElementById('startButton').innerText = 'Restart';
  document.getElementById('printButton').style.display = 'block';
  document.getElementById('creditsDiv').style.display = 'block';
}



function updateProgressBar(currentQuestionIndex, totalQuestions) {
  const progressBar = document.getElementById('progressBar');
  const progress = (currentQuestionIndex / totalQuestions) * 100;
  progressBar.style.width = progress + '%';
  
  if (progress > 0) {
    progressBar.innerText = Math.round(progress) + '%';
  } else {
    progressBar.innerText = '';  // Empty string when progress is 0
  }
}

function displayOtherResources() {
  const otherResourcesDiv = document.getElementById('otherResourcesDiv');
  otherResourcesDiv.innerHTML = `
    <h2>Other Resources</h2>
    <ul>
      <li>Obstructive sleep apnoea: <a href='https://healthify.nz/health-a-z/o/obstructive-sleep-apnoea/' target='_blank'>Healthify page on the condition</a></li>
      <li>Te Kete Sleep resource: <a href='https://healthify.nz/tools/t/te-kete-haerenga-and-sleep/' target='_blank'>Te Kete Sleep resource on Healthify</a></li>
      <li>Sleep apps: <a href='https://healthify.nz/apps/s/sleep-apps/' target='_blank'>Sleep App Reviews on Healthify</a></li>
      <li>Just a thought course: <a href='https://healthify.nz/apps/m/managing-insomnia-just-a-thought-course/' target='_blank'>Just a Thought Insomnia Course</a></li>
    </ul>
  `;
  otherResourcesDiv.classList.remove('hidden');
}

function printQuestionnaire() {
  // Find the accordion button for show answers
  const accordion = document.querySelector('.accordion');
  
  // Simulate a click to expand the show answers
  accordion.click();
  
  // Initiate print dialog
  window.print();
}



