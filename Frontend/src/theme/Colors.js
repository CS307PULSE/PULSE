const pulseColors = {
    green: "#6EEB4D",
    black: "#000",
    white: "#FFFFFF",
    darkGrey: "#3D423E"
}
function Colors(colorSetting) {
    const themeColors = {
        background: "undefined",
        text: "undefined",
        buttons: "undefined",
        background2: "undefined"
    }
    if (colorSetting === "dark") {
        themeColors.background = pulseColors.black;
        themeColors.text = pulseColors.green;
        themeColors.buttons = pulseColors.white;
        themeColors.background2 = pulseColors.darkGrey;
    } else if (colorSetting === "light") {
        themeColors.background = pulseColors.white;
        themeColors.text = pulseColors.green;
        themeColors.buttons = pulseColors.black;
        themeColors.background2 = pulseColors.darkGrey;
    }
    return themeColors;
}
export default Colors;