
var queryField = document.getElementById("queryme");
let clearSelectors = document.getElementById("clearSelectors");

queryField.focus();

queryField.addEventListener('keydown', function (e) {
    sendClearSignal();
    sendQuerySignal();
});

setUpPopUp();

// is it possible to implement a callback handler instead?
// chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
//     if (msg.text)
// });

function updateInstanceCounter(hits) {
    console.log("updating instance counter with " + hits);
    var counter = document.getElementById("instancecounter");
    counter.innerHTML = hits;
}

// sends highLightelements with a signal containing the search parameters, defined in the widget
async function sendQuerySignal() {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true});
    chrome.scripting.executeScript({
	target: { tabId: tab.id },
	function: highlightElements,
    });
    let q = document.querySelector('#queryme').value;
    // let q = qs.value;
    chrome.storage.sync.set({ "query" : q });
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
	chrome.tabs.sendMessage(tabs[0].id, { cmd: 'query' }, responseCallback = function(response) {
	    console.log("got res: " + response);
	    updateInstanceCounter(response.hits);
	    return true
	});
    });
}

// Highlights elements based on a selector query
function highlightElements() {
    chrome.storage.sync.get("query", ({ query }) => {
	console.log(query);
	let els = document.querySelectorAll(query);
	els.forEach((el) => el.style.outline = '#f00 solid 2px');
    });
}

// sends the clearstyles script to the page
async function sendClearSignal() {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true});
    chrome.scripting.executeScript({
	target: { tabId: tab.id },
	function: clearstyles,
    });
}

// clears all changes to the document style
function clearstyles() {
    console.log("clearing styles");
    var els = document.querySelectorAll("*");
    els.forEach((el) =>	el.attributeStyleMap.clear());
}

// TODO: implement
function getAllIds() {
    var els = document.querySelectorAll('*[id]');
    var values = [];
    els.forEach((el) => {
	if (!(el in values)) {
	    values.push(el);
	}
    });
    let valueset = [...new Set(values)];
    return valueset
}


// TODO: this is a mess. Factor out and reduce.
function populateTable(data, target) {
    // let suggestionbox = document.getElementById('suggestions');
    if ('content' in document.createElement('template')) {

	// var classlist = document.querySelector('#suggestions-classes');
	
	// "data" should be a dictionary that keys classes to number of instances of that class
	var numtuples = [];
	for (var k in data) {
	    numtuples.push([data[k], k]);
	}
	console.log(numtuples);
	numtuples.sort(function(a, b) {
	    if (a[0] > b[0]) return -1;
	    if (a[0] < b[0]) return 1;
	    return 0;
	});
	for (var d in numtuples) {
	    console.log(d);
	    var suggestatom = document.querySelector('#suggest_atom');
	    var cloneatom = suggestatom.content.cloneNode(true);
	    var clonebutt = cloneatom.querySelector(".suggestion-hint");
	    clonebutt.innerHTML = numtuples[d][0] + " :: " + numtuples[d][1];
	    target.appendChild(cloneatom);
	}
    }
}

function setUpPopUp() {
    console.log("setting up popup");
    var classlist = document.querySelector('#suggestions-classes');
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
	chrome.tabs.sendMessage(tabs[0].id, {cmd: 'get_classes'}, function(response) {
	    console.log("got classes:");
	    console.log(response);
	    populateTable(response, classlist);
	});
    });
    var taglist = document.querySelector('#suggestions-types');
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
	chrome.tabs.sendMessage(tabs[0].id, {cmd: 'get_tags'}, function(response) {
	    console.log("got tags:");
	    console.log(response);
	    populateTable(response, taglist);
	});
    });
}
