export const pulseColors = {
    green: "#6EEB4D",
    black: "#000000",
    white: "#FFFFFF",
    darkOffGrey: "#364232",
    lightOffGrey: "#c5d1c0"
}
export const hexToRGBA = (hexColor, alpha) => {
    const red = parseInt(hexColor.slice(1, 3), 16);
    const green = parseInt(hexColor.slice(3, 5), 16);
    const blue = parseInt(hexColor.slice(5, 7), 16);
    return "rgba(" + red + ", " + green + ", " + blue + ", " + alpha + ")";
}
export const presetColors = {
    dark: [pulseColors.black, pulseColors.white, pulseColors.lightOffGrey, pulseColors.green],
    light: [pulseColors.white, pulseColors.black, pulseColors.darkOffGrey, pulseColors.green],
    scary: ['#0e0c0c', '#ff7b00', '#ff0000', '#3a2727']
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
    if (colorSetting === 0) {
        themeColors.background = pulseColors.black;
        themeColors.text = pulseColors.white;
        themeColors.border = pulseColors.white;
        themeColors.buttons = pulseColors.white;
        themeColors.background2 = pulseColors.darkOffGrey;
    } else if (colorSetting === 1) {
        themeColors.background = pulseColors.white;
        themeColors.text = pulseColors.black;
        themeColors.border = pulseColors.black;
        themeColors.buttons = pulseColors.black;
        themeColors.background2 = pulseColors.lightOffGrey;
    }
    return themeColors;
}
export default Colors;