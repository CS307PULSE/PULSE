function TextSize(textSizeSetting) {
    const text_sizes = {
        header1: "undefined", 
        header2: "undefined", 
        header3: "undefined", 
        body: "undefined", 
        small: "undefined", 
    }
    if (textSizeSetting == "large") {
        text_sizes.header1 = "100px";
        text_sizes.header2 = "100px";
        text_sizes.header3 = "100px";
        text_sizes.body = "100px";
        text_sizes.small = "100px";
    } else if (textSizeSetting == "medium") {
        text_sizes.header1 = "50px";
        text_sizes.header2 = "50px";
        text_sizes.header3 = "50px";
        text_sizes.body = "50px";
        text_sizes.small = "50px";
    } else if (textSizeSetting == "small") {
        text_sizes.header1 = "25px";
        text_sizes.header2 = "25px";
        text_sizes.header3 = "25px";
        text_sizes.body = "25px";
        text_sizes.small = "25px";
    }
    return text_sizes;
}

export default TextSize;