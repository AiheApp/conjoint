// Code to randomly generate conjoint profiles in a website

// Terminology clarification: 
// Task = Set of choices presented to respondent in a single screen (i.e. pair of candidates)
// Profile = Single list of attributes in a given task (i.e. candidate)
// Attribute = Category characterized by a set of levels (i.e. education level)
// Level = Value that an attribute can take in a particular choice task (i.e. "no formal education")

/* Randomize array in-place using Durstenfeld shuffle algorithm */
function shuffleArray(array) {
  for (var i = array.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = array[i];
      array[i] = array[j];
      array[j] = temp;
  }
  return(array);
}

// Function to generate weighted random numbers
function weighted_randomize(prob_array, at_key)
{
var prob_list = prob_array[at_key];

// Create an array containing cutpoints for randomization
var cumul_prob = new Array(prob_list.length);
var cumulative = 0.0;
for (var i=0;  i < prob_list.length; i++){
  cumul_prob[i] = cumulative;
  cumulative = cumulative + parseFloat(prob_list[i]);
}

// Generate a uniform random floating point value between 0.0 and 1.0
var unif_rand = Math.random();

// Figure out which integer should be returned
var outInt = 0;
for (var k = 0; k < cumul_prob.length; k++){
  if (cumul_prob[k] <= unif_rand){
    outInt = k + 1;
  }
}

return(outInt);
}

var featurearray = {"Gender" : ["female","male"],"Education" : ["no formal","4th grade","8th grade","high school","two-year college","college degree","graduate degree"],"Language Skills" : ["fluent English","broken English","tried English but unable","used interpreter"],"Country of Origin" : ["Germany","France","Mexico","Philippines","Poland","India","China","Sudan","Somalia","Iraq"],"Job" : ["janitor","waiter","child care provider","gardener","financial analyst","construction worker","teacher","computer programmer","nurse","research scientist","doctor"],"Job Experience" : ["none","1-2 years","3-5 years","5+ years"],"Job Plans" : ["contract with employer","interviews with employer","will look for work","no plans to look for work"],"Reason for Application" : ["reunite with family","seek better job","escape persecution"],"Prior Entry" : ["never","once as tourist","many times as tourist","six months with family","once w/o authorization"]};

var restrictionarray = [[["Job","financial analyst"],["Education","no formal"]],[["Job","financial analyst"],["Education","4th grade"]],[["Job","financial analyst"],["Education","8th grade"]],[["Job","financial analyst"],["Education","high school"]],[["Job","computer programmer"],["Education","no formal"]],[["Job","computer programmer"],["Education","4th grade"]],[["Job","computer programmer"],["Education","8th grade"]],[["Job","computer programmer"],["Education","high school"]],[["Job","research scientist"],["Education","no formal"]],[["Job","research scientist"],["Education","4th grade"]],[["Job","research scientist"],["Education","8th grade"]],[["Job","research scientist"],["Education","high school"]],[["Job","doctor"],["Education","no formal"]],[["Job","doctor"],["Education","4th grade"]],[["Job","doctor"],["Education","8th grade"]],[["Job","doctor"],["Education","high school"]],[["Reason for Application","escape persecution"],["Country of Origin","Germany"]],[["Reason for Application","escape persecution"],["Country of Origin","France"]],[["Reason for Application","escape persecution"],["Country of Origin","Mexico"]],[["Reason for Application","escape persecution"],["Country of Origin","Poland"]],[["Reason for Application","escape persecution"],["Country of Origin","India"]],[["Reason for Application","escape persecution"],["Country of Origin","Philippines"]]];

var probabilityarray = {};

// Indicator for whether weighted randomization should be enabled or not
var weighted = 0;

// K = Number of tasks displayed to the respondent
var K = 5;

// N = Number of profiles displayed in each task
var N = 2;

// Should duplicate profiles be rejected?
var noDuplicateProfiles = false;

var attrconstraintarray = [["Job","Job Experience","Job Plans"]];

// Place the $featurearray keys into a new array
var featureArrayKeys = Object.keys(featurearray);

// If order randomization constraints exist, drop all of the non-free attributes
if (attrconstraintarray.length != 0){
for (const constraints of attrconstraintarray){
  if (constraints.length > 1){
    for (var p = 1; p < constraints.length; p++){
      if (featureArrayKeys.includes(constraints[p])){
        var remkey = featureArrayKeys.indexOf(constraints[p]);
                  featureArrayKeys.splice(remkey, 1);
      }
    }
  }
}
} 

// Re-randomize the featurearray keys
featureArrayKeys = shuffleArray(featureArrayKeys);

