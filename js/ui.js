import { sumMinutes } from "./data-utils.js";

const elements = {
    summarySection: document.getElementById("summary"),
    statGrid: document.getElementById("stat-grid"),
    categoryList: document.getElementById("category-list"),
    dataNotice: document.getElementById("data-notice"),
    filterForm: document.getElementById("filter-form"),
    searchInput: document.getElementById("search-input"),
    categorySelect: document.getElementById("category-select"),
    levelSelect: document.getElementById("level-select"),
    sortSelect: document.getElementById("sort-select"),
    clearButton: document.getElementById("clear-filters"),
    reloadButton: document.getElementById("reload-button"),
    resultCount: document.getElementById("result-count"),
    stateBox: document.getElementById("state-box"),
    stateMessage: document.getElementById("state-message"),
    cancelButton: document.getElementById("cancel-button"),
    retryButton: document.getElementById("retry-button"),
    stateClearButton: document.getElementById("state-clear-button"),
    courseGrid: document.getElementById("course-grid")
};

function pluralize(count, word) {
    return `${count} ${word}${count === 1 ? "" : "s"}`;
}

function makeElement(tag, className, text = "") {
    const element = document.createElement(tag);

    element.className = className;
    element.textContent = text;
    return element;
}

function makeOption(value, text) {
    const option = document.createElement("option");

    option.value = value;
    option.textContent = text;
    return option;
}

function formatDate(isoDate) {
    return new Date(isoDate).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "UTC"
    });
}

export function clearCourses() {
    elements.courseGrid.innerHTML = "";
}

export function hideSummary() {
    elements.summarySection.hidden = true;
}

function setState(kind, message, visibleButtons) {
    const hadFocus = elements.stateBox.contains(document.activeElement);
    const buttons = {
        cancel: elements.cancelButton,
        retry: elements.retryButton,
        clear: elements.stateClearButton
    };

    elements.stateBox.hidden = false;
    elements.stateBox.className = `state-box state-box--${kind}`;
    elements.stateMessage.textContent = message;

    Object.entries(buttons).forEach(([name, button]) => {
        button.hidden = !visibleButtons.includes(name);
    });

    if (hadFocus) {
        buttons[visibleButtons[0]].focus();
    }
}

export function hideState() {
    const hadFocus = elements.stateBox.contains(document.activeElement);

    elements.stateBox.hidden = true;

    if (hadFocus) {
        elements.searchInput.focus();
    }
}

export function showLoading() {
    clearCourses();
    hideSummary();
    elements.resultCount.textContent = "";
    setState("loading", "Loading courses...", ["cancel"]);
}

export function showError(message) {
    setState("error", message, ["retry"]);
}

export function showCancelled(timedOut) {
    if (timedOut) {
        setState("error", "Loading took too long and was stopped. Try again.", ["retry"]);
    } else {
        setState("info", "Loading was cancelled.", ["retry"]);
    }
}

export function showNoRecords(skippedCount) {
    const message = skippedCount > 0
        ? "The course data was loaded, but none of the records could be used."
        : "The data source returned no courses yet. Try reloading later.";

    setState("empty", message, ["retry"]);
}

export function showNoMatches() {
    setState("empty", "No courses match your search. Try other words or clear the filters.", ["clear"]);
}

