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


function buildLessonSection(lessons) {
    if (lessons.length === 0) {
        return makeElement("p", "course-card__note", "No lessons have been published yet.");
    }

    const details = makeElement("details", "course-card__lessons");
    const summary = makeElement("summary", "", `Lessons (${lessons.length}, ${pluralize(sumMinutes(lessons), "minute")})`);
    const list = makeElement("ol", "lesson-list");

    lessons.forEach((lesson) => {
        list.append(makeElement("li", "", `${lesson.title} - ${lesson.minutes} min`));
    });

    details.append(summary, list);
    return details;
}

function buildCourseCard({ course, instructor, lessons }) {
    const card = makeElement("article", "course-card");
    const facts = makeElement("ul", "course-card__facts");
    const factLines = [
        `Instructor: ${instructor?.name ?? "Not assigned yet"}`,
        `Starts: ${formatDate(course.startDate)}`,
        `Duration: ${pluralize(course.durationHours, "hour")}`,
        `Rating: ${course.rating} / 5`
    ];

    factLines.forEach((line) => facts.append(makeElement("li", "", line)));

    card.append(
        makeElement("p", "course-card__category", `${course.category} | ${course.level}`),
        makeElement("h3", "course-card__title", course.title),
        makeElement("p", "course-card__summary", course.summary || "No description yet."),
        facts,
        buildLessonSection(lessons)
    );

    return card;
}

export function renderCourses(cards) {
    clearCourses();
    elements.courseGrid.append(...cards.map((card) => buildCourseCard(card)));
}

export function showResultCount(shown, total) {
    elements.resultCount.textContent = `Showing ${shown} of ${pluralize(total, "course")}.`;
}

export function renderSummary(stats, categoryGroups, skippedCount) {
    const statItems = [
        { label: "Courses", value: stats.courseCount },
        { label: "Lessons", value: stats.lessonCount },
        { label: "Total hours", value: stats.totalHours },
        { label: "Average rating", value: `${stats.averageRating} / 5` }
    ];

    elements.statGrid.innerHTML = "";
    statItems.forEach(({ label, value }) => {
        const card = makeElement("div", "stat-card");

        card.append(makeElement("span", "stat-value", String(value)), makeElement("span", "stat-label", label));
        elements.statGrid.append(card);
    });

    elements.categoryList.innerHTML = "";
    Object.entries(categoryGroups).forEach(([category, items]) => {
        elements.categoryList.append(makeElement("li", "tag", `${category}: ${items.length}`));
    });

    elements.dataNotice.hidden = skippedCount === 0;
    elements.dataNotice.textContent = skippedCount === 0
        ? ""
        : `${pluralize(skippedCount, "record")} in the data could not be used and ${skippedCount === 1 ? "was" : "were"} skipped.`;

    elements.summarySection.hidden = false;
}

export function fillCategoryOptions(categories) {
    const options = [
        makeOption("all", "All categories"),
        ...categories.map((category) => makeOption(category, category))
    ];

    elements.categorySelect.innerHTML = "";
    elements.categorySelect.append(...options);
}

export function readControls() {
    return {
        query: elements.searchInput.value.trim(),
        category: elements.categorySelect.value || "all",
        level: elements.levelSelect.value,
        sort: elements.sortSelect.value
    };
}

export function writeControls(state) {
    elements.searchInput.value = state.query;
    elements.categorySelect.value = state.category;
    elements.levelSelect.value = state.level;
    elements.sortSelect.value = state.sort;
}

export function bindControls({ onSearch, onChange, onClear, onReload, onCancel, onRetry }) {
    elements.filterForm.addEventListener("submit", (event) => event.preventDefault());
    elements.searchInput.addEventListener("input", onSearch);

    [elements.categorySelect, elements.levelSelect, elements.sortSelect].forEach((select) => {
        select.addEventListener("change", onChange);
    });

    elements.clearButton.addEventListener("click", onClear);
    elements.stateClearButton.addEventListener("click", onClear);
    elements.reloadButton.addEventListener("click", onReload);
    elements.cancelButton.addEventListener("click", onCancel);
    elements.retryButton.addEventListener("click", onRetry);
}

