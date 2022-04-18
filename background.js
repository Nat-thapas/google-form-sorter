const preferences = {
    'questionSortingMode' : 'alphabetical',
    'questionSortingDirection' : 'ascending',
    'choiceSortingMode' : 'alphabetical',
    'choiceSortingDirection' : 'ascending'
};

chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.set({ preferences });
    console.log('Default preferences has been set');
});
