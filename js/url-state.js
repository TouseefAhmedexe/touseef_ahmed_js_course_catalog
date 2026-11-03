import { LEVELS, SORT_KEYS } from "./data-utils.js";

export const DEFAULT_STATE = { query: "", category: "all", level: "all", sort: "title" };

export function readStateFromUrl(search = window.location.search) {
    const params = new URLSearchParams(search);
    const level = params.get("level") ?? DEFAULT_STATE.level;
    const sort = params.get("sort") ?? DEFAULT_STATE.sort;

    return {
        query: (params.get("q") ?? DEFAULT_STATE.query).trim(),
        category: params.get("category") ?? DEFAULT_STATE.category,
        level: level === "all" || LEVELS.includes(level) ? level : DEFAULT_STATE.level,
        sort: SORT_KEYS.includes(sort) ? sort : DEFAULT_STATE.sort
    };
}

export function buildQueryString(state) {
    const params = new URLSearchParams();

    if (state.query !== "") {
        params.set("q", state.query);
    }

    if (state.category !== DEFAULT_STATE.category) {
        params.set("category", state.category);
    }

    if (state.level !== DEFAULT_STATE.level) {
        params.set("level", state.level);
    }

    if (state.sort !== DEFAULT_STATE.sort) {
        params.set("sort", state.sort);
    }

    return params.toString();
}

export function writeStateToUrl(state) {
    const queryString = buildQueryString(state);
    const address = queryString === "" ? window.location.pathname : `${window.location.pathname}?${queryString}`;

    window.history.replaceState({}, "", address);
}

