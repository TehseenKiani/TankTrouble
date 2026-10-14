const themes = [
    ["STANDARD", "Clean"],
    ["HALLOWEEN", "Halloween"],
    ["CHRISTMAS", "Christmas"],
    ["RANDOM", "Random (seasonal)"]
];

const label = document.createElement("label");
label.id = "mapThemeControl";
label.textContent = "Map theme ";
const select = document.createElement("select");
select.id = "mapTheme";
for (const [value, name] of themes) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = name;
    select.append(option);
}
try {
    const saved = localStorage.getItem("localMapTheme");
    if (themes.some(([value]) => value === saved)) select.value = saved;
} catch { /* The selector also works when storage is unavailable. */ }
select.addEventListener("change", () => {
    try { localStorage.setItem("localMapTheme", select.value); } catch { /* Optional persistence. */ }
});
label.append(select);
document.querySelector("#header").append(label);

export function getSelectedTheme(themeConstants) {
    const key = themes.some(([value]) => value === select.value) ? select.value : "STANDARD";
    return themeConstants[key];
}