// Re-insert the non-free attributes constrained by $attrconstraintarray
if (attrconstraintarray.length != 0){
for (const constraints of attrconstraintarray){
  if (constraints.length > 1){
    var insertloc = constraints[0];
    if (featureArrayKeys.includes(insertloc)){
      var insert_block = [];
      for (var p = 1; p < constraints.length; p++){
        insert_block.push(constraints[p]);
      }
      var begin_index = featureArrayKeys.indexOf(insertloc);
      featureArrayKeys.splice(begin_index+1, 0, ...insert_block);
    }
  }
}
}

// Re-generate the new $featurearray - label it $featureArrayNew
var featureArrayNew = {};
for (var h = 0; h < featureArrayKeys.length; h++){
  featureArrayNew[featureArrayKeys[h]] = featurearray[featureArrayKeys[h]];        
}

// Initialize the array returned to the user
// Naming Convention
// Level Name: F-[task number]-[profile number]-[attribute number]
// Attribute Name: F-[task number]-[attribute number]
// Example: F-1-3-2, Returns the level corresponding to Task 1, Profile 3, Attribute 2 
// F-3-3, Returns the attribute name corresponding to Task 3, Attribute 3

var returnarray = {};

// For each task $p
for(var p = 1; p <= K; p++){

// For each profile $i
for(var i = 1; i <= N; i++){

  // Repeat until non-restricted profile generated
  var complete = false;

  while (complete == false){

    // Create a count for $attributes to be incremented in the next loop
    var attr = 0;
    
    // Create a dictionary to hold profile's attributes
    var profile_dict = {};

    // For each attribute $attribute and level array $levels in task $p
    for(var q = 0; q < featureArrayKeys.length; q++){
      // Get Attribute name
      var attr_name = featureArrayKeys[q];
        
      // Increment attribute count
      attr = attr + 1;

      // Create key for attribute name
      var attr_key = "F-" + p + "-" + attr;

              // Store attribute name in returnarray
              returnarray[attr_key] = attr_name;

      // Get length of levels array
      var num_levels = featureArrayNew[attr_name].length;

      // Randomly select one of the level indices
      if (weighted == 1){
        var level_index = weighted_randomize(probabilityarray, attr_name) - 1;

      }else{
        var level_index = Math.floor(Math.random() * num_levels);
      }	

      // Pull out the selected level
      var chosen_level = featureArrayNew[attr_name][level_index];
      
      // Store selected level in profileDict
      profile_dict[attr_name] = chosen_level;

      // Create key for level in $returnarray
      var level_key = "F-" + p + "-" + i + "-" + attr;

      // Store selected level in $returnarray
      returnarray[level_key] = chosen_level;
    }

          var clear = true;
          
          // Cycle through restrictions to confirm/reject profile
          if (restrictionarray.length != 0){
              for (var v = 0; v < restrictionarray.length; v++){
                  var falsevar = 1;
                  for (var mp = 0; mp < restrictionarray[v].length; mp++){
                      if (profile_dict[restrictionarray[v][mp][0]] == restrictionarray[v][mp][1]){
                          falsevar = falsevar*1;
                      }else{
                          falsevar = falsevar*0;
                      }							
                  }
                  if (falsevar == 1){
                      clear = false;
                  }
              }
          }
                          
          // If we're throwing out duplicates
          if (noDuplicateProfiles == true){
              // Cycle through all previous profiles to confirm no identical profiles
              if (i > 1){    
                  // For each previous profile
                  for(var z = 1; z < i; z++){
            
                      // Start by assuming it's the same
                      var identical = true;
            
                      // Create a count for $attributes to be incremented in the next loop
                      var attrTemp = 0;
            
                      // For each attribute $attribute and level array $levels in task $p
                      for(var qz = 0; qz < featureArrayKeys.length; qz++){
              
                          // Increment attribute count
                          attrTemp = attrTemp + 1;
  
                          // Create keys 
                          var level_key_profile = "F-" + p + "-" + i + "-" + attrTemp;
                          var level_key_check = "F-" + p + "-" + z + "-" + attrTemp;
              
                          // If attributes are different, declare not identical
                          if (returnarray[level_key_profile] != returnarray[level_key_check]){
                              identical = false;
                          }
                      }
                      // If we detect an identical profile, reject
                      if (identical == true){
                          clear = false;
                      }
                  }                
              }
          }
          complete = clear;
      }
  }
}

