"use strict";
const workdayTableRequest = "/task/2997$4767.htmld";
function injectScript(src) {
    const s = document.createElement("script");
    s.src = chrome.runtime.getURL(src);
    s.type = "module";
    s.onload = () => s.remove();
    (document.head || document.documentElement).append(s);
}
function waitForAllQuerySelectors(selectors) {
    return new Promise((res, _) => {
        new Promise((resolveInterval, _) => {
            const id = setInterval(() => {
                const resolved = [];
                for (const selector of selectors) {
                    const queryRes = document.querySelectorAll(selector);
                    resolved.push(queryRes && queryRes.length > 0 ? Array.from(queryRes) : null);
                }
                if (resolved.indexOf(null) === -1) {
                    resolveInterval({ id: id, data: resolved });
                }
            }, 500);
        }).then(({ id, data }) => {
            clearInterval(id);
            res(data);
        });
    });
}
function getElementTopPos(e) {
    return pxToNumber(window.getComputedStyle(e).top);
}
function pxToNumber(s) {
    return Number.parseFloat(s.replace("px", ""));
}
function removeTags() {
    waitForAllQuerySelectors([
        "[data-automation-id=entriesContainer]",
        '[label="Worked / Scheduled difference"]',
    ]).then(([containers, differenceTags]) => {
        var _a, _b;
        const container = containers[0];
        console.log("removed tags");
        if (differenceTags) {
            let tagsToShift = [];
            let tagHeight, tagTopPos, tagGap;
            let first = true;
            for (const differenceTag of differenceTags) {
                if (first) {
                    tagHeight = window.getComputedStyle(differenceTag).height;
                    tagTopPos = window.getComputedStyle(differenceTag).top;
                }
                let daySelector = (_a = differenceTag
                    .getAttribute("aria-label")) === null || _a === void 0 ? void 0 : _a.split("|").pop();
                (_b = differenceTag.parentElement) === null || _b === void 0 ? void 0 : _b.removeChild(differenceTag);
                //container?.removeChild(differenceTag);
                let dayTags = document.querySelectorAll(`button[aria-label*="${daySelector}"]`);
                if (dayTags.length === 0) {
                    return;
                }
                let sorted = Array.from(dayTags).sort((a, b) => getElementTopPos(a) - getElementTopPos(b));
                if (first) {
                    tagGap = pxToNumber(tagTopPos !== null && tagTopPos !== void 0 ? tagTopPos : "0") + pxToNumber(tagHeight !== null && tagHeight !== void 0 ? tagHeight : "0");
                    tagGap = getElementTopPos(sorted[0]) - tagGap;
                    first = false;
                }
                tagsToShift.push(...sorted);
            }
            for (const tagToShift of tagsToShift) {
                tagToShift.style.top = `${getElementTopPos(tagToShift) -
                    pxToNumber(tagHeight !== null && tagHeight !== void 0 ? tagHeight : "0") -
                    (tagGap !== null && tagGap !== void 0 ? tagGap : 0)}px`;
            }
        }
    });
}
function addTimeDifference() {
    chrome.runtime
        .sendMessage({
        type: "request",
        data: { action: "working_hours" },
    })
        .then((r) => {
        if (r !== null) {
            console.log((r.data.difference / (1000 * 60 * 60)).toFixed(2));
            waitForAllQuerySelectors([
                `[data-automation-id=calendarWeek] [data-automation-id*="calendarDateCell"][aria-label*="${r.data.date.formatted}"] [data-automation-id="calendarDateHoursAccumulationLabel"]`,
            ]).then(([labels]) => {
                const label = labels[0];
                const newTime = (r.data.totalForToday +
                    r.data.difference / (1000 * 60 * 60)).toFixed(2);
                label.innerHTML = `Hours: ${newTime}`;
            });
        }
    });
}
function runAllTableMutations() {
    removeTags();
    addTimeDifference();
}
// setup
function registerResponseDataPass() {
    const dataHolderId = "responseDataPass"; //sync with request-patch.js
    const dataHolderAttribute = "responseData"; //sync with request-patch.js
    const dataHolder = document.createElement("div");
    dataHolder.setAttribute("id", dataHolderId);
    document.body.appendChild(dataHolder);
    const observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            if (mutation.type == "attributes") {
                // This is where we have access to the response BODY!
                const response = mutation.target.getAttribute(dataHolderAttribute);
                chrome.runtime.sendMessage({
                    type: "response",
                    data: response,
                });
            }
        });
    });
    observer.observe(dataHolder, {
        //configure it to listen to attribute changes
        attributes: true,
    });
}
function observePageNavigation() {
    window.addEventListener("popstate", (e) => {
        var _a, _b;
        if (e.target) {
            const target = e.target;
            const tags = document.querySelectorAll('[label="Worked / Scheduled difference"]');
            if (((_b = (_a = target === null || target === void 0 ? void 0 : target.location) === null || _a === void 0 ? void 0 : _a.href) === null || _b === void 0 ? void 0 : _b.includes(workdayTableRequest)) ||
                tags.length > 0) {
                runAllTableMutations();
                observeTableChanges();
            }
        }
    });
}
function observeTableChanges() {
    let container;
    new Promise((res, _) => {
        let id = setInterval(() => {
            container = document.querySelector("[data-automation-id=entriesContainer]");
            if (!(container === null)) {
                res({ id, container });
            }
        }, 500);
    }).then(({ id, container }) => {
        clearInterval(id);
        const observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                if (mutation.type == "childList") {
                    runAllTableMutations();
                }
            });
        });
        observer.observe(container, {
            childList: true,
        });
    });
}
// run
injectScript("js/request-patch.js");
observePageNavigation();
window.addEventListener("load", () => {
    registerResponseDataPass();
    observeTableChanges();
    runAllTableMutations();
});
