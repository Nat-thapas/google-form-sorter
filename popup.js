// Initialize preferences

const questionSortingModeDropdown = document.getElementById('question-sorting-mode');
const questionSortingDirectionDropdown = document.getElementById('question-sorting-direction');
const choiceSortingModeDropdown = document.getElementById('choice-sorting-mode');
const choiceSortingDirectionDropdown = document.getElementById('choice-sorting-direction');

chrome.storage.sync.get(['preferences'], ({ preferences }) => {
    questionSortingModeDropdown.value = preferences.questionSortingMode;
    questionSortingDirectionDropdown.value = preferences.questionSortingDirection;
    choiceSortingModeDropdown.value = preferences.choiceSortingMode;
    choiceSortingDirectionDropdown.value = preferences.choiceSortingDirection;
});

// Handle preferences changes

questionSortingModeDropdown.addEventListener('change', updatePreferences);
questionSortingDirectionDropdown.addEventListener('change', updatePreferences);
choiceSortingModeDropdown.addEventListener('change', updatePreferences);
choiceSortingDirectionDropdown.addEventListener('change', updatePreferences);

function updatePreferences() {
    let preferences = {
        'questionSortingMode' : questionSortingModeDropdown.value,
        'questionSortingDirection' : questionSortingDirectionDropdown.value,
        'choiceSortingMode' : choiceSortingModeDropdown.value,
        'choiceSortingDirection' : choiceSortingDirectionDropdown.value
    };
    chrome.storage.sync.set({ preferences });
    console.log('New preferences has been set');
}

// Handle buttons

const sortQuestionButton = document.getElementById('sort-question-button');
const sortChoiceButton = document.getElementById('sort-choice-button');
const sortBothButton = document.getElementById('sort-both-button');

async function getCurrentTabId() {
    const queryOptions = { active: true, currentWindow: true };
    const [tab] = await chrome.tabs.query(queryOptions);
    return tab.id;
}

async function getCurrentTabUrl() {
    const queryOptions = { active: true, currentWindow: true };
    const [tab] = await chrome.tabs.query(queryOptions);
    return tab.url;
}

function isUrlGoogleForm(urlString) {
    const url = new URL(urlString);
    return url.hostname === 'docs.google.com' && url.toString().includes('docs.google.com/forms/d/e/') && url.toString().includes('viewform');
}

sortQuestionButton.addEventListener('click', async () => {
    if (!isUrlGoogleForm(await getCurrentTabUrl())) {
        alert('Current tab is not Google Form or form is not in view mode');
    } else {
        chrome.scripting.executeScript({
            target: { tabId: await getCurrentTabId() },
            function: sortQuestion,
        });
    }
});

sortChoiceButton.addEventListener('click', async () => {
    if (!isUrlGoogleForm(await getCurrentTabUrl())) {
        alert('Current tab is not Google Form or form is not in view mode');
    } else {
        chrome.scripting.executeScript({
            target: { tabId: await getCurrentTabId() },
            function: sortChoice,
        });
    }
});

sortBothButton.addEventListener('click', async () => {
    if (!isUrlGoogleForm(await getCurrentTabUrl())) {
        alert('Current tab is not Google Form or form is not in view mode');
    } else {
        chrome.scripting.executeScript({
            target: { tabId: await getCurrentTabId() },
            function: sortQuestion,
        });
        chrome.scripting.executeScript({
            target: { tabId: await getCurrentTabId() },
            function: sortChoice,
        });
    }
});

function sortQuestion() {
    const form = document.querySelector('form');
    const questionsDiv = form.children[1].firstChild.children[1];
    // Original Stack Overflow answer
    // [...questionsDiv.children].sort(compare(a, b)).forEach(node => questionsDiv.appendChild(node));
    chrome.storage.sync.get(['preferences'], ({ preferences }) => {
        if (preferences.questionSortingMode === 'alphabetical') {
            [...questionsDiv.children].sort((a, b)=> {
                const aDataParams = a.firstChild.getAttribute('data-params');
                const bDataParams = b.firstChild.getAttribute('data-params');
                const aName = JSON.parse(aDataParams.replaceAll('%.@.', '['))[0][1];
                const bName = JSON.parse(bDataParams.replaceAll('%.@.', '['))[0][1];
                if (preferences.questionSortingDirection === 'ascending') {
                    return aName.localeCompare(bName, 'en-US', { numeric: true });
                } else if (preferences.questionSortingDirection === 'decending') {
                    return -1 * aName.localeCompare(bName, 'en-US', { numeric: true });
                } else {
                    console.log('Unknown sorting direction');
                    return aName.localeCompare(bName, 'en-US', { numeric: true });
                }
            }).forEach(node => questionsDiv.appendChild(node));
        } else if (preferences.questionSortingMode === 'length') {
            [...questionsDiv.children].sort((a, b) => {
                const aDataParams = a.firstChild.getAttribute('data-params');
                const bDataParams = b.firstChild.getAttribute('data-params');
                const aName = JSON.parse(aDataParams.replaceAll('%.@.', '['))[0][1];
                const bName = JSON.parse(bDataParams.replaceAll('%.@.', '['))[0][1];
                if (preferences.questionSortingDirection === 'ascending') {
                    return aName.length - bName.length;
                } else if (preferences.questionSortingDirection === 'decending') {
                    return bName.length - aName.length;
                } else {
                    console.log('Unknown sorting direction');
                    return aName.length - bName.length;
                }
            }).forEach(node => questionsDiv.appendChild(node));
        } else if (preferences.questionSortingMode === 'id') {
            [...questionsDiv.children].sort((a, b) => {
                const aDataParams = a.firstChild.getAttribute('data-params');
                const bDataParams = b.firstChild.getAttribute('data-params');
                const aID = parseInt(JSON.parse(aDataParams.replaceAll('%.@.', '['))[0][0]);
                const bID = parseInt(JSON.parse(bDataParams.replaceAll('%.@.', '['))[0][0]);
                if (preferences.questionSortingDirection === 'ascending') {
                    return aID  - bID;
                } else if (preferences.questionSortingDirection === 'decending') {
                    return bID  - aID;
                } else {
                    console.log('Unknown sorting direction');
                    return aID  - bID;
                }
            }).forEach(node => questionsDiv.appendChild(node));
        } else {
            console.log('Unknown sorting mode');
            [...questionsDiv.children].sort((a, b)=> {
                const aDataParams = a.firstChild.getAttribute('data-params');
                const bDataParams = b.firstChild.getAttribute('data-params');
                const aName = JSON.parse(aDataParams.replaceAll('%.@.', '['))[0][1];
                const bName = JSON.parse(bDataParams.replaceAll('%.@.', '['))[0][1];
                if (preferences.questionSortingDirection === 'ascending') {
                    return aName.localeCompare(bName, 'en-US', { numeric: true });
                } else if (preferences.questionSortingDirection === 'decending') {
                    return -1 * aName.localeCompare(bName, 'en-US', { numeric: true });
                } else {
                    console.log('Unknown sorting direction');
                    return aName.localeCompare(bName, 'en-US', { numeric: true });
                }
            }).forEach(node => questionsDiv.appendChild(node));
        }
    });
}

