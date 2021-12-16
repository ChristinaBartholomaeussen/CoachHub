function escapeHTML(string) {
    string = string.replaceAll("&", "&amp;");
    string = string.replaceAll(">", "&gt;");
    string = string.replaceAll("<", "&lt;");
    string = string.replaceAll('"', "&quot;");
    string = string.replaceAll("'", "&#039;");
    return string;
}