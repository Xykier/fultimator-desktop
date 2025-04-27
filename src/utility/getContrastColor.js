function getContrastColor(hexcolor) {
    if (!hexcolor) return "#000"; // fallback
    hexcolor = hexcolor.replace("#", "");
  
    // convert to RGB
    const r = parseInt(hexcolor.substr(0, 2), 16);
    const g = parseInt(hexcolor.substr(2, 2), 16);
    const b = parseInt(hexcolor.substr(4, 2), 16);
  
    // calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
    return luminance > 0.6 ? "#000" : "#fff"; // dark text on light bg, light text on dark bg
  }
  
  export default getContrastColor;