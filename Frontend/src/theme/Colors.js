const pulseColors = {
    green: "#6EEB4D",
    black: "#000",
    white: "#FFFFFF",
    darkOffGrey: "#364232",
    lightOffGrey: "#c5d1c0"
}
function Colors(colorSetting) {
    const themeColors = {
        background: "undefined",
        text: "undefined",
        border: "undefined",
        buttons: "undefined",
        buttonsText: "undefined",
        background2: "undefined",
        green: pulseColors.green,
        black: pulseColors.black,
        white: pulseColors.white
    }
    if (colorSetting === "dark") {
        themeColors.background = pulseColors.black;
        themeColors.text = pulseColors.white;
        themeColors.border = pulseColors.white;
        themeColors.buttons = pulseColors.white;
        themeColors.background2 = pulseColors.darkOffGrey;
    } else if (colorSetting === "light") {
        themeColors.background = pulseColors.white;
        themeColors.text = pulseColors.black;
        themeColors.border = pulseColors.black;
        themeColors.buttons = pulseColors.black;
        themeColors.background2 = pulseColors.lightOffGrey;
    }
    return themeColors;
}
export default Colors;