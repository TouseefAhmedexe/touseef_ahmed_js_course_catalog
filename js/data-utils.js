export const LEVELS = ["Beginner", "Intermediate", "Advanced"];

export function normalizeCourse(record) {
    if (record === null || typeof record !== "object") {
        return null;
    }

    const { id, title, category, level, durationHours, startDate, rating, instructorId, summary } = record;
    const hours = Number(durationHours);
    const score = Number(rating);

    if (typeof id !== "string" || id.trim() === "") {
        return null;
    }

    if (typeof title !== "string" || title.trim() === "") {
        return null;
    }

    if (!Number.isFinite(hours) || hours <= 0) {
        return null;
    }

    if (typeof startDate !== "string" || Number.isNaN(new Date(startDate).getTime())) {
        return null;
    }

    return {
        id: id.trim(),
        title: title.trim(),
        category: typeof category === "string" && category.trim() !== "" ? category.trim() : "Other",
        level: LEVELS.includes(level) ? level : "Beginner",
        durationHours: hours,
        startDate,
        rating: Number.isFinite(score) ? Math.min(Math.max(score, 0), 5) : 0,
        instructorId: typeof instructorId === "string" ? instructorId : "",
        summary: typeof summary === "string" ? summary.trim() : ""
    };
}

export function normalizeLesson(record) {
    if (record === null || typeof record !== "object") {
        return null;
    }

    const { id, courseId, title, minutes, order } = record;
    const length = Number(minutes);
    const position = Number(order);

    if (typeof id !== "string" || typeof courseId !== "string") {
        return null;
    }

    if (typeof title !== "string" || title.trim() === "") {
        return null;
    }

    if (!Number.isFinite(length) || length <= 0) {
        return null;
    }

    return {
        id,
        courseId,
        title: title.trim(),
        minutes: length,
        order: Number.isFinite(position) ? position : 0
    };
}

export function normalizeInstructor(record) {
    if (record === null || typeof record !== "object") {
        return null;
    }

    const { id, name, role } = record;

    if (typeof id !== "string" || typeof name !== "string" || name.trim() === "") {
        return null;
    }

    return {
        id,
        name: name.trim(),
        role: typeof role === "string" ? role.trim() : ""
    };
}

export function normalizeList(records, normalizeRecord) {
    const valid = records
        .map((record) => normalizeRecord(record))
        .filter((record) => record !== null);

    return { valid, skippedCount: records.length - valid.length };
}

