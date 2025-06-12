import ZeroMd, { STYLES } from "https://cdn.jsdelivr.net/npm/zero-md@3.1.7/dist/index.min.js";

const urlParams = new URLSearchParams(window.location.search);

const sanitize = (e) => window.DOMPurify.sanitize(e);
const element = (e) => document.getElementById(e);
const getParam = (p) => {
  const found = p.find(param => urlParams.get(param));
  return urlParams.get(found);
};

const actualPage = decodeURIComponent(getParam(["page", "p", "md"]) || "home");

async function loadElements(urls) {
  const promises = urls.map(async url => {
    const response = await fetch(url);
    const text = await response.text();
    const sanitized = sanitize(text);

    const id = url.split('/').pop().split('.')[0];

    const el = element(id);
    if (el) el.innerHTML = sanitized;
  });

  await Promise.all(promises);
}

customElements.define("zero-md", class extends ZeroMd {
  async load() {
    await super.load();
    this.setAttribute("no-shadow", "");
    this.template = STYLES.preset("dark");
  }

  async parse(obj) {
    const parsed = await super.parse(obj);
    return (typeof parsed === "string") ? sanitize(parsed) : parsed;
  }
});

document.addEventListener("DOMContentLoaded", async () => {
  const safePage = actualPage.replace(/[^a-zA-Z0-9_-]/g, "");

  const checkAndLoad = async (page) => {
    try {
      const response = await fetch(`pages/${page}.md`, { method: 'HEAD' });
      if (!response.ok) throw new Error("Not found");
      element("mdLoad").src = `pages/${page}.md`;
    } catch {
      element("mdLoad").src = `pages/404.md`;
    }
    
    document.title = `${document.title.split(" - ")[0]} - ${page}`;
  };

  await checkAndLoad(safePage);
  await loadElements([
    "../elements/header.html",
    "../elements/footer.html",
  ]);
});