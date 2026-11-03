import { loadCatalog, REQUEST_TIMEOUT_MS } from "./api.js";
import {
    filterCourses,
    findInstructor,
    getCatalogStats,
    getCategories,
    groupBy,
    normalizeCourse,
    normalizeInstructor,
    normalizeLesson,
    normalizeList,
    sortCourses
} from "./data-utils.js";
import { readStateFromUrl, writeStateToUrl } from "./url-state.js";
import {
    clearCourses,
    fillCategoryOptions,
    hideState,
    renderCourses,
    renderSummary,
    showCancelled,
    showError,
    showLoading,
    showNoMatches,
    showNoRecords,
    showResultCount,
    writeControls
} from "./ui.js";

let state = readStateFromUrl();
let catalog = null;
let activeController = null;

function prepareCatalog({ courses, lessons, instructors }) {
    const courseResult = normalizeList(courses, normalizeCourse);
    const lessonResult = normalizeList(lessons, normalizeLesson);
    const instructorResult = normalizeList(instructors, normalizeInstructor);
    const orderedLessons = [...lessonResult.valid].sort((first, second) => first.order - second.order);

    return {
        courses: courseResult.valid,
        instructors: instructorResult.valid,
        lessonsByCourse: groupBy(orderedLessons, (lesson) => lesson.courseId),
        skippedCount: courseResult.skippedCount + lessonResult.skippedCount + instructorResult.skippedCount
    };
}

function updateCourses() {
    const matches = sortCourses(filterCourses(catalog.courses, state), state.sort);

    showResultCount(matches.length, catalog.courses.length);

    if (matches.length === 0) {
        clearCourses();
        showNoMatches();
        return;
    }

    hideState();
    renderCourses(matches.map((course) => ({
        course,
        instructor: findInstructor(catalog.instructors, course.instructorId),
        lessons: catalog.lessonsByCourse[course.id] ?? []
    })));
}

function displayCatalog() {
    if (catalog.courses.length === 0) {
        clearCourses();
        showNoRecords(catalog.skippedCount);
        return;
    }

    const categories = getCategories(catalog.courses);
    const category = categories.includes(state.category) ? state.category : "all";

    state = { ...state, category };
    fillCategoryOptions(categories);
    writeControls(state);
    writeStateToUrl(state);
    renderSummary(
        getCatalogStats(catalog.courses, catalog.lessonsByCourse),
        groupBy(catalog.courses, (course) => course.category),
        catalog.skippedCount
    );
    updateCourses();
}

async function loadData() {
    if (activeController !== null) {
        activeController.abort();
    }

    const controller = new AbortController();
    let timedOut = false;
    const timeoutId = window.setTimeout(() => {
        timedOut = true;
        controller.abort();
    }, REQUEST_TIMEOUT_MS);

    activeController = controller;
    catalog = null;
    showLoading();

    try {
        const rawData = await loadCatalog(controller.signal);

        if (controller !== activeController) {
            return;
        }

        catalog = prepareCatalog(rawData);
        displayCatalog();
    } catch (error) {
        if (controller !== activeController) {
            return;
        }

        if (error.name === "AbortError") {
            showCancelled(timedOut);
        } else {
            showError(error.message);
        }
    } finally {
        window.clearTimeout(timeoutId);

        if (controller === activeController) {
            activeController = null;
        }
    }
}

writeControls(state);
loadData();

