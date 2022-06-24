// Import search functionality
// import { search } from "./index.js";

// Element variables
var localHeaderEl = $('#local-info');
var stateHeaderEl = $('#state-info');
var federalHeaderEl = $('#federal-info');
var searchInputEl = $('#search-input');
var searchButtonEl = $('#search-button')
var localBoxEl = $('#local-container');
var stateBoxEl = $('#state-container');
var federalBoxEl = $('#federal-container');
var govtInfoEl = $('#govt-info');
var errorModalEl = $('#dialog-modal');
var accordionEl = $('.accordion');

$(document).ready(function() {
//Initialize accordion
$(accordionEl).accordion();
$(localHeaderEl).on("accordionactivate", function() {});
$(stateHeaderEl).on("accordionactivate", function() {});
$(federalHeaderEl).on("accordionactivate", function() {});
});



// Variables needed in global scope
var officeName = '';
var officeLevel = '';
var officialName = '';
var party = '';
var addressLine1 = '';
var addressCity = '';
var addressState = '';
var addressZip = '';
var phone = '';
var email = '';
var officialWebsite = '';
var wikiSite = '';
var facebookId = '';
var twitterId = '';
var youTubeId = '';
var userState = '';
var official_full = '';
var openSecretsID = '';
var bioGuideId = '';
var candidateCash = '';
var candidateDebt = '';
var candidateFirstElected = '';
var candidateNextElection = '';
var candidateExpenditures = '';
var candidateTotalReceipts = '';
var candidateSource = '';
var candidateLastUpdated = '';
var contributorArray = [];
var contributorCycle = '';
var contributorHTML= '';
var crpNotice='';
var crpOrigin='';
var crpSource='';

const civicKey = 'AIzaSyABhC00ndBtZ48N0AC1XfQG911F09gmit8';
const proPublicaKey = '2pNm5c6OoX6Qs8joxqGptlpExvwrg9hxzGxzj3GE';
const openSecretsKey = '790149a888a39934e82a2ad7234b7043';
const govInfoKey = 'eEd0GvTqXamQlTNTBaSkUhVDEbfQrHIT6W1qxaZy';

var address = JSON.parse(localStorage.getItem("tempSearch"));

// define the modal
$(errorModalEl).dialog({
  buttons: [{
    text: " Ok ",
    click: function() {
      $(this).dialog("close");
      location.reload();
    }
  }],
  appendTo: ".search",
  autoOpen: false,
  resizeable: false,
  show: {effect: "fadeIn", duration: 2},
  closeText: "hide",
  closeOnEscape: true,
  draggable: false,
  hide: {effect: "fadeOut", duration: 2},
  maxWidth: 500,
  minWidth: 200,
  modal: true
});

// define accordion
$(accordionEl).accordion({
  active: 0,
  animate: 50,
  collapsible: true,
  event: "click",
  header: "h2",
  icons: {"header": "ui-icon-caret-1-e", "activeHeader": "ui-icon-caret-1-s"}
})