// Instead of updating Qualtrics, let's create a display function
function displayConjointProfiles() {
// Get the container element where profiles will be displayed
const container = document.getElementById('conjoint-profiles-container');

// Clear any existing content
if (container) {
  container.innerHTML = '';
  
  // For each task
  for (let p = 1; p <= K; p++) {
    const taskElement = document.createElement('div');
    taskElement.className = 'conjoint-task';
    taskElement.innerHTML = `<h3>Task ${p}</h3>`;
    
    // Create a table for this task's profiles
    const table = document.createElement('table');
    table.className = 'conjoint-table';
    
    // Add table header with attribute names
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    headerRow.innerHTML = '<th>Attribute</th>';
    
    // Add column headers for each profile
    for (let i = 1; i <= N; i++) {
      headerRow.innerHTML += `<th>Profile ${i}</th>`;
    }
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // Create table body
    const tbody = document.createElement('tbody');
    
    // For each attribute in this task
    let attr = 0;
    for (let q = 0; q < featureArrayKeys.length; q++) {
      attr = attr + 1;
      const attrKey = `F-${p}-${attr}`;
      const attrName = returnarray[attrKey];
      
      const row = document.createElement('tr');
      row.innerHTML = `<td><strong>${attrName}</strong></td>`;
      
      // Add cells for each profile
      for (let i = 1; i <= N; i++) {
        const levelKey = `F-${p}-${i}-${attr}`;
        row.innerHTML += `<td>${returnarray[levelKey]}</td>`;
      }
      
      tbody.appendChild(row);
    }
    
    table.appendChild(tbody);
    taskElement.appendChild(table);
    
    // Add a selection form for this task
    const form = document.createElement('div');
    form.className = 'conjoint-selection';
    form.innerHTML = `
      <p>Which profile do you prefer?</p>
      <div class="conjoint-options">
        ${Array.from({length: N}, (_, i) => i + 1).map(num => 
          `<label>
            <input type="radio" name="task-${p}-choice" value="${num}">
            Profile ${num}
          </label>`
        ).join('')}
      </div>
    `;
    taskElement.appendChild(form);
    
    container.appendChild(taskElement);
  }
  
  // Add a submit button
  const submitBtn = document.createElement('button');
  submitBtn.textContent = 'Submit Choices';
  submitBtn.className = 'conjoint-submit';
  submitBtn.addEventListener('click', collectAndSubmitResponses);
  container.appendChild(submitBtn);
}
}

// Function to collect and process responses
function collectAndSubmitResponses() {
  const responses = {};
  let allAnswered = true;
  
  // Collect all responses
  for (let p = 1; p <= K; p++) {
    const selectedOption = document.querySelector(`input[name="task-${p}-choice"]:checked`);
    if (selectedOption) {
      responses[`task-${p}`] = selectedOption.value;
    } else {
      allAnswered = false;
    }
  }
  
  if (!allAnswered) {
    alert('Please make a selection for all tasks before submitting.');
    return;
  }
  
  // Show loading state on button
  const submitBtn = document.querySelector('.conjoint-submit');
  const originalText = submitBtn.textContent;
  submitBtn.textContent = 'Submitting...';
  submitBtn.disabled = true;
  
  // Create a hidden form to submit to Google Apps Script
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = 'https://script.google.com/macros/s/AKfycbzHO8tZgPZBwMGNyM68pFouXaB6Vf3H5H4m-sAhlLkLH5OwXmw9lq3W-EP6N_7sxRFC/exec';
  
  // Create a hidden iframe to prevent page navigation
  const iframe = document.createElement('iframe');
  iframe.name = 'hidden_iframe';
  iframe.style.display = 'none';
  document.body.appendChild(iframe);
  form.target = 'hidden_iframe';
  
  // Add the data as a single JSON payload
  const input = document.createElement('input');
  input.type = 'hidden';
  input.name = 'payload';
  input.value = JSON.stringify(responses);
  form.appendChild(input);
  
  // Add form to body
  document.body.appendChild(form);
  
  // Submit the form
  form.submit();
  
  // Display confirmation message
  setTimeout(() => {
    const container = document.getElementById('conjoint-profiles-container');
    if (container) {
      container.innerHTML = `
        <div style="text-align: center; padding: 2rem;">
          <h3 style="margin-bottom: 1rem; font-weight: 600;">Thank you for completing the survey!</h3>
          <p>Your responses have been recorded.</p>
        </div>
      `;
    }
  }, 1000);
  
  // Save to localStorage as backup
  localStorage.setItem('conjointResponses', JSON.stringify(responses));
}

// Initialize the conjoint profiles when the page loads
window.addEventListener('DOMContentLoaded', displayConjointProfiles);