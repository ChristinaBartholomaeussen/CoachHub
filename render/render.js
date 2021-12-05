import fs from "fs";

const nav = fs.readFileSync("./public/components/nav/nav.html", "utf-8");

const adminNav = fs.readFileSync("./public/components/nav/navAdmin.html", "utf-8");

const footer = fs.readFileSync("./public/components/footer/footer.html", "utf-8");




export function createPage(path, options) {
    return (nav + fs.readFileSync(`./public/pages/${path}`, "utf-8") + footer)
        .replace("%%DOCUMENT_TITLE%%", options?.title || "Nodefolio")
        .replace("%%SCRIPT_PLACEHOLDER%%", options?.scriptTag || "");
};


export function createAdminPage(path, options) {
    return (adminNav + fs.readFileSync(`./public/pages/${path}`, "utf-8") + footer)
        .replace("%%DOCUMENT_TITLE%%", options?.title || "Nodefolio")
        .replace("%%SCRIPT_PLACEHOLDER%%", options?.scriptTag || "");
};


