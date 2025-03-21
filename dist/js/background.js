"use strict";
//const workdayTableRequest = "/task/2997$4767.htmld";
let currentDay = null;
let currentDayFormatted = null;
let daysEventsList = null;
let totalForToday = null;
function processResponse(message) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    try {
        const response = JSON.parse(message.data);
        if (response.isJson) {
            // current day
            if (((_c = (_b = (_a = response.response) === null || _a === void 0 ? void 0 : _a.body) === null || _b === void 0 ? void 0 : _b.children) === null || _c === void 0 ? void 0 : _c.length) > 0 &&
                response.response.body.children[0].userCurrentDate) {
                console.log(response.response.body.children[0].userCurrentDate);
                const newDay = response.response.body.children[0].userCurrentDate.text;
                if (!currentDay) {
                    currentDay = newDay; //.value.V;
                }
                else if (currentDay !== newDay) {
                    currentDay = newDay;
                    daysEventsList = null;
                }
            }
            // current day formatted
            if (((_f = (_e = (_d = response.response) === null || _d === void 0 ? void 0 : _d.body) === null || _e === void 0 ? void 0 : _e.children) === null || _f === void 0 ? void 0 : _f.length) > 0 &&
                response.response.body.children[0].dayInfo) {
                const filtered = response.response.body.children[0].dayInfo.filter((d) => d.date.text === currentDay);
                if (filtered.length > 0) {
                    currentDayFormatted = filtered[0].formattedDateFull.value;
                    totalForToday = filtered[0].totalForDay.value;
                }
            }
            //chrome.storage.local.set({ workdayTableRequest: json.response });
            if (((_j = (_h = (_g = response.response) === null || _g === void 0 ? void 0 : _g.body) === null || _h === void 0 ? void 0 : _h.children) === null || _j === void 0 ? void 0 : _j.length) > 0 &&
                response.response.body.children[0].consolidatedList) {
                console.log(response.response.body.children[0].consolidatedList);
                const list = response.response.body.children[0].consolidatedList.children;
                if (!daysEventsList || daysEventsList.length < list.length) {
                    daysEventsList = list;
                }
            }
        }
        if (response.url.includes("app_info/hash/widget_with_versions")) {
            console.log(response.response);
        }
    }
    catch (e) {
        console.error(message);
    }
    return true;
}
function processRequest(message, sendResponse) {
    if (message.data.action === "working_hours") {
        if (!currentDay || !daysEventsList) {
            sendResponse(null);
            return true;
        }
        if (daysEventsList.length === 0) {
            sendResponse(null);
            return true;
        }
        let filtered = daysEventsList.filter((day) => day.date.text === currentDay && day.title.value === "Unmatched Check-in");
        if (filtered.length === 0) {
            sendResponse(null);
            return true;
        }
        const day = filtered[0];
        sendResponse({
            data: {
                date: { value: currentDay, formatted: currentDayFormatted },
                totalForToday: totalForToday,
                difference: new Date(Date.now()).getTime() -
                    new Date(`${day.date.value.Y}.${day.date.value.M}.${day.date.value.D}.${day.subtitle1.value}`).getTime(),
            },
        });
        return true;
    }
}
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "response") {
        return processResponse(message);
    }
    else if (message.type === "request") {
        processRequest(message, sendResponse);
    }
});
chrome.runtime.onInstalled.addListener(() => {
    chrome.action.setBadgeText({
        text: "👌",
    });
});
