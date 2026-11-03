const COURSES_URL = "data/courses.json";
const LESSONS_URL = "data/lessons.json";
const INSTRUCTORS_URL = "data/instructors.json";

export const REQUEST_TIMEOUT_MS = 8000;

function createApiError(kind, message) {
    const error = new Error(message);

    error.kind = kind;
    return error;
}

function getStatusMessage(status) {
    if (status === 404) {
        return "A data file was not found (404). Check the file names in the data folder.";
    }

    if (status >= 500) {
        return `The server had a problem (${status}). Try again in a moment.`;
    }

    return `The request failed with status ${status}.`;
}

export async function fetchJson(url, signal) {
    let response;

    try {
        response = await fetch(url, { headers: { Accept: "application/json" }, signal });
    } catch (error) {
        if (error.name === "AbortError") {
            throw error;
        }

        throw createApiError("network", "The data could not be reached. Check your connection and try again.");
    }

    if (!response.ok) {
        throw createApiError("http", getStatusMessage(response.status));
    }

    const text = await response.text();

    if (text.trim() === "") {
        throw createApiError("empty", "The server sent an empty response.");
    }

    try {
        return JSON.parse(text);
    } catch (error) {
        throw createApiError("json", `The data is not valid JSON (${error.message}).`);
    }
}

function expectArray(data, name) {
    if (!Array.isArray(data)) {
        throw createApiError("data", `The ${name} data has an unexpected format. A list was expected.`);
    }

    return data;
}

export async function loadCatalog(signal) {
    const [courses, lessons, instructors] = await Promise.all([
        fetchJson(COURSES_URL, signal),
        fetchJson(LESSONS_URL, signal),
        fetchJson(INSTRUCTORS_URL, signal)
    ]);

    return {
        courses: expectArray(courses, "course"),
        lessons: expectArray(lessons, "lesson"),
        instructors: expectArray(instructors, "instructor")
    };
}