function sortChoice() {
    const form = document.querySelector('form');
    const questionsDiv = form.children[1].firstChild.children[1];
    const questionsArray = [...questionsDiv.children];
    chrome.storage.sync.get(['preferences'], ({ preferences }) => {
        questionsArray.forEach((questionNode) => {
            try {
                const choicesDiv = questionNode.firstChild.firstChild.lastChild.previousElementSibling.children[1].firstChild.firstChild.firstChild;
                console.log(choicesDiv);
                if (preferences.choiceSortingMode === 'alphabetical') {
                    [...choicesDiv.children].sort((a, b)=> {
                        const aSpan = a.firstChild.firstChild.children[1].firstChild.firstChild;
                        const bSpan = b.firstChild.firstChild.children[1].firstChild.firstChild;
                        const aName = aSpan.textContent;
                        const bName = bSpan.textContent;
                        if (preferences.choiceSortingDirection === 'ascending') {
                            return aName.localeCompare(bName, 'en-US', { numeric: true });
                        } else if (preferences.choiceSortingDirection === 'decending') {
                            return -1 * aName.localeCompare(bName, 'en-US', { numeric: true });
                        } else {
                            console.log('Unknown sorting direction');
                            return aName.localeCompare(bName, 'en-US', { numeric: true });
                        }
                    }).forEach(node => choicesDiv.appendChild(node));
                } else if (preferences.choiceSortingMode === 'length') {
                    [...choicesDiv.children].sort((a, b) => {
                        const aSpan = a.firstChild.firstChild.children[1].firstChild.firstChild;
                        const bSpan = b.firstChild.firstChild.children[1].firstChild.firstChild;
                        const aName = aSpan.textContent;
                        const bName = bSpan.textContent;
                        if (preferences.choiceSortingDirection === 'ascending') {
                            return aName.length - bName.length;
                        } else if (preferences.choiceSortingDirection === 'decending') {
                            return bName.length - aName.length;
                        } else {
                            console.log('Unknown sorting direction');
                            return aName.length - bName.length;
                        }
                    }).forEach(node => choicesDiv.appendChild(node));
                } else if (preferences.choiceSortingMode === 'id') {
                    [...choicesDiv.children].sort((a, b) => {
                        const aLabel = a.firstChild;
                        const bLabel = b.firstChild;
                        const aID = parseInt(aLabel.getAttribute('for').replaceAll('i', ''));
                        const bID = parseInt(bLabel.getAttribute('for').replaceAll('i', ''));
                        if (preferences.choiceSortingDirection === 'ascending') {
                            return aID  - bID;
                        } else if (preferences.choiceSortingDirection === 'decending') {
                            return bID  - aID;
                        } else {
                            console.log('Unknown sorting direction');
                            return aID  - bID;
                        }
                    }).forEach(node => choicesDiv.appendChild(node));
                } else {
                    console.log('Unknown sorting mode');
                    [...choicesDiv.children].sort((a, b)=> {
                        const aSpan = a.firstChild.firstChild.children[1].firstChild.firstChild;
                        const bSpan = b.firstChild.firstChild.children[1].firstChild.firstChild;
                        const aName = aSpan.textContent;
                        const bName = bSpan.textContent;
                        if (preferences.choiceSortingDirection === 'ascending') {
                            return aName.localeCompare(bName, 'en-US', { numeric: true });
                        } else if (preferences.choiceSortingDirection === 'decending') {
                            return -1 * aName.localeCompare(bName, 'en-US', { numeric: true });
                        } else {
                            console.log('Unknown sorting direction');
                            return aName.localeCompare(bName, 'en-US', { numeric: true });
                        }
                    }).forEach(node => choicesDiv.appendChild(node));
                }
            } catch (e) {
                if (! e instanceof TypeError) {
                    console.log(e);
                    alert('Unknown error has occurred');
                }
            }
        });
    });
}
