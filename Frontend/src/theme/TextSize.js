function TextSize(textSizeSetting) {
    const text_sizes = {
        header1: "undefined", 
        header2: "undefined", 
        header3: "undefined", 
        body: "undefined", 
        small: "undefined", 
    }
    if (textSizeSetting === "large") {
        text_sizes.header1 = "60px";
        text_sizes.header2 = "45px";
        text_sizes.header3 = "30px";
        text_sizes.body = "20px";
        text_sizes.small = "15px";
    } else if (textSizeSetting === "medium") {
        text_sizes.header1 = "45px";
        text_sizes.header2 = "35px";
        text_sizes.header3 = "25px";
        text_sizes.body = "15px";
        text_sizes.small = "10px";
    } else if (textSizeSetting === "small") {
        text_sizes.header1 = "35px";
        text_sizes.header2 = "30px";
        text_sizes.header3 = "20px";
        text_sizes.body = "12px";
        text_sizes.small = "8px";
    }
    return text_sizes;
}

export default TextSize;