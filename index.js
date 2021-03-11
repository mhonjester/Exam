const fs = require("fs");
const puppeteer = require("puppeteer");
const storeProducts = require("./data.json");

function getAllProducts() {
  const products = storeProducts.Products;

  return console.log(products);
}

(async function scrapeProducts(url) {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);
    const content = {};

    const [el] = await page.$x('//*[@id="product-price-33412"]');
    const id = await el.getProperty("id");
    let srcId = await id.jsonValue();

    const [el1] = await page.$x(
      '//*[@id="m-navigation-product-list-wrapper"]/div[3]/ol/li[1]/div/div/strong/a'
    );
    const name = await el1.getProperty("textContent");
    let rawText = await name.jsonValue();

    const [el2] = await page.$x(
      '//*[@id="m-navigation-product-list-wrapper"]/div[3]/ol/li[1]/div/a/span/span/img'
    );
    const img = await el2.getProperty("src");
    const srcImg = await img.jsonValue();

    const [el3] = await page.$x('//*[@id="product-price-33412"]/span/text()');
    const price = await el3.getProperty("textContent");
    const rawNumber = await price.jsonValue();

    srcId = srcId.slice(14, srcId.length);
    rawText = rawText.slice(15, rawText.length).trim();

    console.log(srcId, rawText, srcImg, rawNumber);
    const validation = storeProducts.Products.some(
      (items) => items.name === rawText || items.id === srcId
    );
    if (validation) return console.log(`ERROR: Duplicate found!`);

    content.id = srcId;
    content.name = rawText;
    content.image = srcImg;
    content.price = rawNumber;
    content.currency = "MYR";

    storeProducts.Products.push(content);

    fs.writeFile(
      "data.json",
      JSON.stringify(storeProducts, null, 2),
      (err, data) => {
        return err ? err : data;
      }
    );

    browser.close();
  } catch (err) {
    return console.log(err);
  }
})("https://www.senheng.com.my/computers-laptops/pc-peripherals.html");

// getAllProducts();