function getRepresentatives() {
  let apiUrl = "https://www.googleapis.com/civicinfo/v2/representatives?address=63119&key="+civicKey;

  // redirects to proxy server for CORS workaround
  jQuery.ajaxPrefilter(function(apiUrl) {
    if (apiUrl.crossDomain && jQuery.support.cors) {
        apiUrl = 'https://whispering-bastion-84455.herokuapp.com/' + apiUrl;
    }
  });

  
  /* Levels:
      Country: Federal
      administrativeArea1: State
      administrativeArea2: Local */
  fetch(apiUrl).then(function(response) {
    if(response.ok){
      response.json().then(function(data){
        userState = data.normalizedInput.state;
        let senatorCopy = [...data.offices.slice(2,3)];
        senatorCopy = JSON.stringify(Object.assign(senatorCopy[0]));
        data.offices.splice(3, 0, JSON.parse(senatorCopy));
        data.offices[2].officialIndices.splice(1,1);
        data.offices[3].officialIndices.splice(0,1);
        console.log(data);
        for(var i=0;i<data.offices.length;i++) {
          officeName = data.offices[i].name;
          officeLevel = data.offices[i].levels[0];
          officialName = data.officials[data.offices[i].officialIndices[0]].name;
          party = data.officials[data.offices[i].officialIndices[0]].party;
          official_full = JSON.parse(JSON.stringify(officialName));

          // If address exists, define variables
          if(!data.officials[data.offices[i].officialIndices[0]].address) {
            addressLine1='No address information available';
          } else {
            addressLine1 = data.officials[data.offices[i].officialIndices[0]].address[0].line1;
            addressCity = data.officials[data.offices[i].officialIndices[0]].address[0].city;
            addressState = data.officials[data.offices[i].officialIndices[0]].address[0].state;
            addressZip = data.officials[data.offices[i].officialIndices[0]].address[0].zip;
          }
          
          // Grab phone number
          phone = data.officials[data.offices[i].officialIndices[0]].phones[0];
          
          // If emails exist, define the variable using the first index
          if(!data.officials[data.offices[i].officialIndices[0]].emails) {
            email = 'No email available';
          } else {
            email = data.officials[data.offices[i].officialIndices[0]].emails[0];
          }
    
          // If websites exist, grab them. Default is official first, then Wikipedia
          if(!data.officials[data.offices[i].officialIndices[0]].urls) {
            officialWebsite = 'No website available';
          } else {
            officialWebsite = data.officials[data.offices[i].officialIndices[0]].urls[0];
          }

          // If social media channels do not exist, note it. Otherwise, loop through each and get Facebook and Twitter IDs
          if(!data.officials[data.offices[i].officialIndices[0]].channels) {
            facebookId = 'Not available';
            twitterId = 'Not available';
          } else{
            let j=0;
            while (j<data.officials[data.offices[i].officialIndices[0]].channels.length) {
              var channelType = data.officials[data.offices[i].officialIndices[0]].channels[j].type;
              var channelId = data.officials[data.offices[i].officialIndices[0]].channels[j].id;
              facebookId = 'Not available';
              twitterId = 'Not available';
              
  
              if(channelType === 'Facebook') {
                facebookId = 'facebook.com/'+channelId;
              } else if(channelType==='Twitter') {
                twitterId = 'twitter.com/'+channelId;
              }
              j++;
            }
          }   

          // Div definition for insert using template literal
          let htmlInsert = 
          `<div class='official-container'>
            <h3 class='office-name'>${officeName}</h3>
            <h4 class='official-name'>${officialName}</h4>
            <p class='party'>${party}</p>
            <div id='contact-info'>
              <address class='address'>
                ${addressLine1}<br />
                ${addressCity}, ${addressState} ${addressZip}<br />
                P: ${phone}<br />
                E: ${email}
              </address>
            </div>
            <div id='information'>
              <p>Official website: ${officialWebsite}</p>
            </div>
            <div id='social-media'>
              <p id='facebook'>Facebook: ${facebookId}</p>
              <p id='twitter'>Twitter: ${twitterId}</p>
            </div>
          </div>
          `

          // Depending on level as defined in Civic Info API, append to appropriate div
          if(officeLevel === 'administrativeArea2') {
            $(localHeaderEl).append($(htmlInsert));
          } else if (officeLevel === 'administrativeArea1') {
            $(stateHeaderEl).append($(htmlInsert));
          } else if (officeLevel === 'country') {
            $(federalHeaderEl).append($(htmlInsert));
          };

          if(officeName === 'U.S. Senator' || officeName === 'U.S. Representative') {
            $(federalHeaderEl).append(`
              <div id='summary-container${[i]}'>
                <div class='summary'>
                  <h4>Financial Summary</h4>
                </div>
              </div>
            
              <div id='contributors-container${[i]}'>
                <div class='contributors'>
                  <h4>Top Contributors</h4>
                </div>
              </div>
            
            `);
          }
          let iterationString =  String([i])

          var candidateSummaryEl = $('#summary-container'+iterationString);
          var contributionsEl = $('#contributors-container'+iterationString);

          // Get ID information from API for Federal congressional members only
          getLegislatorIDs(official_full, candidateSummaryEl,contributionsEl);
          localStorage.removeItem("tempSearch");
        }
      })
    } else {
      location.href='./optional.html';
      $(errorModalEl).dialog('open');
      return;
    }
  }).catch((error) => {
    localStorage.removeItem("tempSearch");
    console.log(error);
    return;
  })
}

