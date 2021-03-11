const puppeteer = require("puppeteer");
const storage = require("./data.json");
const fs = require("fs");

async function scrapeProducts(pageUrl) {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(pageUrl);
    await page.waitForSelector(".product-items");

    const products = await page.$$("li.product-item");

    for (const product of products) {
      const ids = await product.$$eval(
        "div.price-box.price-final_price",
        (elem) => elem.map((e) => e.getAttribute("data-product-id"))
      );

      const names = await product.$(".product-item-link");
      const productNames = await names.getProperty("textContent");
      let nameResult = await productNames.jsonValue();
      nameResult = nameResult.slice(15, nameResult.length).trim();

      const image = await product.$(".product-image-photo");
      const imageUrl = await image.getProperty("src");
      const imageResult = await imageUrl.jsonValue();

      const price = await product.$$eval("span.price-wrapper", (elem) =>
        elem.map((e) => e.getAttribute("data-price-amount"))
      );

      const duplicates = storage.Products.filter((item) => item.id === ids[0]);
      console.log(duplicates);

      const duplicateProducts = storage.Products.some(
        (item) =>
          item.name === nameResult ||
          (item.id === ids[0] && ids[0] !== undefined)
      );

      if (duplicateProducts) continue;

      let allProducts = {};

      allProducts.id = ids[0] === undefined ? "N/A" : ids[0];
      allProducts.name = nameResult;
      allProducts.images = imageResult;
      allProducts.price = price[0] === undefined ? "N/A" : price[0];
      allProducts.currency = "MYR";
      storage.Products.push(allProducts);

      await fs.writeFile(
        "data.json",
        JSON.stringify(storage, null, 2),
        (err, data) => {
          return err ? err : data;
        }
      );

      console.log(`DONE!`);
      console.log(storage.Products.length);
    }

    browser.close();
  } catch (err) {
    return console.log(err);
  }
}

scrapeProducts(
  "https://www.senheng.com.my/computers-laptops/pc-peripherals.html"
);
scrapeProducts(
  "https://www.senheng.com.my/computers-laptops/pc-peripherals.html?p=1"
);
scrapeProducts(
  "https://www.senheng.com.my/computers-laptops/pc-peripherals.html?p=2"
);
scrapeProducts(
  "https://www.senheng.com.my/computers-laptops/pc-peripherals.html?p=3"
);
scrapeProducts(
  "https://www.senheng.com.my/computers-laptops/pc-peripherals.html?p=4"
);
