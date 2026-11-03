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


export function filterCourses(courses, { query, category, level }) {
    const text = query.trim().toLowerCase();

    return courses.filter((course) => {
        const searchable = `${course.title} ${course.summary} ${course.category}`.toLowerCase();
        const matchesText = text === "" || searchable.includes(text);
        const matchesCategory = category === "all" || course.category === category;
        const matchesLevel = level === "all" || course.level === level;

        return matchesText && matchesCategory && matchesLevel;
    });
}

const getTime = (course) => new Date(course.startDate).getTime();

const sorters = {
    title: (first, second) => first.title.localeCompare(second.title),
    date: (first, second) => getTime(first) - getTime(second),
    "duration-short": (first, second) => first.durationHours - second.durationHours,
    "duration-long": (first, second) => second.durationHours - first.durationHours,
    rating: (first, second) => second.rating - first.rating
};

export const SORT_KEYS = Object.keys(sorters);

export function sortCourses(courses, sortKey) {
    const compare = sorters[sortKey] ?? sorters.title;

    return [...courses].sort(compare);
}

export function groupBy(items, getKey) {
    return items.reduce((groups, item) => {
        const key = getKey(item);

        return { ...groups, [key]: [...(groups[key] ?? []), item] };
    }, {});
}

export function getCategories(courses) {
    const categories = courses.reduce((found, course) => {
        return found.includes(course.category) ? found : [...found, course.category];
    }, []);

    return categories.sort((first, second) => first.localeCompare(second));
}

export function sumMinutes(lessons) {
    return lessons.reduce((total, lesson) => total + lesson.minutes, 0);
}

export function getCatalogStats(courses, lessonsByCourse) {
    const totalHours = courses.reduce((total, course) => total + course.durationHours, 0);
    const totalRating = courses.reduce((total, course) => total + course.rating, 0);
    const lessonCount = courses.reduce((total, course) => total + (lessonsByCourse[course.id]?.length ?? 0), 0);

    return {
        courseCount: courses.length,
        lessonCount,
        totalHours,
        averageRating: courses.length === 0 ? 0 : Math.round((totalRating / courses.length) * 10) / 10
    };
}

export const findInstructor = (instructors, instructorId) => {
    return instructors.find((instructor) => instructor.id === instructorId);
};