function getCandContrib (openSecretsID, contributionsEl) {
  let apiUrl = 'https://www.opensecrets.org/api/?method=candContrib&cid='+openSecretsID+'&output=json&apikey='+openSecretsKey;

  fetch(apiUrl).then(function(response) {
    if(response.ok) {
      response.json().then(function(data){
        crpNotice =  data.response.contributors['@attributes'].notice;
        crpOrigin =  data.response.contributors['@attributes'].origin;
        crpSource =  data.response.contributors['@attributes'].source;
        contributorCycle =  data.response.contributors['@attributes'].cycle;
        contributorArray = data.response.contributors.contributor;
        
        // Define HTML for list items for each contributor
        for(var j=0;j<contributorArray.length;j++) {
          contributorHTML =
            `
            <h5>${contributorArray[j]['@attributes'].org_name}</h5><br />
              <p class='total-contributions'>Total Contributions: <span class='total-cont-dollars'>${contributorArray[j]['@attributes'].total}</span></p>
              <p class='individual-contributions'>Individual Contributions: <span class='indiv-cont-dollars'>${contributorArray[j]['@attributes'].indivs}</span></p>
              <p class='pac-contributors'>PAC Contributions: <span class='pac-cont-dollars'>${contributorArray[j]['@attributes'].pacs}</span></p>
            `;

          // Append defined HTML to container element defined in search results
          $(contributionsEl).append(contributorHTML);
        }

        $(contributionsEl).append(`
        <p class='notice'>${crpNotice}</p>
        <p class='origin'>${crpOrigin}</p>
        <p class='source'>${crpSource}</p>
        `);
      })
    } else {
      location.href='./optional.html';
      $(errorModalEl).dialog('open');
      return;
    }
  })
}

function getLegislatorIDs(official_full, candidateSummaryEl, contributionsEl) {
  if(officeName === 'U.S. Senator' || officeName === 'U.S. Representative') {
    let apiUrl = 'https://theunitedstates.io/congress-legislators/legislators-current.json'

    fetch(apiUrl).then(function(response) {
      if(response.ok) {
        response.json().then(function(data) {
          let indexResult = data.findIndex(data => (data.name.official_full === official_full) ? true : false);
          openSecretsID = data[indexResult].id.opensecrets;
          bioGuideId = data[indexResult].id.bioguide;

          getCandSummary(openSecretsID, candidateSummaryEl);
          getCandContrib(openSecretsID, contributionsEl);
        })
      } else {
        location.href='./optional.html';
        $(errorModalEl).dialog('open');
        return;
      }
    })
  }
}

function getCandSummary(openSecretsID, candidateSummaryEl) {
  let apiUrl = 'http://www.opensecrets.org/api/?method=candSummary&cid='+openSecretsID+'&output=json&apikey='+openSecretsKey;

  fetch(apiUrl).then(function(response) {
    if(response.ok) {
      response.json().then(function(data) {
        console.log(data);
        candidateCash = data.response.summary['@attributes'].cash_on_hand;
        candidateDebt = data.response.summary['@attributes'].debt;
        candidateFirstElected = data.response.summary['@attributes'].first_elected;
        candidateNextElection = data.response.summary['@attributes'].next_election;
        candidateExpenditures = data.response.summary['@attributes'].spent;
        candidateTotalReceipts = data.response.summary['@attributes'].total;
        candidateSource = data.response.summary['@attributes'].source;
        candidateOrigin = data.response.summary['@attributes'].origin;
        candidateLastUpdated = data.response.summary['@attributes'].last_updated;
        
        let summaryHTML = 
          `<p >First election (year): ${candidateFirstElected}</p>
          <p >Next election (year): ${candidateNextElection}</p>
          <br /><br />
          <p >Total receipts: ${candidateTotalReceipts}</p>
          <br /><br />
          <p >Cash on hand: ${candidateCash}</p>
          <p >Total expenditures: ${candidateExpenditures}</p>
          <p >Total debt: ${candidateDebt}</p>
          <p class='last-updated'>${candidateLastUpdated}</p>
          `

          $(candidateSummaryEl).append(summaryHTML);
          $(candidateSummaryEl).append(`
            <p class='origin'>${candidateOrigin}</p>
            <p class='source'>${candidateSource}</p>
          `)
      })
    } else {
      location.href='./optional.html';
      $(errorModalEl).dialog('open');
      return;
    }
  })
}

getRepresentatives();